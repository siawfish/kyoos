import { io, Socket } from 'socket.io-client';
import { getItemFromStorage } from './asyncStorage';
import { refreshUserSession } from './authRefresh';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

/** Align with jools-server `authenticateSocket` error messages that a fresh access token may fix */
const RECOVERABLE_AUTH_MESSAGES = new Set([
    'Authentication failed',
    'Invalid token',
    'Token is invalid',
    'Authentication token required',
]);

const MAX_AUTH_RECOVERY_ATTEMPTS = 3;

class SocketService {
    private socket: Socket | null = null;
    private isConnecting = false;
    private authFailurePending = false;
    private recoveryInProgress = false;
    private authRecoveryAttempts = 0;

    private attachAuthHealHandlers(socket: Socket) {
        socket.io.on('reconnect_attempt', async () => {
            const t = await getItemFromStorage('token');
            if (t) {
                socket.auth = { ...socket.auth, token: t };
            }
        });

        socket.on('error', (error: { message?: string }) => {
            const msg = typeof error?.message === 'string' ? error.message : '';
            if (RECOVERABLE_AUTH_MESSAGES.has(msg)) {
                this.authFailurePending = true;
            }
            console.log('Socket error:', error);
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            if (reason === 'io server disconnect' && this.authFailurePending) {
                this.authFailurePending = false;
                void this.recoverFromAuthFailure();
            }
        });
    }

    private async recoverFromAuthFailure() {
        if (this.recoveryInProgress || !this.socket) {
            return;
        }
        if (this.authRecoveryAttempts >= MAX_AUTH_RECOVERY_ATTEMPTS) {
            console.log('Socket: auth recovery max attempts reached');
            return;
        }

        this.recoveryInProgress = true;
        this.authRecoveryAttempts += 1;

        const delayMs = Math.min(400 * this.authRecoveryAttempts, 2000);
        await new Promise((r) => setTimeout(r, delayMs));

        try {
            const accessToken = await refreshUserSession();
            if (!accessToken || !this.socket) {
                return;
            }
            this.socket.auth = { token: accessToken };
            this.socket.connect();
        } catch (e) {
            console.log('Socket auth recovery failed:', e);
        } finally {
            this.recoveryInProgress = false;
        }
    }

    /**
     * Initialize and connect to the socket server
     */
    async connect(): Promise<Socket | null> {
        if (this.socket?.connected) {
            return this.socket;
        }

        if (this.isConnecting) {
            // Wait for the connection to complete
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (this.socket?.connected) {
                        clearInterval(checkInterval);
                        resolve(this.socket);
                    }
                }, 100);

                // Timeout after 10 seconds
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve(null);
                }, 10000);
            });
        }

        try {
            this.isConnecting = true;
            const token = await getItemFromStorage('token');

            if (!token) {
                console.log('No auth token found');
                this.isConnecting = false;
                return null;
            }

            this.socket = io(SOCKET_URL, {
                auth: {
                    token,
                },
                transports: ['websocket'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
            });

            this.authRecoveryAttempts = 0;
            this.authFailurePending = false;

            this.attachAuthHealHandlers(this.socket);

            this.socket.on('connect', () => {
                console.log('Socket connected:', this.socket?.id);
            });

            this.socket.on('connect_error', (error) => {
                console.log('Socket connection error:', error);
            });

            // Wait for connection
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Connection timeout'));
                }, 10000);

                this.socket?.once('connect', () => {
                    clearTimeout(timeout);
                    resolve();
                });

                this.socket?.once('connect_error', (err) => {
                    clearTimeout(timeout);
                    reject(err);
                });
            });

            this.isConnecting = false;
            return this.socket;
        } catch (error) {
            console.log('Failed to connect socket:', error);
            this.isConnecting = false;
            this.socket = null;
            return null;
        }
    }

    /**
     * Disconnect from the socket server
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.authFailurePending = false;
        this.authRecoveryAttempts = 0;
    }

    /**
     * Get the socket instance
     */
    getSocket(): Socket | null {
        return this.socket;
    }

    /**
     * Check if socket is connected
     */
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    /**
     * Join a conversation room
     */
    joinConversation(conversationId: string) {
        if (this.socket?.connected) {
            this.socket.emit('conversation:join', conversationId);
        }
    }

    /**
     * Leave a conversation room
     */
    leaveConversation(conversationId: string) {
        if (this.socket?.connected) {
            this.socket.emit('conversation:leave', conversationId);
        }
    }

    private static readonly SEND_TIMEOUT_MS = 15_000;

    /**
     * Send a message. Returns a Promise that resolves when the server emits
     * `message:sent` with the matching tempId, or rejects on error/timeout.
     */
    sendMessage(conversationId: string, content?: string, media?: any[], tempId?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.socket?.connected) {
                return reject(new Error('Socket is not connected'));
            }

            let settled = false;
            const cleanup = () => {
                clearTimeout(timer);
                this.socket?.off('message:sent', onSent);
                this.socket?.off('message:send:error', onError);
            };
            const settle = (fn: () => void) => {
                if (settled) return;
                settled = true;
                cleanup();
                fn();
            };

            const timer = setTimeout(() => {
                settle(() => reject(new Error('Message send timed out')));
            }, SocketService.SEND_TIMEOUT_MS);

            const onSent = (data: any) => {
                if (data?.tempId === tempId) {
                    settle(() => resolve(data));
                }
            };

            const onError = (data: any) => {
                if (data?.tempId === tempId) {
                    settle(() => reject(new Error(data?.error || 'Failed to send message')));
                }
            };

            this.socket.on('message:sent', onSent);
            this.socket.on('message:send:error', onError);

            this.socket.emit('message:send', { conversationId, content, media, tempId });
        });
    }

    /**
     * Acknowledge that a message was delivered to this client.
     */
    acknowledgeDelivery(messageId: string, conversationId: string) {
        if (this.socket?.connected) {
            this.socket.emit('message:delivered', { messageId, conversationId });
        }
    }

    /**
     * Mark messages as read
     */
    markAsRead(conversationId: string) {
        if (this.socket?.connected) {
            this.socket.emit('message:read', { conversationId });
        }
    }

    /**
     * Edit a message
     */
    editMessage(messageId: string, content: string) {
        if (this.socket?.connected) {
            this.socket.emit('message:edit', { messageId, content });
        }
    }

    /**
     * Delete a message
     */
    deleteMessage(messageId: string) {
        if (this.socket?.connected) {
            this.socket.emit('message:delete', { messageId });
        }
    }

    /**
     * Start typing indicator
     */
    startTyping(conversationId: string) {
        if (this.socket?.connected) {
            this.socket.emit('typing:start', { conversationId });
        }
    }

    /**
     * Stop typing indicator
     */
    stopTyping(conversationId: string) {
        if (this.socket?.connected) {
            this.socket.emit('typing:stop', { conversationId });
        }
    }

    /**
     * Listen for events
     */
    on(event: string, callback: (...args: any[]) => void) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    /**
     * Remove event listener
     */
    off(event: string, callback?: (...args: any[]) => void) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event?: string) {
        if (this.socket) {
            this.socket.removeAllListeners(event);
        }
    }
}

// Export a singleton instance
const socketService = new SocketService();
export default socketService;

import { io, Socket } from 'socket.io-client';
import { getItemFromStorage } from './asyncStorage';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

class SocketService {
    private socket: Socket | null = null;
    private isConnecting = false;

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
                console.error('No auth token found');
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

            // Setup event listeners
            this.socket.on('connect', () => {
                console.log('Socket connected:', this.socket?.id);
            });

            this.socket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
            });

            this.socket.on('error', (error) => {
                console.error('Socket error:', error);
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            // Wait for connection
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Connection timeout'));
                }, 10000);

                this.socket?.on('connect', () => {
                    clearTimeout(timeout);
                    resolve();
                });

                this.socket?.on('connect_error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });

            this.isConnecting = false;
            return this.socket;
        } catch (error) {
            console.error('Failed to connect socket:', error);
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

    /**
     * Send a message
     */
    sendMessage(conversationId: string, content?: string, media?: any[]) {
        if (this.socket?.connected) {
            this.socket.emit('message:send', {
                conversationId,
                content,
                media,
            });
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

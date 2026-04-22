import { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socketService from '@/services/socket';
import { actions } from '@/redux/messaging/slice';
import { Message } from '@/redux/messaging/types';
import { selectUser } from '@/redux/app/selector';

/**
 * Custom hook to manage Socket.io messaging events
 */
export const useMessaging = (conversationId?: string) => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const [isConnected, setIsConnected] = useState(socketService.isConnected());
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const stopTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Connect to Socket.io server
     */
    const connect = useCallback(async () => {
        try {
            const socket = await socketService.connect();
            if (socket) {
                setIsConnected(true);
                console.log('Socket connected for messaging');
            }
        } catch (error) {
            console.error('Failed to connect socket:', error);
            setIsConnected(false);
        }
    }, []);

    /**
     * Disconnect from Socket.io server
     */
    const disconnect = useCallback(() => {
        socketService.disconnect();
        setIsConnected(false);
    }, []);

    /**
     * Join a conversation room
     */
    const joinConversation = useCallback((convId: string) => {
        socketService.joinConversation(convId);
    }, []);

    /**
     * Leave a conversation room
     */
    const leaveConversation = useCallback((convId: string) => {
        socketService.leaveConversation(convId);
    }, []);

    /**
     * Send a typing indicator (debounced)
     */
    const sendTypingIndicator = useCallback((convId: string) => {
        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Send typing start after 300ms delay
        typingTimeoutRef.current = setTimeout(() => {
            socketService.startTyping(convId);

            // Auto-stop typing after 2 seconds
            if (stopTypingTimeoutRef.current) {
                clearTimeout(stopTypingTimeoutRef.current);
            }
            stopTypingTimeoutRef.current = setTimeout(() => {
                socketService.stopTyping(convId);
            }, 2000);
        }, 300);
    }, []);

    /**
     * Stop typing indicator
     */
    const stopTypingIndicator = useCallback((convId: string) => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        if (stopTypingTimeoutRef.current) {
            clearTimeout(stopTypingTimeoutRef.current);
        }
        socketService.stopTyping(convId);
    }, []);

    /**
     * Edit a message
     */
    const editMessage = useCallback((messageId: string, content: string) => {
        socketService.editMessage(messageId, content);
    }, []);

    /**
     * Delete a message
     */
    const deleteMessage = useCallback((messageId: string) => {
        socketService.deleteMessage(messageId);
    }, []);

    /**
     * Track socket connection state changes
     */
    useEffect(() => {
        const socket = socketService.getSocket();
        if (!socket) return;

        const handleConnect = () => {
            console.log('Socket connected');
            setIsConnected(true);
        };

        const handleDisconnect = () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);

        // Check initial connection state
        setIsConnected(socket.connected);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
        };
    }, []);

    /**
     * Setup Socket.io event listeners.
     * Only the root instance (no conversationId) registers listeners to avoid
     * duplicate handlers when both _layout.tsx and [id].tsx use this hook.
     */
    useEffect(() => {
        if (conversationId) return;
        if (!isConnected) return;

        const socket = socketService.getSocket();
        if (!socket) return;

        const handleMessageNew = (message: Message) => {
            dispatch(actions.messageReceived({ ...message, currentUserId: user?.id }));

            if (user?.id && message.senderId !== user.id && message.id) {
                socketService.acknowledgeDelivery(message.id, message.conversationId);
            }
        };

        const handleMessageEdited = (data: {
            messageId: string;
            content: string;
            editedAt: string;
        }) => {
            dispatch(actions.messageEdited(data));
        };

        const handleMessageDeleted = (data: {
            messageId: string;
            deletedAt: string;
        }) => {
            dispatch(actions.messageDeleted(data));
        };

        const handleMessageStatus = (data: {
            conversationId?: string;
            messageId?: string;
            status: string;
            readBy?: string;
            messageIds?: string[];
        }) => {
            if (data.messageId) {
                dispatch(actions.messageStatusUpdated({ messageId: data.messageId, status: data.status }));
            }
            if (data.conversationId && data.messageIds && data.messageIds.length > 0) {
                dispatch(actions.messagesMarkedAsRead({ conversationId: data.conversationId, messageIds: data.messageIds }));
            } else if (data.conversationId && data.status === 'READ') {
                dispatch(actions.messagesMarkedAsRead({ conversationId: data.conversationId }));
            }
        };

        const handleTypingStart = (data: {
            conversationId: string;
            userId: string;
            userName: string;
        }) => {
            dispatch(actions.userStartedTyping(data));
        };

        const handleTypingStop = (data: {
            conversationId: string;
            userId: string;
        }) => {
            dispatch(actions.userStoppedTyping(data));
        };

        const handleError = (error: { message: string }) => {
            console.error('Socket error:', error);
        };

        socket.on('message:new', handleMessageNew);
        socket.on('message:edited', handleMessageEdited);
        socket.on('message:deleted', handleMessageDeleted);
        socket.on('message:status', handleMessageStatus);
        socket.on('typing:start', handleTypingStart);
        socket.on('typing:stop', handleTypingStop);
        socket.on('error', handleError);

        return () => {
            socket.off('message:new', handleMessageNew);
            socket.off('message:edited', handleMessageEdited);
            socket.off('message:deleted', handleMessageDeleted);
            socket.off('message:status', handleMessageStatus);
            socket.off('typing:start', handleTypingStart);
            socket.off('typing:stop', handleTypingStop);
            socket.off('error', handleError);
        };
    }, [conversationId, dispatch, user?.id, isConnected]);

    /**
     * Auto-join conversation when conversationId changes
     */
    useEffect(() => {
        if (conversationId) {
            joinConversation(conversationId);
            return () => {
                leaveConversation(conversationId);
            };
        }
    }, [conversationId, joinConversation, leaveConversation]);

    /**
     * Cleanup typing timeouts on unmount
     */
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (stopTypingTimeoutRef.current) {
                clearTimeout(stopTypingTimeoutRef.current);
            }
        };
    }, []);

    return {
        connect,
        disconnect,
        joinConversation,
        leaveConversation,
        sendTypingIndicator,
        stopTypingIndicator,
        editMessage,
        deleteMessage,
        isConnected,
    };
};

import { useCallback, useEffect, useRef } from 'react';
import useSocket from './useSocket';

const useTypingIndicator = (receiverId) => {
    const socket = useSocket();
    const typingTimeoutRef = useRef(null);

    const stopTyping = useCallback(() => {
        if (!socket || !receiverId) return;

        socket.emit('typing_stop', { receiverId });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    }, [socket, receiverId]);

    const startTyping = useCallback(() => {
        if (!socket || !receiverId) return;

        socket.emit('typing_start', { receiverId });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, 2000);
    }, [socket, receiverId, stopTyping]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            stopTyping();
        };
    }, [stopTyping]);

    return { startTyping, stopTyping };
};

export default useTypingIndicator;
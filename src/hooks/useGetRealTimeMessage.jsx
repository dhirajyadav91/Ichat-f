import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addMessage, setMessages } from "../redux/messageSlice";

const useGetRealTimeMessage = () => {
    const { socket } = useSelector(store => store.socket);
    const { messages } = useSelector(store => store.message);
    const { selectedUser } = useSelector(store => store.user);
    const dispatch = useDispatch();
    
    // Use ref to always get latest messages without dependency issues
    const messagesRef = useRef();
    messagesRef.current = messages;

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            // Check if this message is for the current conversation
            const isRelevantMessage = 
                newMessage.senderId === selectedUser?._id || 
                newMessage.receiverId === selectedUser?._id;

            if (isRelevantMessage) {
                // Check if message already exists to prevent duplicates
                const messageExists = messagesRef.current?.some(
                    msg => msg._id === newMessage._id || 
                    (msg.isTemp && msg._id === newMessage.tempId)
                );

                if (!messageExists) {
                    dispatch(addMessage(newMessage));
                }
            }
        };

        const handleMessageUpdate = (updatedMessage) => {
            // Update existing message (e.g., status changes, edits)
            if (messagesRef.current) {
                const updatedMessages = messagesRef.current.map(msg =>
                    msg._id === updatedMessage._id ? updatedMessage : msg
                );
                dispatch(setMessages(updatedMessages));
            }
        };

        const handleMessageDelete = (deletedMessageId) => {
            // Remove deleted message
            if (messagesRef.current) {
                const filteredMessages = messagesRef.current.filter(
                    msg => msg._id !== deletedMessageId
                );
                dispatch(setMessages(filteredMessages));
            }
        };

        // Socket event listeners
        socket.on("newMessage", handleNewMessage);
        socket.on("messageUpdated", handleMessageUpdate);
        socket.on("messageDeleted", handleMessageDelete);
        socket.on("messageRead", handleMessageUpdate); // For read receipts

        // Cleanup function
        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messageUpdated", handleMessageUpdate);
            socket.off("messageDeleted", handleMessageDelete);
            socket.off("messageRead", handleMessageUpdate);
        };
    }, [socket, selectedUser?._id, dispatch]);

    return null;
};

export default useGetRealTimeMessage;
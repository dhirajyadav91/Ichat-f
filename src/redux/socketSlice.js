// hooks/useSocket.js - UPDATED WITH STATUS FUNCTIONS
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { addMessage, updateMessageStatus } from '../redux/messageSlice';

const useSocket = () => {
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const { authUser } = useSelector(store => store.user);

  useEffect(() => {
    if (!authUser) return;

    const API_URL = 'http://localhost:8080';
    
    console.log("🔌 Socket connecting for user:", authUser.fullName);
    
    socketRef.current = io(API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      query: {
        userId: authUser._id
      }
    });

    // Socket event listeners
    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected:', socketRef.current.id);
      
      // Join user's personal room
      socketRef.current.emit('joinUser', authUser._id);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socketRef.current.on('error', (error) => {
      console.error('💥 Socket error:', error);
    });

    // ✅ REAL-TIME: Listen for new messages
    socketRef.current.on('newMessage', (message) => {
      console.log('📩 New message received:', message);
      dispatch(addMessage(message));
    });

    // ✅ MESSAGE STATUS: Listen for message delivery status
    socketRef.current.on('messageDelivered', (data) => {
      console.log('📨 Message delivered:', data);
      dispatch(updateMessageStatus({
        messageId: data.messageId,
        status: 'delivered'
      }));
    });

    // ✅ MESSAGE STATUS: Listen for message read status
    socketRef.current.on('messageRead', (data) => {
      console.log('👀 Message read:', data);
      dispatch(updateMessageStatus({
        messageId: data.messageId,
        status: 'read'
      }));
    });

    // ✅ MESSAGE STATUS: Listen for message seen status
    socketRef.current.on('messageSeen', (data) => {
      console.log('👁️ Message seen:', data);
      dispatch(updateMessageStatus({
        messageId: data.messageId,
        status: 'seen'
      }));
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        console.log('🧹 Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [authUser, dispatch]);

  // ✅ Function to send message via socket
  const sendMessage = (messageData) => {
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', messageData);
    }
  };

  // ✅ Function to mark messages as read
  const markAsRead = (messageIds, receiverId) => {
    if (socketRef.current) {
      socketRef.current.emit('markAsRead', {
        messageIds,
        receiverId,
        senderId: authUser?._id
      });
      console.log('📖 Marking as read:', messageIds);
    }
  };

  // ✅ Function to mark messages as seen
  const markAsSeen = (messageIds, receiverId) => {
    if (socketRef.current) {
      socketRef.current.emit('markAsSeen', {
        messageIds,
        receiverId,
        senderId: authUser?._id
      });
      console.log('👁️ Marking as seen:', messageIds);
    }
  };

  return {
    socket: socketRef.current,
    sendMessage,
    markAsRead,
    markAsSeen
  };
};

export default useSocket;
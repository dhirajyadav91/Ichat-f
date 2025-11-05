import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { addMessage, updateMessageStatus, updateMessagesStatus } from '../redux/messageSlice';

const useSocket = () => {
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const { authUser } = useSelector(store => store.user);

  useEffect(() => {
    if (!authUser) {
      console.log("🔌 No auth user, skipping socket connection");
      return;
    }

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    
    console.log("🔌 Socket connecting for user:", authUser.fullName);
    
    try {
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
        // Join user room
        socketRef.current.emit('joinUser', authUser._id);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('💥 Socket connection error:', error);
      });

      // ✅ FIXED: Listen for message sent status
      socketRef.current.on('messageSent', (data) => {
        console.log('📤 MESSAGE SENT EVENT RECEIVED:', data);
        if (data.messageId) {
          dispatch(updateMessageStatus({
            messageId: data.messageId,
            status: 'sent'
          }));
        }
      });

      // ✅ FIXED: Listen for message delivery status
      socketRef.current.on('messageDelivered', (data) => {
        console.log('📨 MESSAGE DELIVERED EVENT RECEIVED:', data);
        if (data.messageId) {
          dispatch(updateMessageStatus({
            messageId: data.messageId,
            status: 'delivered'
          }));
        }
      });

      // ✅ FIXED: Listen for message read status
      socketRef.current.on('messageRead', (data) => {
        console.log('👀 MESSAGE READ EVENT RECEIVED:', data);
        if (data.messageIds && Array.isArray(data.messageIds)) {
          dispatch(updateMessagesStatus({
            messageIds: data.messageIds,
            status: 'read'
          }));
        }
      });

      // ✅ FIXED: Listen for message seen status
      socketRef.current.on('messageSeen', (data) => {
        console.log('👁️ MESSAGE SEEN EVENT RECEIVED:', data);
        if (data.messageIds && Array.isArray(data.messageIds)) {
          dispatch(updateMessagesStatus({
            messageIds: data.messageIds,
            status: 'seen'
          }));
        }
      });

      // ✅ FIXED: Listen for new messages
      socketRef.current.on('newMessage', (message) => {
        console.log('📩 NEW MESSAGE RECEIVED:', message);
        dispatch(addMessage(message));
      });

      // ✅ Debug: Log all socket events
      socketRef.current.onAny((eventName, ...args) => {
        console.log(`🎯 Socket event [${eventName}]:`, args);
      });

    } catch (error) {
      console.error('💥 Socket initialization error:', error);
    }

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
    if (socketRef.current && socketRef.current.connected) {
      try {
        socketRef.current.emit('sendMessage', messageData);
        console.log('📤 Message sent via socket:', messageData);
        return true;
      } catch (error) {
        console.error('❌ Error sending message via socket:', error);
        return false;
      }
    } else {
      console.log('⚠️ Socket not connected, message not sent via socket');
      return false;
    }
  };

  // ✅ FIXED: Function to mark messages as read
  const markAsRead = (messageIds, senderId) => {
    if (socketRef.current && socketRef.current.connected && authUser) {
      try {
        const ids = Array.isArray(messageIds) ? messageIds : [messageIds];
        const data = {
          messageIds: ids,
          receiverId: authUser._id, // Current user is marking as read
          senderId: senderId // The user who sent these messages
        };
        
        socketRef.current.emit('markAsRead', data);
        console.log('📖 Mark as read emitted:', data);
        return true;
      } catch (error) {
        console.error('❌ Error marking as read:', error);
        return false;
      }
    } else {
      console.log('⚠️ Socket not connected, cannot mark as read');
      return false;
    }
  };

  // ✅ FIXED: Function to mark messages as seen
  const markAsSeen = (messageIds, senderId) => {
    if (socketRef.current && socketRef.current.connected && authUser) {
      try {
        const ids = Array.isArray(messageIds) ? messageIds : [messageIds];
        const data = {
          messageIds: ids,
          receiverId: authUser._id, // Current user is marking as seen
          senderId: senderId // The user who sent these messages
        };
        
        socketRef.current.emit('markAsSeen', data);
        console.log('👁️ Mark as seen emitted:', data);
        return true;
      } catch (error) {
        console.error('❌ Error marking as seen:', error);
        return false;
      }
    } else {
      console.log('⚠️ Socket not connected, cannot mark as seen');
      return false;
    }
  };

  return {
    socket: socketRef.current,
    sendMessage,
    markAsRead,
    markAsSeen,
    isConnected: socketRef.current?.connected || false
  };
};

export default useSocket;
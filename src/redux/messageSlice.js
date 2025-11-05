import { createSlice } from '@reduxjs/toolkit';

const messageSlice = createSlice({
  name: 'message',
  initialState: {
    messages: [],
    loading: false,
    error: null,
    hasMore: true, // ✅ Add pagination state
  },
  reducers: {
    addMessage: (state, action) => {
      const existingIndex = state.messages.findIndex(
        msg => msg._id === action.payload._id
      );
      
      if (existingIndex === -1) {
        state.messages.push(action.payload);
      } else {
        state.messages[existingIndex] = action.payload;
      }
      
      // Sort by timestamp
      state.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    },

    // ✅ ADD THIS: Add multiple messages (for pagination)
    addMessages: (state, action) => {
      const newMessages = action.payload;
      
      if (!Array.isArray(newMessages)) return;
      
      // Filter out duplicates
      const uniqueMessages = newMessages.filter(newMsg => 
        !state.messages.some(existingMsg => existingMsg._id === newMsg._id)
      );
      
      // Add to beginning for older messages
      state.messages = [...uniqueMessages, ...state.messages];
      
      // Update hasMore based on response
      state.hasMore = newMessages.length > 0;
      
      console.log(`✅ Added ${uniqueMessages.length} new messages, total: ${state.messages.length}`);
    },

    // ✅ FIXED: Update multiple messages status
    updateMessagesStatus: (state, action) => {
      const { messageIds, status } = action.payload;
      
      console.log('🔄 Updating messages status in Redux:', { messageIds, status });
      
      state.messages = state.messages.map(msg => {
        if (messageIds.includes(msg._id)) {
          console.log(`✅ Updated message ${msg._id} from ${msg.status} to ${status}`);
          return {
            ...msg,
            status: status,
            updatedAt: new Date().toISOString()
          };
        }
        return msg;
      });
    },

    // ✅ FIXED: Update single message status
    updateMessageStatus: (state, action) => {
      const { messageId, status, newMessage } = action.payload;
      
      console.log('🔄 Updating single message status:', { messageId, status });
      
      const messageIndex = state.messages.findIndex(msg => 
        msg._id === messageId || (msg.tempId === messageId) || (msg.isTemp && msg._id === messageId)
      );
      
      if (messageIndex !== -1) {
        if (newMessage) {
          // Replace temp message with real message
          state.messages[messageIndex] = {
            ...newMessage,
            status: status
          };
          console.log(`✅ Replaced temp message with real message: ${newMessage._id}`);
        } else {
          // Just update status
          state.messages[messageIndex] = {
            ...state.messages[messageIndex],
            status: status
          };
          console.log(`✅ Updated message status to: ${status}`);
        }
      } else {
        console.log(`❌ Message not found for status update: ${messageId}`);
      }
    },

    setMessages: (state, action) => {
      state.messages = action.payload;
      state.hasMore = action.payload.length > 0; // Reset hasMore when setting new messages
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },

    // ✅ ADD THIS: Reset messages when changing users
    resetMessages: (state) => {
      state.messages = [];
      state.loading = false;
      state.error = null;
      state.hasMore = true;
    }
  },
});

export const { 
  addMessage, 
  addMessages, // ✅ Export addMessages
  updateMessageStatus, 
  updateMessagesStatus,
  setMessages,
  setLoading,
  setError,
  resetMessages // ✅ Export resetMessages
} = messageSlice.actions;
export default messageSlice.reducer;
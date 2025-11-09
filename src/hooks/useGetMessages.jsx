// hooks/useGetMessages.jsx - FIXED ENDPOINTS
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../api/axiosConfig";
import { setMessages, setLoading, setError, addMessages, resetMessages } from "../redux/messageSlice";
import toast from 'react-hot-toast';

const useGetMessages = () => {
  const { selectedUser } = useSelector((store) => store.user);
  const { messages, hasMore } = useSelector((store) => store.message);
  const dispatch = useDispatch();
  const [isFetching, setIsFetching] = useState(false);

  // ✅ FIXED: Remove /api/v1 from endpoints since baseURL already includes it
  const loadMore = async () => {
    if (!selectedUser?._id || !hasMore || isFetching) {
      console.log('⏸️ Cannot load more:', { 
        hasUser: !!selectedUser?._id, 
        hasMore, 
        isFetching 
      });
      return;
    }
    
    try {
      setIsFetching(true);
      console.log(`📩 Loading more messages for: ${selectedUser._id}, offset: ${messages.length}`);
      
      // ✅ FIXED: Use only /message since baseURL has /api/v1
      const res = await axiosInstance.get(`/message/${selectedUser._id}`, {
        params: {
          offset: messages.length,
          limit: 20
        }
      });

      if (res.status === 200) {
        const newMessages = res.data.messages || res.data || [];
        
        if (newMessages.length > 0) {
          dispatch(addMessages(newMessages));
          console.log(`✅ Loaded ${newMessages.length} more messages, total: ${messages.length + newMessages.length}`);
        } else {
          console.log("📭 No more messages to load");
          toast.success("All messages loaded");
        }
      }
    } catch (error) {
      console.error("❌ Error loading more messages:", error);
      toast.error("Failed to load older messages");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    // ✅ Reset messages when user changes
    dispatch(resetMessages());

    // ✅ Prevent API call if user is not selected
    if (!selectedUser?._id) {
      console.log('👤 No user selected, skipping messages fetch');
      return;
    }

    const fetchMessages = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log("🔐 No token found, skipping messages fetch");
        toast.error("Please login again");
        return;
      }

      try {
        setIsFetching(true);
        dispatch(setLoading(true));
        dispatch(setError(null));

        // ✅ FIXED: Use only /message since baseURL has /api/v1
        console.log(`📩 Fetching messages from: /message/${selectedUser._id}`);
        console.log("🔐 Token present:", !!token);

        const res = await axiosInstance.get(`/message/${selectedUser._id}`, {
          params: {
            limit: 50
          }
        });

        if (res.status === 200) {
          const messagesData = res.data.messages || res.data || [];
          dispatch(setMessages(messagesData));
          console.log(`✅ Loaded ${messagesData.length} messages for ${selectedUser.fullName}`);
          
          if (messagesData.length > 20) {
            toast.success(`Loaded ${messagesData.length} messages`);
          }
        } else {
          throw new Error("Unexpected response status");
        }
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
        
        // ✅ BETTER ERROR HANDLING
        let errorMessage = "Failed to load messages. Please try again.";
        
        if (error.response?.status === 404) {
          errorMessage = "Messages endpoint not found. Please check API configuration.";
          console.error("🔍 404 Error - Check if backend has /api/v1/message/:userId endpoint");
        } else if (error.response?.status === 401) {
          errorMessage = "Session expired. Please login again.";
          localStorage.removeItem('authToken');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        dispatch(setError(errorMessage));
        toast.error(errorMessage);
        dispatch(setMessages([]));
      } finally {
        dispatch(setLoading(false));
        setIsFetching(false);
      }
    };

    const timeoutId = setTimeout(fetchMessages, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [selectedUser?._id, dispatch]);

  return { 
    isFetching, 
    loadMore,
    hasMore
  };
};

export default useGetMessages;
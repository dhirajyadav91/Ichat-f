import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../api/axiosConfig";
import { setMessages, setLoading, setError, addMessages, resetMessages } from "../redux/messageSlice";
import toast from 'react-hot-toast'; // ✅ ADD THIS IMPORT

const useGetMessages = () => {
  const { selectedUser } = useSelector((store) => store.user);
  const { messages, hasMore } = useSelector((store) => store.message);
  const dispatch = useDispatch();
  const [isFetching, setIsFetching] = useState(false);

  // ✅ IMPROVED: loadMore function for pagination
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
      
      const res = await axiosInstance.get(`/api/v1/message/${selectedUser._id}`, {
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
          toast.success("All messages loaded"); // ✅ Optional: notify user
        }
      }
    } catch (error) {
      console.error("❌ Error loading more messages:", error);
      toast.error("Failed to load older messages"); // ✅ NOW THIS WILL WORK
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
        toast.error("Please login again"); // ✅ ADDED: User feedback
        return;
      }

      try {
        setIsFetching(true);
        dispatch(setLoading(true));
        dispatch(setError(null));

        console.log(`📩 Fetching messages from: /api/v1/message/${selectedUser._id}`);
        console.log("🔐 Token present:", !!token);

        const res = await axiosInstance.get(`/api/v1/message/${selectedUser._id}`, {
          params: {
            limit: 50 // ✅ Get recent messages first
          }
        });

        if (res.status === 200) {
          const messagesData = res.data.messages || res.data || [];
          dispatch(setMessages(messagesData));
          console.log(`✅ Loaded ${messagesData.length} messages for ${selectedUser.fullName}`);
          
          // ✅ Optional: Show success toast for large message loads
          if (messagesData.length > 20) {
            toast.success(`Loaded ${messagesData.length} messages`);
          }
        } else {
          throw new Error("Unexpected response status");
        }
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to load messages. Please try again.";
        dispatch(setError(errorMessage));
        
        // ✅ Show error toast to user
        toast.error(errorMessage);

        // Set empty array on error
        dispatch(setMessages([]));
        
        if (error.response?.status === 401) {
          console.log("🔐 Authentication failed in messages fetch");
          localStorage.removeItem('authToken');
          toast.error("Session expired. Please login again.");
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      } finally {
        dispatch(setLoading(false));
        setIsFetching(false);
      }
    };

    // ✅ Add slight delay to prevent rapid API calls
    const timeoutId = setTimeout(fetchMessages, 100);
    
    return () => {
      clearTimeout(timeoutId);
      // Don't reset messages here to avoid flickering during user switch
    };
  }, [selectedUser?._id, dispatch]);

  // ✅ RETURN both isFetching and loadMore
  return { 
    isFetching, 
    loadMore,
    hasMore // ✅ Also return hasMore for UI
  };
};

export default useGetMessages;
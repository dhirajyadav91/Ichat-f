// hooks/useGetOtherUsers.js - FIXED VERSION
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../api/axiosConfig";
import { setOtherUsers, setUsersLoading, setUsersError } from '../redux/userSlice';
import toast from 'react-hot-toast'; // ✅ Add this import

const useGetOtherUsers = () => {
  const dispatch = useDispatch();
  const { authUser, otherUsers } = useSelector((store) => store.user);
  const [isLoading, setIsLoading] = useState(false);

  console.log("🔄 useGetOtherUsers - State:", {
    authUser: authUser ? `✅ ${authUser.fullName}` : '❌ No auth user',
    token: localStorage.getItem('authToken') ? '✅ Present' : '❌ Missing'
  });

  const refetch = useCallback(async () => {
    console.log("🔄 Manual refetch triggered");
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log("❌ No token found");
      toast.error("Please login again"); // ✅ Now toast is defined
      return;
    }

    setIsLoading(true);
    dispatch(setUsersLoading(true));

    try {
      console.log("🚀 Fetching users...");
      const res = await axiosInstance.get("/api/v1/user");
      
      console.log("✅ Users response:", res.data);
      
      if (res.data.success) {
        dispatch(setOtherUsers(res.data.users || []));
        toast.success(`Loaded ${res.data.users?.length || 0} users`); // ✅ Success message
      } else if (Array.isArray(res.data)) {
        // Direct array response
        dispatch(setOtherUsers(res.data));
        toast.success(`Loaded ${res.data.length} users`);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      dispatch(setUsersError(error.message));
      toast.error("Failed to load users"); // ✅ Error message
    } finally {
      dispatch(setUsersLoading(false));
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    console.log("🎯 useEffect running - authUser:", !!authUser);
    
    // ✅ ALWAYS try to fetch when authUser is available
    if (authUser) {
      console.log("🚀 AuthUser available, fetching users...");
      refetch();
    }
  }, [authUser, refetch]);

  return { 
    isLoading, 
    refetch,
    loading: isLoading
  };
};

export default useGetOtherUsers;
// hooks/useGetOtherUsers.js - FIXED VERSION
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../api/axiosConfig"; // make sure baseURL includes /api/v1
import { setOtherUsers, setUsersLoading, setUsersError } from '../redux/userSlice';
import toast from 'react-hot-toast';

const useGetOtherUsers = () => {
  const dispatch = useDispatch();
  const { authUser, otherUsers } = useSelector((store) => store.user);
  const [isLoading, setIsLoading] = useState(false);

  console.log("🔄 useGetOtherUsers - Initial State:", {
    authUser: authUser ? `✅ ${authUser.fullName}` : '❌ No auth user',
    token: localStorage.getItem('authToken') ? '✅ Present' : '❌ Missing',
    existingUsers: otherUsers?.length || 0
  });

  const refetch = useCallback(async () => {
    console.log("🔄 Manual refetch triggered");

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log("❌ No token found");
      toast.error("Please login again");
      return;
    }

    setIsLoading(true);
    dispatch(setUsersLoading(true));

    try {
      console.log("🚀 Fetching users from API...");
      // FIXED endpoint: only /user because baseURL includes /api/v1
      const res = await axiosInstance.get("/user");

      console.log("✅ API Response FULL:", res);
      console.log("✅ API Response DATA:", res.data);

      if (res.data.success && Array.isArray(res.data.users)) {
        console.log("📝 Dispatching users to Redux:", res.data.users);
        dispatch(setOtherUsers(res.data.users));
        toast.success(`Loaded ${res.data.users.length} users`);
      } else {
        console.log("❌ Unexpected response format:", res.data);
        throw new Error("Invalid response format: " + JSON.stringify(res.data));
      }
    } catch (error) {
      console.error("❌ API Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      dispatch(setUsersError(error.message));
      toast.error("Failed to load users: " + (error.response?.data?.message || error.message));
    } finally {
      dispatch(setUsersLoading(false));
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    console.log("🎯 useEffect running - authUser:", !!authUser);

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

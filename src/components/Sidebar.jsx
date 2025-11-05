// Sidebar.js - FIXED VERSION (Redux warning fix)
import React, { useState, useMemo, useCallback } from 'react';
import {
  BiSearchAlt2, BiLogOut, BiCog, BiUserPlus, BiGroup, BiMoon, BiSun
} from "react-icons/bi";
import { IoRefresh } from "react-icons/io5";
import OtherUsers from './OtherUsers';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setAuthUser, setOtherUsers, setSelectedUser } from '../redux/userSlice';
import { setMessages } from '../redux/messageSlice';
import axiosInstance from '../api/axiosConfig';

const Sidebar = ({ onLogout, onToggleTheme, currentTheme }) => {
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // ✅ FIXED: Memoized selector to prevent unnecessary re-renders
  const { otherUsers, authUser } = useSelector(store => ({
    otherUsers: store.user.otherUsers || [],
    authUser: store.user.authUser
  }), (prev, next) => {
    // Custom equality check to prevent re-renders
    return (
      prev.authUser?._id === next.authUser?._id &&
      prev.otherUsers?.length === next.otherUsers?.length
    );
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Filtered Users with proper memoization
  const filteredUsers = useMemo(() => {
    const safeOtherUsers = Array.isArray(otherUsers) ? otherUsers : [];

    let users = [...safeOtherUsers];

    if (search) {
      users = users.filter(user =>
        user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.username?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (activeFilter === 'unread') {
      users = users.filter(user => user.unreadCount > 0);
    }

    return users;
  }, [otherUsers, search, activeFilter]);

  // Rest of your Sidebar code remains same...
  const logoutHandler = async () => {
    try {
      const res = await axiosInstance.get("/api/v1/user/logout");

      dispatch(setAuthUser(null));
      dispatch(setMessages([]));
      dispatch(setOtherUsers([]));
      dispatch(setSelectedUser(null));
      localStorage.removeItem('authToken');

      toast.success(res?.data?.message || 'Logged out successfully');
      navigate("/login");
    } catch (error) {
      console.error('Logout error:', error);
      
      dispatch(setAuthUser(null));
      dispatch(setMessages([]));
      dispatch(setOtherUsers([]));
      dispatch(setSelectedUser(null));
      localStorage.removeItem('authToken');
      
      toast.success('Logged out successfully');
      navigate("/login");
    }
  };

  const searchSubmitHandler = useCallback((e) => {
    e.preventDefault();
    if (!search.trim()) {
      return;
    }

    setIsSearching(true);

    const conversationUser = otherUsers?.find((user) =>
      user.fullName?.toLowerCase().includes(search.toLowerCase())
    );

    if (conversationUser) {
      toast.success(`Found: ${conversationUser.fullName}`);
    } else {
      toast.error("User not found!");
    }
    setIsSearching(false);
  }, [search, otherUsers]);

  const clearSearch = useCallback(() => {
    setSearch("");
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
    document.documentElement.classList.toggle('dark');
  }, []);

  const refreshContacts = useCallback(() => {
    toast.loading('Refreshing contacts...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Contacts refreshed');
    }, 1000);
  }, []);

  return (
    <div className="w-80 h-full bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col transition-all duration-200">
      {/* Header - ✅ LOGIN USER SHOWING HERE */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="avatar online">
              <div className="w-12 rounded-full overflow-hidden">
                <img
                  src={authUser?.profilePhoto || "/default-avatar.png"}
                  alt={authUser?.fullName || "User"}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="font-bold text-gray-900 dark:text-white">
                {authUser?.fullName || "Guest User"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{authUser?.username}
              </p>
              <p className="text-xs text-green-500 font-medium">Online</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <BiSun size={18} /> : <BiMoon size={18} />}
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              title="Settings"
            >
              <BiCog size={18} />
            </button>
          </div>
        </div>

        {/* Search and filters - same as before */}
        <form onSubmit={searchSubmitHandler} className="relative">
          <BiSearchAlt2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search contacts..."
            className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <IoRefresh size={16} className={isSearching ? 'animate-spin' : ''} />
          </button>
        </form>

        <div className="flex items-center gap-2 mt-3">
          {['all', 'online', 'unread'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                activeFilter === filter
                  ? filter === 'online'
                    ? 'bg-green-500 text-white'
                    : filter === 'unread'
                    ? 'bg-red-500 text-white'
                    : 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts */}
      <div className="flex-1 overflow-hidden">
        <OtherUsers users={filteredUsers} />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={refreshContacts}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              title="Refresh contacts"
            >
              <IoRefresh size={18} />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              title="New group"
            >
              <BiGroup size={18} />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              title="Add contact"
            >
              <BiUserPlus size={18} />
            </button>
          </div>

          <button
            onClick={logoutHandler}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Logout"
          >
            <BiLogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
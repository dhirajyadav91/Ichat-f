import React, { useState, useMemo, useCallback } from 'react'
import { 
    Search, 
    Users, 
    UserPlus, 
    RefreshCw,
    SortAsc,
    SortDesc
} from 'lucide-react';
import OtherUser from './OtherUser';
import useGetOtherUsers from '../hooks/useGetOtherUsers';
import { useSelector } from "react-redux";

const OtherUsers = () => {
    const { loading, error, refetch } = useGetOtherUsers();
    const { otherUsers, onlineUsers } = useSelector(store => store.user);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterOnline, setFilterOnline] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const filteredAndSortedUsers = useMemo(() => {
        if (!otherUsers) return [];

        let users = [...otherUsers];

        if (searchTerm) {
            users = users.filter(user =>
                user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterOnline) {
            users = users.filter(user => onlineUsers?.includes(user._id));
        }

        users.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'online':
                    aValue = onlineUsers?.includes(a._id) ? 1 : 0;
                    bValue = onlineUsers?.includes(b._id) ? 1 : 0;
                    break;
                case 'recent':
                    aValue = new Date(a.lastSeen || 0).getTime();
                    bValue = new Date(b.lastSeen || 0).getTime();
                    break;
                case 'name':
                default:
                    aValue = a.fullName?.toLowerCase();
                    bValue = b.fullName?.toLowerCase();
                    break;
            }

            if (sortOrder === 'desc') {
                return aValue < bValue ? 1 : -1;
            }
            return aValue > bValue ? 1 : -1;
        });

        return users;
    }, [otherUsers, searchTerm, sortBy, sortOrder, filterOnline, onlineUsers]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await refetch();
        } catch (error) {
            console.error('Error refreshing users:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [refetch]);

    const toggleSortOrder = useCallback(() => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    }, []);

    const onlineCount = useMemo(() => {
        return otherUsers?.filter(user => onlineUsers?.includes(user._id)).length || 0;
    }, [otherUsers, onlineUsers]);

    const LoadingSkeleton = () => (
        <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex gap-3 p-3 animate-pulse">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-zinc-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-1/2"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    const ErrorState = () => (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Failed to load users
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                There was an error loading the user list. Please try again.
            </p>
            <button 
                onClick={handleRefresh}
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
                <RefreshCw className="w-4 h-4" />
                Try Again
            </button>
        </div>
    );

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No users found' : 'No users available'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                {searchTerm 
                    ? `No users match "${searchTerm}". Try adjusting your search.`
                    : 'There are no other users to display at the moment.'
                }
            </p>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800">
            <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Contacts
                    </h2>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh contacts"
                        >
                            <RefreshCw 
                                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                            />
                        </button>
                        <button 
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            title="Add new contact"
                        >
                            <UserPlus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <button
                            onClick={() => setFilterOnline(!filterOnline)}
                            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                                filterOnline
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                            }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${
                                filterOnline ? 'bg-white' : 'bg-green-500'
                            }`}></div>
                            Online ({onlineCount})
                        </button>

                        <div className="flex items-center gap-1">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="name">Name</option>
                                <option value="online">Online</option>
                                <option value="recent">Recent</option>
                            </select>
                            <button
                                onClick={toggleSortOrder}
                                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors"
                            >
                                {sortOrder === 'asc' ? 
                                    <SortAsc className="w-4 h-4" /> : 
                                    <SortDesc className="w-4 h-4" />
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {loading ? (
                    <div className="p-4">
                        <LoadingSkeleton />
                    </div>
                ) : error ? (
                    <ErrorState />
                ) : filteredAndSortedUsers.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {filteredAndSortedUsers.map((user) => (
                            <OtherUser 
                                key={user._id} 
                                user={user}
                                unreadCount={user.unreadCount || 0}
                                lastMessage={user.lastMessage}
                                isPinned={user.isPinned}
                                isMuted={user.isMuted}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-gray-200 dark:border-zinc-800">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                        {filteredAndSortedUsers.length} of {otherUsers?.length || 0} contacts
                    </span>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{onlineCount} online</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OtherUsers;
import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { 
    Check, 
    CheckCheck, 
    Clock, 
    MoreVertical, 
    VolumeX,
    Pin
} from 'lucide-react';
import { setSelectedUser } from '../redux/userSlice';

const OtherUser = ({ user, unreadCount = 0, lastMessage, isPinned = false, isMuted = false }) => {
    const dispatch = useDispatch();
    const { selectedUser, onlineUsers, authUser } = useSelector(store => store.user);
    const [showMenu, setShowMenu] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Memoized calculations for better performance
    const userInfo = useMemo(() => {
        const isOnline = onlineUsers?.includes(user._id);
        const isSelected = selectedUser?._id === user._id;
        const hasUnread = unreadCount > 0;

        return { isOnline, isSelected, hasUnread };
    }, [onlineUsers, user._id, selectedUser?._id, unreadCount]);

    // Format last message time
    const formattedTime = useMemo(() => {
        if (!lastMessage?.createdAt) return '';
        
        const messageTime = new Date(lastMessage.createdAt);
        const now = new Date();
        const diffHours = (now - messageTime) / (1000 * 60 * 60);
        
        if (diffHours < 24) {
            return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffHours < 168) {
            return messageTime.toLocaleDateString([], { weekday: 'short' });
        } else {
            return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    }, [lastMessage?.createdAt]);

    // Truncate last message text
    const truncatedMessage = useMemo(() => {
        if (!lastMessage?.message) return 'Start a conversation';
        
        const message = lastMessage.message;
        return message.length > 35 ? message.substring(0, 35) + '...' : message;
    }, [lastMessage?.message]);

    // Get message status icon
    const getMessageStatus = () => {
        if (!lastMessage || lastMessage.senderId !== authUser?._id) return null;
        
        switch (lastMessage.status) {
            case 'sent':
                return <Check size={14} className="text-gray-400" />;
            case 'delivered':
                return <CheckCheck size={14} className="text-gray-400" />;
            case 'read':
                return <CheckCheck size={14} className="text-blue-500" />;
            default:
                return <Clock size={14} className="text-gray-400" />;
        }
    };

    const selectedUserHandler = () => {
        dispatch(setSelectedUser(user));
        setShowMenu(false);
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const handleMenuAction = (action, e) => {
        e.stopPropagation();
        setShowMenu(false);
        
        switch (action) {
            case 'pin':
                // Implement pin conversation
                console.log('Pin conversation:', user._id);
                break;
            case 'mute':
                // Implement mute conversation
                console.log('Mute conversation:', user._id);
                break;
            case 'archive':
                // Implement archive conversation
                console.log('Archive conversation:', user._id);
                break;
            case 'delete':
                // Implement delete conversation
                console.log('Delete conversation:', user._id);
                break;
            default:
                break;
        }
    };

    // Fallback avatar component
    const FallbackAvatar = () => (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
            {user?.fullName?.charAt(0).toUpperCase()}
        </div>
    );

    return (
        <div 
            onClick={selectedUserHandler}
            className={`
                relative group p-3 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-zinc-700
                ${userInfo.isSelected 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
                    : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                }
                ${userInfo.hasUnread ? 'bg-blue-25 dark:bg-blue-900/10' : ''}
            `}
        >
            <div className="flex gap-3 items-start">
                {/* Avatar with online status */}
                <div className="relative flex-shrink-0">
                    {imageError ? (
                        <FallbackAvatar />
                    ) : (
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                            <img 
                                src={user?.profilePhoto} 
                                alt={user?.fullName}
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                            />
                        </div>
                    )}
                    
                    {/* Online status indicator */}
                    {userInfo.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900"></div>
                    )}
                    
                    {/* Pinned indicator */}
                    {isPinned && (
                        <div className="absolute -top-1 -left-1">
                            <Pin size={12} className="text-yellow-500 fill-yellow-500" />
                        </div>
                    )}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <h3 className={`
                                font-semibold truncate
                                ${userInfo.hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}
                                ${userInfo.isSelected ? 'text-blue-700 dark:text-blue-300' : ''}
                            `}>
                                {user?.fullName}
                            </h3>
                            
                            {isMuted && (
                                <VolumeX size={14} className="text-gray-400 flex-shrink-0" />
                            )}
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            {formattedTime}
                            {getMessageStatus()}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className={`
                            text-sm truncate
                            ${userInfo.hasUnread 
                                ? 'text-gray-900 dark:text-white font-medium' 
                                : 'text-gray-500 dark:text-gray-400'
                            }
                        `}>
                            {truncatedMessage}
                        </p>
                        
                        {/* Unread count badge */}
                        {userInfo.hasUnread && (
                            <div className="flex-shrink-0 ml-2">
                                <span className="bg-blue-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Context menu button */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className={`
                        p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        ${showMenu ? 'opacity-100 bg-gray-200 dark:bg-zinc-700' : 'hover:bg-gray-200 dark:hover:bg-zinc-700'}
                    `}
                >
                    <MoreVertical size={16} className="text-gray-500" />
                </button>
            </div>

            {/* Context menu */}
            {showMenu && (
                <div 
                    className="absolute right-3 top-12 z-10 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700 py-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={(e) => handleMenuAction('pin', e)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700"
                    >
                        <Pin size={16} />
                        {isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button 
                        onClick={(e) => handleMenuAction('mute', e)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700"
                    >
                        <VolumeX size={16} />
                        {isMuted ? 'Unmute' : 'Mute'}
                    </button>
                    <button 
                        onClick={(e) => handleMenuAction('archive', e)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700"
                    >
                        <svg size={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        Archive
                    </button>
                    <div className="border-t border-gray-200 dark:border-zinc-700 my-1"></div>
                    <button 
                        onClick={(e) => handleMenuAction('delete', e)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <svg size={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Chat
                    </button>
                </div>
            )}
        </div>
    );
};

export default OtherUser;
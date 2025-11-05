// components/Message.js - UPDATED WITH MESSAGE STATUS
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSelector } from "react-redux";
import { Check, CheckCheck, Clock, Eye } from 'lucide-react';

const Message = ({ message, isGroupChat = false, showDateSeparator = false }) => {
    const scroll = useRef();
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isImageError, setIsImageError] = useState(false);
    
    const { authUser, selectedUser } = useSelector(store => store.user);

    const messageInfo = useMemo(() => {
        const isOwnMessage = message?.senderId === authUser?._id;
        const sender = isOwnMessage ? authUser : selectedUser;
        
        return {
            isOwnMessage,
            sender,
            profilePhoto: sender?.profilePhoto,
            senderName: isGroupChat && !isOwnMessage ? sender?.fullName : null
        };
    }, [message, authUser, selectedUser, isGroupChat]);

    // Format timestamp
    const formattedTime = useMemo(() => {
        if (!message?.createdAt) return '12:45';
        
        const date = new Date(message.createdAt);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, [message?.createdAt]);

    // Format date for separators
    const formattedDate = useMemo(() => {
        if (!message?.createdAt) return '';
        return new Date(message.createdAt).toLocaleDateString();
    }, [message?.createdAt]);

    // ✅ Get message status icon with proper logic
    const getStatusIcon = () => {
        if (!messageInfo.isOwnMessage) return null;
        
        // ✅ Message status logic
        switch (message?.status) {
            case 'sent':
                return <Check size={14} className="text-gray-400" />;
            case 'delivered':
                return <CheckCheck size={14} className="text-gray-400" />;
            case 'read':
                return (
                    <div className="flex items-center gap-0.5">
                        <CheckCheck size={14} className="text-blue-500" />
                        <Eye size={12} className="text-blue-500" />
                    </div>
                );
            case 'seen':
                return (
                    <div className="flex items-center gap-0.5">
                        <CheckCheck size={14} className="text-blue-500" />
                        <Eye size={12} className="text-blue-500" />
                    </div>
                );
            default:
                return <Clock size={14} className="text-gray-400" />;
        }
    };

    // ✅ Get status text for tooltip
    const getStatusText = () => {
        if (!messageInfo.isOwnMessage) return '';
        
        switch (message?.status) {
            case 'sent':
                return 'Sent';
            case 'delivered':
                return 'Delivered';
            case 'read':
            case 'seen':
                return 'Seen';
            case 'sending':
                return 'Sending...';
            case 'failed':
                return 'Failed to send';
            default:
                return 'Pending';
        }
    };

    // Auto scroll when new message comes
    useEffect(() => {
        scroll.current?.scrollIntoView({ 
            behavior: "smooth", 
            block: "nearest" 
        });
    }, [message]);

    // Handle image load events
    const handleImageLoad = () => {
        setIsImageLoaded(true);
        setIsImageError(false);
    };

    const handleImageError = () => {
        setIsImageLoaded(false);
        setIsImageError(true);
    };

    // Render message content based on type
    const renderMessageContent = () => {
        if (message?.type === 'image' && message?.fileUrl) {
            return (
                <div className="relative group">
                    <img 
                        src={message.fileUrl} 
                        alt="Shared content"
                        className={`rounded-lg max-w-xs md:max-w-sm cursor-pointer transition-all duration-200 ${
                            isImageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                    />
                    {!isImageLoaded && !isImageError && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                            <div className="text-gray-500">Loading...</div>
                        </div>
                    )}
                    {isImageError && (
                        <div className="absolute inset-0 bg-red-100 rounded-lg flex items-center justify-center">
                            <div className="text-red-500">Failed to load image</div>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className={`relative p-3 rounded-2xl max-w-xs md:max-w-md ${
                messageInfo.isOwnMessage 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white rounded-bl-none'
            } ${message?.isEdited ? 'pr-8' : ''} shadow-md`}>
                {messageInfo.senderName && (
                    <div className="text-xs font-semibold mb-1 opacity-75">
                        {messageInfo.senderName}
                    </div>
                )}
                <div className="break-words whitespace-pre-wrap">
                    {message?.message}
                </div>
                {message?.isEdited && (
                    <span className="absolute right-2 bottom-1 text-xs opacity-50 italic">
                        edited
                    </span>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Date Separator */}
            {showDateSeparator && (
                <div className="flex justify-center my-4">
                    <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                        {formattedDate}
                    </div>
                </div>
            )}

            <div 
                ref={scroll} 
                className={`flex ${messageInfo.isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 px-4`}
            >
                {/* Left Side - Receiver Message */}
                {!messageInfo.isOwnMessage && (
                    <div className="flex items-end gap-2 max-w-xs md:max-w-md">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300">
                                <img 
                                    alt="User avatar" 
                                    src={messageInfo.profilePhoto || '/default-avatar.png'} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = '/default-avatar.png';
                                        handleImageError();
                                    }}
                                />
                            </div>
                        </div>
                        
                        {/* Message Content */}
                        <div className="flex flex-col">
                            {isGroupChat && messageInfo.senderName && (
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    {messageInfo.senderName}
                                </span>
                            )}
                            {renderMessageContent()}
                            
                            {/* Message Footer */}
                            <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>{formattedTime}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Right Side - Sender Message */}
                {messageInfo.isOwnMessage && (
                    <div className="flex flex-col items-end max-w-xs md:max-w-md">
                        {renderMessageContent()}
                        
                        {/* ✅ Message Footer with Status */}
                        <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>{formattedTime}</span>
                            
                            {/* Status with Tooltip */}
                            <div className="flex items-center gap-1 group relative">
                                {getStatusIcon()}
                                
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-1 hidden group-hover:flex items-center gap-1 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
                                    {getStatusText()}
                                    <div className="absolute top-full left-2 border-4 border-transparent border-t-black"></div>
                                </div>
                            </div>
                            
                            {message?.isEdited && (
                                <span className="opacity-50 italic">edited</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Message;
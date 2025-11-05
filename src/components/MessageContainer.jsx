// MessageContainer.js - ENHANCED VERSION
import React from 'react'
import SendInput from './SendInput'
import Messages from './Messages';
import { useSelector } from "react-redux";

const MessageContainer = () => {
    const { selectedUser, authUser, onlineUsers } = useSelector(store => store.user);

    const isOnline = onlineUsers?.includes(selectedUser?._id);
   
    // ✅ DEBUG: Check user data
    console.log("🔍 MessageContainer Debug:", {
        authUser: authUser?.fullName,
        selectedUser: selectedUser?.fullName,
        isOnline
    });

    return (
        <>
            {
                selectedUser !== null ? (
                    <div className='flex flex-col h-full'>
                        {/* Header - Shows the person you're chatting with */}
                        <div className='flex gap-4 items-center bg-white dark:bg-zinc-800 px-6 py-4 border-b border-gray-200 dark:border-zinc-700'>
                            <div className="relative">
                                <div className='w-12 h-12 rounded-full overflow-hidden bg-gray-300'>
                                    <img 
                                        src={selectedUser?.profilePhoto} 
                                        alt="user-profile" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = '/default-avatar.png';
                                        }}
                                    />
                                </div>
                                {isOnline && (
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-zinc-800"></div>
                                )}
                            </div>
                            <div className='flex flex-col flex-1'>
                                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                                    {selectedUser?.fullName}
                                </h3>
                                <p className='text-sm text-gray-500 dark:text-gray-400'>
                                    {isOnline ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>
                        
                        {/* Messages Area */}
                        <div className='flex-1 overflow-hidden'>
                            <Messages />
                        </div>
                        
                        {/* Input Area */}
                        <SendInput />
                    </div>
                ) : (
                    // ✅ IMPROVED: Better welcome screen with current user info
                    <div className='flex flex-col justify-center items-center h-full text-center p-6'>
                        {/* Current User Profile Card */}
                        <div className="mb-8 text-center">
                            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-blue-500">
                                <img 
                                    src={authUser?.profilePhoto} 
                                    alt="Your profile" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = '/default-avatar.png';
                                    }}
                                />
                            </div>
                            <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                                Welcome, {authUser?.fullName}!
                            </h2>
                            <p className='text-gray-600 dark:text-gray-400 mt-1'>
                                @{authUser?.username}
                            </p>
                        </div>

                        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6">
                            <span className="text-3xl">💬</span>
                        </div>
                        <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
                            Start a Conversation
                        </h1>
                        <p className='text-lg text-gray-600 dark:text-gray-400 max-w-md'>
                            Select a user from the sidebar to start messaging and connect with your friends.
                        </p>
                    </div>
                )
            }
        </>
    )
}

export default MessageContainer;
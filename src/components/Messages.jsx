// components/Messages.js - COMPLETELY FIXED VERSION
import React, { useEffect, useRef, useMemo, useCallback } from 'react'
import { useSelector, useDispatch } from "react-redux";
import { Loader2, AlertCircle, CheckCheck, Eye } from 'lucide-react';
import Message from './Message'
import useGetMessages from '../hooks/useGetMessages';
import useSocket from '../hooks/useSocket';
import { updateMessagesStatus } from '../redux/messageSlice'; // ✅ Import dispatch action

const Messages = () => {
    const { messages, loading, error } = useSelector(store => store.message);
    const { selectedUser, authUser } = useSelector(store => store.user);
    const dispatch = useDispatch(); // ✅ Add dispatch
    
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const { isFetching, loadMore } = useGetMessages();
    const { socket, markAsRead, markAsSeen, isConnected } = useSocket();

    // ✅ Safe messages array
    const safeMessages = useMemo(() => {
        return Array.isArray(messages) ? messages : [];
    }, [messages]);

    // ✅ FIXED: Get unread messages (messages sent to me that I haven't read)
    const unreadMessages = useMemo(() => {
        if (!selectedUser || !authUser) return [];
        
        const unread = safeMessages.filter(msg => 
            msg.senderId === selectedUser._id && // Messages FROM selected user
            msg.receiverId === authUser._id &&   // TO me (current user)
            msg.status !== 'read' && 
            msg.status !== 'seen' &&
            msg.status !== 'failed' &&
            !msg.isTemp
        );
        
        console.log(`📨 Unread messages from ${selectedUser.fullName}:`, unread.length);
        return unread;
    }, [safeMessages, selectedUser, authUser]);

    // ✅ FIXED: Auto mark as read/seen when messages are visible
    useEffect(() => {
        if (unreadMessages.length > 0 && selectedUser && authUser) {
            const messageIds = unreadMessages.map(msg => msg._id);
            
            console.log('🚀 Auto marking messages as read/seen:', {
                count: unreadMessages.length,
                messageIds: messageIds,
                from: selectedUser.fullName,
                to: authUser.fullName,
                socketConnected: isConnected
            });
            
            // ✅ Immediate UI update for better UX
            dispatch(updateMessagesStatus({
                messageIds: messageIds,
                status: 'read'
            }));
            
            // ✅ Emit socket events if connected
            if (isConnected) {
                console.log('📢 Emitting socket events for read/seen');
                markAsRead(messageIds, selectedUser._id);
                
                setTimeout(() => {
                    markAsSeen(messageIds, selectedUser._id);
                }, 800);
            } else {
                console.log('⚠️ Socket not connected, only updating local state');
            }
        }
    }, [unreadMessages, selectedUser, authUser, markAsRead, markAsSeen, isConnected, dispatch]);

    // ✅ FIXED: Real socket event handlers that update Redux
    useEffect(() => {
        if (!socket || !isConnected) {
            console.log('❌ No socket available');
            return;
        }

        console.log('🎯 Attaching REAL socket listeners with Redux updates');

        // ✅ REAL: Handle message sent status
        const handleMessageSent = (data) => {
            console.log('📤 SENT event received - Updating Redux:', data);
            // This is handled in useSocket hook
        };

        // ✅ REAL: Handle message delivered status
        const handleMessageDelivered = (data) => {
            console.log('📨 DELIVERED event received - Updating Redux:', data);
            // This is handled in useSocket hook
        };

        // ✅ REAL: Handle message read status
        const handleMessageRead = (data) => {
            console.log('👀 READ event received - Updating Redux:', data);
            if (data.messageIds && Array.isArray(data.messageIds)) {
                dispatch(updateMessagesStatus({
                    messageIds: data.messageIds,
                    status: 'read'
                }));
            }
        };

        // ✅ REAL: Handle message seen status
        const handleMessageSeen = (data) => {
            console.log('👁️ SEEN event received - Updating Redux:', data);
            if (data.messageIds && Array.isArray(data.messageIds)) {
                dispatch(updateMessagesStatus({
                    messageIds: data.messageIds,
                    status: 'seen'
                }));
            }
        };

        // ✅ REAL: Handle new incoming messages
        const handleNewMessage = (message) => {
            console.log('📩 NEW MESSAGE received:', message);
            // This will trigger unreadMessages update and auto-mark as read
        };

        // Attach event listeners
        socket.on('messageSent', handleMessageSent);
        socket.on('messageDelivered', handleMessageDelivered);
        socket.on('messageRead', handleMessageRead);
        socket.on('messageSeen', handleMessageSeen);
        socket.on('newMessage', handleNewMessage);

        // Debug: Log all socket events
        socket.onAny((eventName, ...args) => {
            console.log(`🎯 Socket event [${eventName}]:`, args);
        });

        return () => {
            console.log('🧹 Cleaning up socket listeners');
            socket.off('messageSent', handleMessageSent);
            socket.off('messageDelivered', handleMessageDelivered);
            socket.off('messageRead', handleMessageRead);
            socket.off('messageSeen', handleMessageSeen);
            socket.off('newMessage', handleNewMessage);
            socket.offAny();
        };
    }, [socket, isConnected, dispatch]);

    // ✅ FIXED: Manual testing functions with immediate UI updates
    const manualMarkAsRead = () => {
        if (unreadMessages.length > 0 && selectedUser && authUser) {
            const messageIds = unreadMessages.map(msg => msg._id);
            console.log('🔄 MANUAL Mark as read:', messageIds);
            
            // ✅ Immediate UI update
            dispatch(updateMessagesStatus({
                messageIds: messageIds,
                status: 'read'
            }));
            
            // Socket emit
            if (isConnected) {
                markAsRead(messageIds, selectedUser._id);
            }
        }
    };

    const manualMarkAsSeen = () => {
        if (unreadMessages.length > 0 && selectedUser && authUser) {
            const messageIds = unreadMessages.map(msg => msg._id);
            console.log('🔄 MANUAL Mark as seen:', messageIds);
            
            // ✅ Immediate UI update
            dispatch(updateMessagesStatus({
                messageIds: messageIds,
                status: 'seen'
            }));
            
            // Socket emit
            if (isConnected) {
                markAsSeen(messageIds, selectedUser._id);
            }
        }
    };

    // ✅ Auto scroll to bottom
    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'end' 
            });
        }, 100);
    }, []);

    useEffect(() => {
        if (safeMessages.length > 0) {
            scrollToBottom();
        }
    }, [safeMessages.length, scrollToBottom]);

    // ✅ Debug: Log message status changes
    useEffect(() => {
        console.log('📝 Messages state updated:', {
            total: safeMessages.length,
            unread: unreadMessages.length,
            loading: loading
        });
        
        // Log status distribution
        const statusCount = safeMessages.reduce((acc, msg) => {
            acc[msg.status] = (acc[msg.status] || 0) + 1;
            return acc;
        }, {});
        
        console.log('📊 Message status distribution:', statusCount);
    }, [safeMessages, unreadMessages, loading]);

    const renderMessages = () => {
        if (loading && safeMessages.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
                    <p className="text-gray-500">Loading messages...</p>
                </div>
            );
        }

        if (error && safeMessages.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="w-6 h-6 text-red-500 mb-2" />
                    <p className="text-red-500 mb-2">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        if (safeMessages.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-12">
                    <CheckCheck className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center">
                        {selectedUser 
                            ? `Start a conversation with ${selectedUser.fullName}` 
                            : 'Select a user to start messaging'
                        }
                    </p>
                </div>
            );
        }

        return safeMessages.map((message) => (
            <Message key={message._id} message={message} isGroupChat={false} />
        ));
    };

    return (
        <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-zinc-900"
        >
            {/* Enhanced Debug Panel */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="text-sm text-blue-800">
                    <div className="font-bold mb-2">🔧 Debug Panel - Message Status</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Total Messages: <strong>{safeMessages.length}</strong></div>
                        <div>Unread: <strong>{unreadMessages.length}</strong></div>
                        <div>Socket: <strong>{isConnected ? '✅ Connected' : '❌ Disconnected'}</strong></div>
                        <div>Chat With: <strong>{selectedUser?.fullName}</strong></div>
                    </div>
                    
                    {/* Status Distribution */}
                    <div className="mt-2 text-xs">
                        <div className="font-medium mb-1">Status Distribution:</div>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(safeMessages.reduce((acc, msg) => {
                                acc[msg.status] = (acc[msg.status] || 0) + 1;
                                return acc;
                            }, {})).map(([status, count]) => (
                                <span key={status} className="bg-blue-100 px-2 py-1 rounded">
                                    {status}: {count}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    {/* Manual Test Buttons */}
                    {unreadMessages.length > 0 && (
                        <div className="flex gap-2 mt-3">
                            <button 
                                onClick={manualMarkAsRead}
                                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                            >
                                Test Mark as Read
                            </button>
                            <button 
                                onClick={manualMarkAsSeen}
                                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                            >
                                Test Mark as Seen
                            </button>
                            <button 
                                onClick={() => console.log('Unread messages:', unreadMessages)}
                                className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
                            >
                                Log Unread
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Load More Button */}
            {safeMessages.length > 0 && (
                <div className="flex justify-center mb-4">
                    <button
                        onClick={loadMore}
                        disabled={isFetching}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white rounded-full shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-colors border border-gray-200"
                    >
                        {isFetching && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isFetching ? 'Loading...' : 'Load older messages'}
                    </button>
                </div>
            )}

            {/* Unread Messages Indicator */}
            {unreadMessages.length > 0 && (
                <div className="flex justify-center mb-2">
                    <div className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs px-3 py-1 rounded-full flex items-center gap-1 border border-orange-200">
                        <Eye size={12} />
                        {unreadMessages.length} unread message{unreadMessages.length > 1 ? 's' : ''} from {selectedUser?.fullName}
                    </div>
                </div>
            )}

            {/* Messages List */}
            <div className="space-y-2">
                {renderMessages()}
            </div>
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default Messages;
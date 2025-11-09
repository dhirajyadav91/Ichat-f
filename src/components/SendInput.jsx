import React, { useState, useRef, useCallback } from 'react'
import { 
    IoSend, IoImage, IoDocument, IoHappy, IoMic, IoAddCircle
} from "react-icons/io5";
import axiosInstance from "../api/axiosConfig";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, updateMessageStatus } from '../redux/messageSlice';
import toast from 'react-hot-toast';
import useSocket from '../hooks/useSocket';

const SendInput = () => {
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const dispatch = useDispatch();
    
    const { selectedUser, authUser } = useSelector(store => store.user);
    const { messages } = useSelector(store => store.message);
    
    // ✅ Get socket functions
    const { sendMessage, isConnected } = useSocket();

    // Handle input
    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        setMessage(value);
    }, []);

    // Emoji handling
    const handleEmojiClick = (emoji) => {
        setMessage(prev => prev + emoji);
        textareaRef.current?.focus();
    };

    const commonEmojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '🙏', '👋'];

    // ✅ File upload
    const handleFileUpload = async (file) => {
        if (!selectedUser || !authUser) {
            toast.error('Please select a user to send file');
            return;
        }

        const tempId = `file_temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const tempFileMessage = {
            _id: tempId,
            message: '📎 File',
            senderId: authUser._id,
            receiverId: selectedUser._id,
            createdAt: new Date().toISOString(),
            status: 'sending',
            isTemp: true,
            type: 'file',
            fileUrl: URL.createObjectURL(file)
        };

        const formData = new FormData();
        formData.append('file', file);
        formData.append('receiverId', selectedUser._id);

        try {
            // ✅ Optimistic update for file
            dispatch(addMessage(tempFileMessage));
            setShowAttachmentMenu(false);

            // ✅ FIXED: Use correct endpoint - remove /api/v1 since baseURL already has it
            const res = await axiosInstance.post(
                `/message/send-file`, // ✅ CHANGED: Simple endpoint
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(progress);
                    }
                }
            );

            // ✅ Update status to sent
            if (res.data.newMessage) {
                dispatch(updateMessageStatus({
                    messageId: tempId,
                    status: 'sent',
                    newMessage: res.data.newMessage
                }));
            }

            toast.success('File sent successfully');
        } catch (error) {
            console.error('File upload error:', error);
            toast.error('Failed to send file');
            
            // ✅ Mark as failed in UI
            dispatch(updateMessageStatus({
                messageId: tempId,
                status: 'failed'
            }));
        } finally {
            setUploadProgress(0);
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) handleFileUpload(file);
        e.target.value = ''; // Reset file input
    };

    // ✅ FIXED: Message send - Use only socket, no duplicate API call
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedUser || !authUser) return;

        // ✅ Create temporary message with unique temp ID
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const tempMessage = {
            _id: tempId,
            message: message.trim(),
            senderId: authUser._id,
            receiverId: selectedUser._id,
            createdAt: new Date().toISOString(),
            status: 'sending',
            isTemp: true
        };

        console.log('📤 Sending message with temp ID:', tempId);
        console.log('🔌 Socket connected:', isConnected);

        // ✅ Add to Redux immediately (optimistic update)
        dispatch(addMessage(tempMessage));

        const originalMessage = message;
        setMessage("");
        setIsTyping(false);
        setShowEmojiPicker(false);

        try {
            // ✅ METHOD 1: Send via socket only (recommended)
            if (isConnected) {
                const messageData = {
                    message: originalMessage.trim(),
                    receiverId: selectedUser._id,
                    senderId: authUser._id,
                    tempId: tempId,
                    timestamp: new Date().toISOString()
                };
                
                const socketSent = sendMessage(messageData);
                console.log('📤 Socket send result:', socketSent);

                if (socketSent) {
                    // Socket will handle the delivery status via events
                    console.log('✅ Message sent via socket');
                    return;
                }
            }

            // ✅ METHOD 2: Fallback - Send via API if socket fails
            console.log('🔄 Socket not available, trying API...');
            
            // ✅ FIXED: Use correct endpoint - remove /api/v1
            const res = await axiosInstance.post(
                `/message/send`, // ✅ CHANGED: Simple endpoint
                { 
                    message: originalMessage.trim(),
                    receiverId: selectedUser._id 
                }
            );

            console.log("✅ Message sent successfully via API:", res.data);

            // Update the temp message with real data
            if (res.data.newMessage && res.data.newMessage._id) {
                dispatch(updateMessageStatus({
                    messageId: tempId,
                    status: 'sent',
                    newMessage: res.data.newMessage
                }));
            }

        } catch (error) {
            console.error('❌ Message send error:', error);
            
            // ✅ Mark message as failed in UI
            dispatch(updateMessageStatus({
                messageId: tempId,
                status: 'failed'
            }));
            
            // Show specific error message
            if (error.response?.status === 404) {
                toast.error('Message endpoint not found. Check backend API.');
            } else {
                toast.error('Failed to send message');
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmitHandler(e);
        }
    };

    // ✅ Close menus when clicking outside
    const handleClickOutside = useCallback((e) => {
        if (showEmojiPicker && !e.target.closest('.emoji-picker')) {
            setShowEmojiPicker(false);
        }
        if (showAttachmentMenu && !e.target.closest('.attachment-menu')) {
            setShowAttachmentMenu(false);
        }
    }, [showEmojiPicker, showAttachmentMenu]);

    React.useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);

    const attachmentOptions = [
        { type: 'image/*', label: 'Photo & Video', icon: <IoImage size={20} /> },
        { type: '.pdf,.doc,.docx', label: 'Document', icon: <IoDocument size={20} /> },
        { type: 'audio/*', label: 'Audio', icon: <IoMic size={20} /> },
    ];

    return (
        <div className="relative border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            {/* Socket Status Indicator */}
            <div className={`text-xs px-4 py-1 ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isConnected ? '✅ Connected' : '❌ Disconnected'}
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 dark:bg-zinc-700 h-1">
                    <div 
                        className="bg-blue-500 h-1 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                </div>
            )}

            {/* Emoji Picker */}
            {showEmojiPicker && (
                <div className="emoji-picker absolute bottom-full left-4 mb-2 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700 p-2 z-50">
                    <div className="grid grid-cols-8 gap-1">
                        {commonEmojis.map((emoji, index) => (
                            <button
                                key={index}
                                onClick={() => handleEmojiClick(emoji)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded text-lg transition-colors"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Attachment Menu */}
            {showAttachmentMenu && (
                <div className="attachment-menu absolute bottom-full left-4 mb-2 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700 p-2 z-40">
                    <div className="grid grid-cols-3 gap-2">
                        {attachmentOptions.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center p-3 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                                title={option.label}
                            >
                                {option.icon}
                                <span className="text-xs mt-1">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={onSubmitHandler} className="p-4">
                <div className="flex items-end gap-2">
                    {/* Attach Button */}
                    <button
                        type="button"
                        onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                        className="attachment-menu flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <IoAddCircle size={24} />
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileInputChange}
                        accept="image/*,.pdf,.doc,.docx,.txt,audio/*,video/*"
                    />

                    {/* Textarea */}
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            rows={1}
                            className="w-full px-4 py-3 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 max-h-32"
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                        />

                        {/* Emoji Button */}
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="emoji-picker absolute right-12 bottom-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                            <IoHappy size={20} />
                        </button>
                    </div>

                    {/* Send / Mic Button */}
                    {message.trim() ? (
                        <button
                            type="submit"
                            disabled={!message.trim()}
                            className="flex-shrink-0 p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                        >
                            <IoSend size={20} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="flex-shrink-0 p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <IoMic size={20} />
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default SendInput;
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Smile, Mic, Send, X, ImageIcon, File as FileIcon, BarChart3 } from "lucide-react";
// Removed framer-motion - using CSS transitions only
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import type { ChatInputProps } from "@/app/types";

// Giao diện global cho SpeechRecognition
declare global {
    interface Window {
        SpeechRecognition?: any;
        webkitSpeechRecognition?: any;
    }
}

const formatFileSize = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export function ChatInput({ onSendMessage, onCreatePoll, isDarkMode = false }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = "vi-VN";
        recognition.interimResults = false;
        recognition.onresult = (event: any) => {
            setMessage((prev) => prev + event.results[0][0].transcript);
        };
        recognition.onerror = (event: any) => {
            console.error("Lỗi nhận dạng giọng nói:", event.error);
            setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [emojiPickerRef]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
        setIsListening(!isListening);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.length) {
            setSelectedFiles((prev) => [...prev, ...Array.from(event.target.files!)]);
        }
        setShowAttachmentMenu(false);
        event.target.value = '';
    };

    const removeFile = (fileToRemove: File) => {
        setSelectedFiles((prev) => prev.filter((file) => file !== fileToRemove));
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setMessage((prev) => prev + emojiData.emoji);
        inputRef.current?.focus();
    };

    const handleSendMessage = async () => {
        if (!message.trim() && selectedFiles.length === 0) return;

        setIsSending(true);

        // Bắn sự kiện lên cho component cha (useChat) xử lý
        await onSendMessage(message, selectedFiles);

        // Reset state của input
        setMessage("");
        setSelectedFiles([]);

        setTimeout(() => {
            setIsSending(false);
            inputRef.current?.focus();
        }, 300);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const AttachmentMenuItem = ({
        icon,
        label,
        onClick,
        color = "text-cyan-500"
    }: {
        icon: React.ReactNode;
        label: string;
        onClick: () => void;
        color?: string;
    }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-3 rounded-md text-sm transition-all duration-200 ${isDarkMode
                ? "text-gray-300 hover:bg-gray-600 hover:text-white"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
        >
            <span className={color}>{icon}</span>
            {label}
        </button>
    );

    return (
        <div className={`p-4 border-t transition-all duration-300 relative ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}>
            {/* File Preview Section */}
            {selectedFiles.length > 0 && (
                <div className={`mb-3 p-3 border rounded-lg max-h-40 overflow-y-auto animate-in slide-in-from-top duration-300 ${isDarkMode ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-gray-50'
                    }`}>
                    <div className="flex flex-wrap gap-3">

                        {selectedFiles.map((file, index) => (
                            <div
                                key={index}
                                className="relative group animate-in zoom-in duration-200 hover-scale-sm"
                            >
                                {file.type.startsWith("image/") ? (
                                    <div className="relative w-20 h-20">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-full h-full object-cover rounded-md shadow-md border border-gray-300 dark:border-gray-600"
                                        />
                                        <button
                                            onClick={() => removeFile(file)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 rounded-b-md truncate">
                                            {file.name}
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`relative w-48 p-3 rounded-md border shadow-md ${isDarkMode
                                        ? 'bg-gray-700 border-gray-600'
                                        : 'bg-white border-gray-200'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                                                }`}>
                                                <FileIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-medium text-sm truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                                    }`}>
                                                    {file.name}
                                                </p>
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>
                                                    {formatFileSize(file.size)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFile(file)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                    </div>
                </div>
            )}

            <div className="flex items-center space-x-3">
                <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    style={{ display: "none" }}
                />

                {/* Emoji Picker */}
                <div ref={emojiPickerRef} className="absolute bottom-full mb-2 z-10">

                    {showEmojiPicker && (
                        <div

                            className="shadow-2xl rounded-lg overflow-hidden"
                        >
                            <EmojiPicker
                                onEmojiClick={onEmojiClick}
                                autoFocusSearch={false}
                                height={400}
                                width={350}
                                theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
                                lazyLoadEmojis={true}
                            />
                        </div>
                    )}

                </div>

                {/* Emoji Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    className={`transition-colors duration-200 ${isDarkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        }`}
                    onClick={() => setShowEmojiPicker(p => !p)}
                >
                    <Smile className="h-5 w-5" />
                </Button>

                {/* Input Field */}
                <div className="flex-1 relative">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Nhập tin nhắn của bạn..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-12 transition-all duration-300 ${isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                            }`}
                    />

                    {/* Attachment Menu */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`transition-colors duration-200 ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                                    }`}
                                onClick={() => setShowAttachmentMenu(p => !p)}
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>


                            {showAttachmentMenu && (
                                <div

                                    onMouseLeave={() => setShowAttachmentMenu(false)}
                                    className={`absolute bottom-full right-0 mb-2 p-2 rounded-lg shadow-xl w-48 z-20 ${isDarkMode ? "bg-gray-700 border border-gray-600" : "bg-white border shadow-lg"
                                        }`}
                                >
                                    <AttachmentMenuItem
                                        icon={<ImageIcon className="h-5 w-5" />}
                                        label="Ảnh"
                                        onClick={() => imageInputRef.current?.click()}
                                        color="text-green-500"
                                    />
                                    <AttachmentMenuItem
                                        icon={<FileIcon className="h-5 w-5" />}
                                        label="Tệp"
                                        onClick={() => fileInputRef.current?.click()}
                                        color="text-blue-500"
                                    />
                                    <AttachmentMenuItem
                                        icon={<BarChart3 className="h-5 w-5" />}
                                        label="Bình luận"
                                        onClick={() => onCreatePoll && onCreatePoll({ question: '', options: ['', ''] })}
                                        color="text-purple-500"
                                    />
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Voice Recording Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleListening}
                    className={`transition-all duration-200 ${isListening
                        ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                        : (isDarkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100")
                        }`}
                >
                    <Mic className="h-5 w-5" />
                </Button>

                {/* Send Button - Enhanced Animation */}
                <div
                    className="hover-scale transition-transform"
                >
                    <Button
                        onClick={handleSendMessage}
                        disabled={(!message.trim() && selectedFiles.length === 0) || isSending}
                        className={`rounded-full w-12 h-12 p-0 transition-all duration-300 ${(!message.trim() && selectedFiles.length === 0) || isSending
                            ? "bg-gray-400 cursor-not-allowed opacity-50"
                            : "bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 shadow-lg hover:shadow-xl"
                            }`}
                    >
                        <div
                            className={`transition-all duration-300 ${isSending ? 'animate-spin scale-110' : ''}`}
                        >
                            <Send className="h-5 w-5 text-white" />
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
}
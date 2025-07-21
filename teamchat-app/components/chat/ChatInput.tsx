import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Smile, Mic, Send, X, ImageIcon, File as FileIcon, Folder } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { ChatInputProps } from "@/app/types";

declare global {
    interface Window {
        SpeechRecognition?: any;
        webkitSpeechRecognition?: any;
    }
}

export function ChatInput({ onSendMessage, isDarkMode = false }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = "vi-VN";
        recognition.interimResults = false;
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setMessage((prevMessage) => prevMessage + transcript);
        };
        recognition.onerror = (event: any) => {
            console.error("Lỗi nhận dạng giọng nói:", event.error);
            setIsListening(false);
        };
        recognition.onend = () => {
            setIsListening(false);
        };
        recognitionRef.current = recognition;
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
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
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
        }
        setShowAttachmentMenu(false);
    };

    const removeFile = (fileToRemove: File) => {
        setSelectedFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setMessage((prevMessage) => prevMessage + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const handleSendMessage = () => {
        if (!message.trim() && selectedFiles.length === 0) return;
        onSendMessage(message);
        setMessage("");
        setSelectedFiles([]);
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
    }: {
        icon: React.ReactNode;
        label: string;
        onClick: () => void;
    }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-2 rounded-md text-sm transition-colors ${isDarkMode ? "text-gray-300 hover:bg-gray-600" : "text-gray-700 hover:bg-gray-100"
                }`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div
            className={`p-4 border-t transition-colors relative ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}
        >
            {selectedFiles.length > 0 && (
                <div
                    className={`mb-2 p-2 border rounded-lg max-h-32 overflow-y-auto space-y-2 ${isDarkMode ? "border-gray-600" : "border-gray-300"
                        }`}
                >
                    {selectedFiles.map((file, index) => (
                        <div
                            key={index}
                            className={`flex items-center justify-between p-2 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-100"
                                }`}
                        >
                            <span className={`text-sm truncate max-w-xs ${isDarkMode ? "text-gray-300" : "text-gray-700"}`} >
                                {file.name}
                            </span>
                            <button
                                onClick={() => removeFile(file)}
                                className={`hover:text-red-500 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
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
                    ref={videoInputRef}
                    onChange={handleFileSelect}
                    accept="video/*"
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
                <div ref={emojiPickerRef} className="absolute bottom-full mb-2 z-10">
                    {showEmojiPicker && (
                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            autoFocusSearch={false}
                            height={400}
                            width={350}
                            theme={isDarkMode ? ("dark" as Theme) : ("light" as Theme)}
                            lazyLoadEmojis={true}
                        />
                    )}
                </div>

                <div className="relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500"}`}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                        <Smile className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Nhập tin nhắn của bạn..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10 transition-colors ${isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                            }`}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500"}`}
                                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>
                            {showAttachmentMenu && (
                                <div
                                    onMouseLeave={() => setShowAttachmentMenu(false)}
                                    className={`absolute bottom-full right-0 mb-2 p-2 rounded-lg shadow-lg w-48 ${isDarkMode ? "bg-gray-700 border border-gray-600" : "bg-white border"
                                        }`}
                                >
                                    <AttachmentMenuItem
                                        icon={<ImageIcon className="h-5 w-5 text-green-500" />}
                                        label="Ảnh"
                                        onClick={() => imageInputRef.current?.click()}
                                    />
                                    <AttachmentMenuItem
                                        icon={<FileIcon className="h-5 w-5 text-purple-500" />}
                                        label="Chọn Tệp"
                                        onClick={() => fileInputRef.current?.click()}
                                    />
                                    <AttachmentMenuItem
                                        icon={<Folder className="h-5 w-5 text-yellow-500" />}
                                        label="Chọn Thư Mục"
                                        onClick={() => folderInputRef.current?.click()}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleListening}
                    className={`${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500"} ${isListening ? "text-red-500" : ""
                        }`}
                >
                    <Mic className="h-5 w-5" />
                </Button>

                <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() && selectedFiles.length === 0}
                    className="bg-purple-500 hover:bg-purple-600 rounded-full w-10 h-10 p-0 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

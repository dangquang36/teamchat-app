import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Smile, Mic, Send, X, ImageIcon, File as FileIcon } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import type { ChatInputProps } from "@/app/types";

// Giao diện global cho SpeechRecognition
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
    const recognitionRef = useRef<any>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

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
        event.target.value = ''; // Reset input để có thể chọn lại file cũ
    };

    const removeFile = (fileToRemove: File) => {
        setSelectedFiles((prev) => prev.filter((file) => file !== fileToRemove));
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setMessage((prev) => prev + emojiData.emoji);
    };

    // SỬA LẠI HOÀN TOÀN: Hàm này giờ chỉ gọi prop onSendMessage và reset state
    const handleSendMessage = () => {
        if (!message.trim() && selectedFiles.length === 0) return;

        // Bắn sự kiện lên cho component cha (useChat) xử lý
        onSendMessage(message, selectedFiles);

        // Reset state của input
        setMessage("");
        setSelectedFiles([]);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const AttachmentMenuItem = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void; }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-2 rounded-md text-sm transition-colors ${isDarkMode ? "text-gray-300 hover:bg-gray-600" : "text-gray-700 hover:bg-gray-100"}`}
        >
            {icon} {label}
        </button>
    );

    return (
        <div className={`p-4 border-t transition-colors relative ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            {selectedFiles.length > 0 && (
                <div className="mb-2 p-2 border rounded-lg max-h-40 overflow-y-auto space-x-2 flex">
                    {selectedFiles.map((file, index) => (
                        <div key={index} className="relative w-20 h-20 flex-shrink-0">
                            {file.type.startsWith("image/") ? (
                                <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover rounded-md" />
                            ) : (
                                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                                    <FileIcon className="h-8 w-8 text-gray-500" />
                                </div>
                            )}
                            <button onClick={() => removeFile(file)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center space-x-3">
                <input type="file" ref={imageInputRef} onChange={handleFileSelect} accept="image/*" multiple style={{ display: "none" }} />
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple style={{ display: "none" }} />

                <div ref={emojiPickerRef} className="absolute bottom-full mb-2 z-10">
                    {showEmojiPicker && (
                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            autoFocusSearch={false}
                            height={400}
                            width={350}
                            theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
                            lazyLoadEmojis={true}
                        />
                    )}
                </div>

                <Button variant="ghost" size="sm" className={`${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500"}`} onClick={() => setShowEmojiPicker(p => !p)}>
                    <Smile className="h-5 w-5" />
                </Button>

                <div className="flex-1 relative">
                    <input
                        type="text" placeholder="Nhập tin nhắn của bạn..." value={message}
                        onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10 transition-colors ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="relative">
                            <Button variant="ghost" size="sm" className={`${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500"}`} onClick={() => setShowAttachmentMenu(p => !p)}>
                                <Paperclip className="h-4 w-4" />
                            </Button>
                            {showAttachmentMenu && (
                                <div onMouseLeave={() => setShowAttachmentMenu(false)} className={`absolute bottom-full right-0 mb-2 p-2 rounded-lg shadow-lg w-48 ${isDarkMode ? "bg-gray-700 border border-gray-600" : "bg-white border"}`}>
                                    <AttachmentMenuItem icon={<ImageIcon className="h-5 w-5 text-green-500" />} label="Ảnh" onClick={() => imageInputRef.current?.click()} />
                                    <AttachmentMenuItem icon={<FileIcon className="h-5 w-5 text-purple-500" />} label="Tệp" onClick={() => fileInputRef.current?.click()} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <Button variant="ghost" size="sm" onClick={toggleListening} className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} ${isListening ? "text-red-500" : ""}`}>
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
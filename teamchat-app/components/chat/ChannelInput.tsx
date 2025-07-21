'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Smile, Paperclip, X, ImageIcon, File as FileIcon, Folder, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

// Định nghĩa lại interface cho props để bao gồm cả hàm gửi file
interface ChannelInputProps {
    channelName: string;
    isChannel: boolean;
    onCreatePoll: () => void;
    onSendMessage: (data: { text: string; files: File[] }) => void;
    isDarkMode?: boolean;
}

// Component cho một mục trong menu đính kèm
const AttachmentMenuItem = ({ icon, label, onClick, isDarkMode }: { icon: React.ReactNode, label: string, onClick: () => void, isDarkMode?: boolean }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-2 rounded-md text-sm transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
    >
        {icon}
        {label}
    </button>
);


export function ChannelInput({ channelName, isChannel, onCreatePoll, onSendMessage, isDarkMode = false, }: ChannelInputProps) {
    // --- STATE MANAGEMENT ---
    const [inputValue, setInputValue] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // --- REFS ---
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const attachmentButtonRef = useRef<HTMLButtonElement>(null);
    const attachmentMenuRef = useRef<HTMLDivElement>(null);

    // --- EFFECT ĐỂ ĐÓNG CÁC POPUP KHI CLICK RA NGOÀI ---
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // Đóng Emoji Picker
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
            // Đóng Attachment Menu
            if (
                attachmentButtonRef.current &&
                !attachmentButtonRef.current.contains(event.target as Node) &&
                attachmentMenuRef.current && // Đảm bảo menu đang tồn tại
                !attachmentMenuRef.current.contains(event.target as Node) // Kiểm tra click có nằm ngoài menu không
            ) {
                setShowAttachmentMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    // --- HANDLERS ---
    const handleSend = () => {
        if (inputValue.trim() || selectedFiles.length > 0) {
            onSendMessage({ text: inputValue, files: selectedFiles });
            setInputValue('');
            setSelectedFiles([]);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setInputValue(prevMessage => prevMessage + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
        }
        setShowAttachmentMenu(false);
        // Reset giá trị để có thể chọn lại cùng một file
        event.target.value = '';
    };

    const removeFile = (fileToRemove: File) => {
        setSelectedFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
    };

    const handleMicClick = () => {
        alert("Chức năng ghi âm đang được phát triển!");
    };

    return (
        <div className={`p-4 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} relative`}>
            {/* BẢNG CHỌN EMOJI */}
            {showEmojiPicker && (
                <div ref={emojiPickerRef} className="absolute bottom-full mb-2 z-20">
                    <EmojiPicker
                        open={showEmojiPicker}
                        onEmojiClick={onEmojiClick}
                        autoFocusSearch={false}
                        height={400}
                        width={350}
                        theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
                        lazyLoadEmojis={true}
                    />
                </div>
            )}

            {/* HIỂN THỊ CÁC TỆP ĐÃ CHỌN */}
            {selectedFiles.length > 0 && (
                <div className="mb-2 p-2 border rounded-lg max-h-32 overflow-y-auto space-y-2 bg-gray-50 dark:bg-gray-700">
                    {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-600 p-2 rounded">
                            <span className="text-sm truncate max-w-xs text-gray-800 dark:text-gray-200">{file.name}</span>
                            <button onClick={() => removeFile(file)} className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center space-x-3">
                {/* CÁC INPUT CHỌN TỆP (ẨN) */}
                <input type="file" ref={imageInputRef} onChange={handleFileSelect} accept="image/*" multiple style={{ display: "none" }} />
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple style={{ display: "none" }} />
                {/* @ts-ignore: webkitdirectory is non-standard but widely supported */}
                <input type="file" ref={folderInputRef} onChange={handleFileSelect} webkitdirectory="" directory="" multiple style={{ display: "none" }} />

                {/* NÚT MIC */}
                <Button onClick={handleMicClick} variant="ghost" size="icon" className={`flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Mic className="h-5 w-5" />
                </Button>

                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder={`Nhắn tin trong #${channelName}`}
                        className={`w-full px-10 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    {/* NÚT CHỌN EMOJI (TRONG INPUT) */}
                    <Button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        variant="ghost"
                        size="sm"
                        className={`absolute left-1 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Smile className="h-5 w-5" />
                    </Button>

                    {/* NÚT ĐÍNH KÈM (TRONG INPUT) */}
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                        <div className="relative">
                            <Button
                                ref={attachmentButtonRef}
                                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                                variant="ghost" size="sm" className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Paperclip className="h-5 w-5" />
                            </Button>
                            {/* MENU ĐÍNH KÈM */}
                            {showAttachmentMenu && (
                                <div
                                    ref={attachmentMenuRef}
                                    className={`absolute bottom-full right-0 mb-2 p-2 rounded-lg shadow-lg w-48 z-10 ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border'}`}>
                                    <AttachmentMenuItem isDarkMode={isDarkMode} icon={<ImageIcon className="h-5 w-5 text-green-500" />} label="Ảnh" onClick={() => imageInputRef.current?.click()} />
                                    <AttachmentMenuItem isDarkMode={isDarkMode} icon={<FileIcon className="h-5 w-5 text-purple-500" />} label="Chọn Tệp" onClick={() => fileInputRef.current?.click()} />
                                    <AttachmentMenuItem isDarkMode={isDarkMode} icon={<Folder className="h-5 w-5 text-yellow-500" />} label="Chọn Thư Mục" onClick={() => folderInputRef.current?.click()} />
                                    <AttachmentMenuItem
                                        icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
                                        label="Tạo bình chọn"
                                        onClick={() => {
                                            console.log('onCreatePoll clicked');
                                            setShowAttachmentMenu(false);
                                            onCreatePoll();
                                        }}
                                        isDarkMode={isDarkMode}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* NÚT GỬI */}
                <Button onClick={handleSend} disabled={!inputValue.trim() && selectedFiles.length === 0} className="bg-purple-500 hover:bg-purple-600 rounded-full w-10 h-10 p-0 flex-shrink-0 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
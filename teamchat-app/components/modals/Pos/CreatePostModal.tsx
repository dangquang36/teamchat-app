import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ImageIcon, Video, Paperclip, Smile, X, Type, AlertCircle, CheckCircle, Link as LinkIcon } from "lucide-react";
import { Post } from "@/app/types";
import { emojis } from "@/data/mockData";
import { TiptapEditor } from "@/components/editor/TiptapEditor";

// Custom Toast Notification Component
function Toast({
    message,
    type = 'info',
    isVisible,
    onClose
}: {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
    onClose: () => void;
}) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const getToastStyle = () => {
        switch (type) {
            case 'success':
                return 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200';
            case 'error':
                return 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200';
            case 'warning':
                return 'bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200';
            default:
                return 'bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5" />;
            case 'error':
            case 'warning':
                return <AlertCircle className="h-5 w-5" />;
            default:
                return <AlertCircle className="h-5 w-5" />;
        }
    };

    return (
        <div className="fixed top-4 right-4 z-[60] animate-in slide-in-from-top-2">
            <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg border-l-4 shadow-lg max-w-md ${getToastStyle()}`}>
                {getIcon()}
                <span className="text-sm font-medium">{message}</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="ml-auto p-1 h-6 w-6"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

// Custom Input Modal Component
function InputModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    placeholder,
    value,
    onChange,
    isDarkMode
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
    title: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    isDarkMode: boolean;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[55] p-4">
            <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {title}
                </h3>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onConfirm(value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        }`}
                    autoFocus
                />
                <div className="flex justify-end space-x-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="px-4 py-2"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={() => onConfirm(value)}
                        disabled={!value.trim()}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2"
                    >
                        Xác nhận
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function CreatePostModal({
    isOpen,
    onClose,
    onSubmit,
    isDarkMode,
}: {
    isOpen: boolean
    onClose: () => void
    onSubmit: (post: Post) => void
    isDarkMode: boolean
}) {
    const [content, setContent] = useState("")
    const [visibility, setVisibility] = useState<"public" | "friends" | "private">("public")
    const [selectedImages, setSelectedImages] = useState<File[]>([])
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
    const [selectedAttachments, setSelectedAttachments] = useState<File[]>([])
    const [tags, setTags] = useState<string[]>([])
    const [location, setLocation] = useState("")
    const [currentTagInput, setCurrentTagInput] = useState("")
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [characterCount, setCharacterCount] = useState(0)

    // Toast notification states
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        isVisible: boolean;
    }>({
        message: '',
        type: 'info',
        isVisible: false
    });

    // Input modal states
    const [inputModal, setInputModal] = useState<{
        isOpen: boolean;
        type: 'image' | 'link' | null;
        title: string;
        placeholder: string;
        value: string;
    }>({
        isOpen: false,
        type: null,
        title: '',
        placeholder: '',
        value: ''
    });

    const emojiPickerRef = useRef<HTMLDivElement>(null)

    // Show toast notification
    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setToast({ message, type, isVisible: true });
    };

    // Hide toast notification
    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    // Character count khi content thay đổi
    useEffect(() => {
        const plainText = content.replace(/<[^>]*>/g, '').trim()
        setCharacterCount(plainText.length)
    }, [content])

    // Auto-save draft (optional)
    useEffect(() => {
        if (content || tags.length > 0 || location) {
            const draftData = {
                content,
                tags,
                location,
                timestamp: Date.now()
            }
            localStorage.setItem('post_draft', JSON.stringify(draftData))
        }
    }, [content, tags, location])

    // Load draft khi mở modal
    useEffect(() => {
        if (isOpen) {
            const savedDraft = localStorage.getItem('post_draft')
            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft)
                    // Chỉ load nếu draft không quá cũ (< 1 hour)
                    if (Date.now() - draft.timestamp < 3600000) {
                        setContent(draft.content || "")
                        setTags(draft.tags || [])
                        setLocation(draft.location || "")
                        if (draft.content || draft.tags?.length > 0 || draft.location) {
                            showToast("Đã khôi phục bản nháp trước đó", "info");
                        }
                    }
                } catch (error) {
                    console.error('Error loading draft:', error);
                }
            }
        }
    }, [isOpen])

    // Close emoji picker when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [emojiPickerRef])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).filter(file => {
                if (!file.type.startsWith('image/')) {
                    showToast(`${file.name} không phải là file ảnh hợp lệ`, "error");
                    return false;
                }
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    showToast(`${file.name} quá lớn (giới hạn 5MB)`, "error");
                    return false;
                }
                return true;
            });

            if (newFiles.length > 0) {
                setSelectedImages(prev => [...prev, ...newFiles])
                showToast(`Đã thêm ${newFiles.length} ảnh`, "success");
            }
        }
    }

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.type.startsWith('video/')) {
                if (file.size > 50 * 1024 * 1024) { // 50MB limit
                    showToast("Video quá lớn (giới hạn 50MB)", "error");
                    return;
                }
                setSelectedVideo(file)
                showToast("Đã thêm video thành công", "success");
            } else {
                showToast("Vui lòng chọn một tệp video hợp lệ", "error");
            }
        }
    }

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).filter(file => {
                if (file.size > 10 * 1024 * 1024) { // 10MB limit
                    showToast(`${file.name} quá lớn (giới hạn 10MB)`, "error");
                    return false;
                }
                return true;
            });

            if (newFiles.length > 0) {
                setSelectedAttachments(prev => [...prev, ...newFiles])
                showToast(`Đã thêm ${newFiles.length} tệp đính kèm`, "success");
            }
        }
    }

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && currentTagInput.trim() !== "") {
            const newTag = currentTagInput.trim().toLowerCase()
            if (!tags.includes(newTag)) {
                if (tags.length >= 10) {
                    showToast("Tối đa 10 thẻ cho mỗi bài viết", "warning");
                    return;
                }
                setTags([...tags, newTag])
                showToast(`Đã thêm thẻ #${newTag}`, "success");
            } else {
                showToast("Thẻ này đã tồn tại", "warning");
            }
            setCurrentTagInput("")
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove))
        showToast(`Đã xóa thẻ #${tagToRemove}`, "info");
    }

    const handleSelectEmoji = (emoji: string) => {
        setContent(prevContent => prevContent + emoji)
        setShowEmojiPicker(false)
    }

    // Custom image URL input
    const handleAddImageFromUrl = () => {
        setInputModal({
            isOpen: true,
            type: 'image',
            title: 'Thêm ảnh từ URL',
            placeholder: 'Nhập URL ảnh (https://example.com/image.jpg)',
            value: ''
        });
    };

    // Custom link input
    const handleAddLink = () => {
        setInputModal({
            isOpen: true,
            type: 'link',
            title: 'Thêm liên kết',
            placeholder: 'Nhập URL (https://example.com)',
            value: ''
        });
    };

    const handleInputModalConfirm = (value: string) => {
        if (inputModal.type === 'image') {
            // Validate image URL
            if (value && (value.match(/\.(jpeg|jpg|gif|png|webp)$/i) || value.includes('imgur') || value.includes('unsplash'))) {
                // Add image to editor (this would need to be implemented in TiptapEditor)
                setContent(prevContent => prevContent + `<img src="${value}" alt="Image" />`);
                showToast("Đã thêm ảnh từ URL", "success");
            } else {
                showToast("URL ảnh không hợp lệ", "error");
            }
        } else if (inputModal.type === 'link') {
            // Validate URL
            try {
                new URL(value);
                // Add link to editor
                setContent(prevContent => prevContent + `<a href="${value}" target="_blank">${value}</a>`);
                showToast("Đã thêm liên kết", "success");
            } catch {
                showToast("URL không hợp lệ", "error");
            }
        }

        setInputModal({ isOpen: false, type: null, title: '', placeholder: '', value: '' });
    };

    const stripHtml = (html: string) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    const handleSubmit = () => {
        const plainTextContent = stripHtml(content).trim()

        if (!plainTextContent && selectedImages.length === 0 && !selectedVideo && selectedAttachments.length === 0) {
            showToast("Vui lòng thêm nội dung hoặc media để đăng bài!", "warning");
            return
        }

        const imageUrls = selectedImages.map((file) => URL.createObjectURL(file))
        const videoUrl = selectedVideo ? URL.createObjectURL(selectedVideo) : undefined
        const attachmentData = selectedAttachments.map((file) => ({
            type: "file" as const,
            name: file.name,
            url: URL.createObjectURL(file),
        }))

        const newPost: Post = {
            id: Date.now().toString(),
            author: {
                id: "current-user",
                name: "Bạn",
                avatar: "/placeholder.svg?height=40&width=40&text=U",
                title: "Thành viên nhóm",
            },
            content,
            images: imageUrls.length > 0 ? imageUrls : undefined,
            video: videoUrl,
            timestamp: Date.now(),
            likes: 0,
            comments: 0,
            shares: 0,
            bookmarks: 0,
            isLiked: false,
            isBookmarked: false,
            visibility,
            tags: tags.length > 0 ? tags : undefined,
            location: location || undefined,
            attachments: attachmentData.length > 0 ? attachmentData : undefined,
        }

        onSubmit(newPost)

        // Clear form và draft
        setContent("")
        setVisibility("public")
        setSelectedImages([])
        setSelectedVideo(null)
        setSelectedAttachments([])
        setTags([])
        setLocation("")
        setCurrentTagInput("")
        setShowEmojiPicker(false)
        localStorage.removeItem('post_draft')
    }

    if (!isOpen) return null

    const maxCharacters = 2000
    const isNearLimit = characterCount > maxCharacters * 0.8
    const isOverLimit = characterCount > maxCharacters

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                <div className={`rounded-2xl p-8 max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-300 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
                    <div className="flex items-center justify-between mb-6 border-b pb-4">
                        <div className="flex items-center space-x-4">
                            <h3 className={`text-2xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>Tạo bài viết mới</h3>
                            {/* Character count */}
                            <div className={`text-sm px-3 py-1 rounded-full ${isOverLimit ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' :
                                isNearLimit ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' :
                                    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                <Type className="inline h-3 w-3 mr-1" />
                                {characterCount}/{maxCharacters}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-full w-10 h-10 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {/* User Info */}
                        <div className="flex items-center space-x-4">
                            <img
                                src="/placeholder.svg?height=40&width=40&text=U"
                                alt="Your avatar"
                                className="w-14 h-14 rounded-full object-cover border-2 border-purple-500"
                            />
                            <div>
                                <h4 className={`font-semibold text-xl tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>Bạn</h4>
                                <div className="relative inline-block text-left">
                                    <select
                                        value={visibility}
                                        onChange={(e) => setVisibility(e.target.value as any)}
                                        className={`text-sm font-medium border rounded-full px-4 py-2 pr-10 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300 text-gray-700"}`}
                                    >
                                        <option value="public">🌍 Công khai</option>
                                        <option value="friends">👥 Bạn bè</option>
                                        <option value="private">🔒 Riêng tư</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Tiptap Editor */}
                        <div className="space-y-4">
                            <TiptapEditor
                                content={content}
                                onChange={setContent}
                                placeholder="Bạn đang nghĩ gì? Chia sẻ cập nhật, ý tưởng hoặc thông tin thú vị..."
                                isDarkMode={isDarkMode}
                            />

                            {/* Warning nếu quá giới hạn */}
                            {isOverLimit && (
                                <div className="text-red-500 text-sm flex items-center space-x-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Vượt quá giới hạn ký tự cho phép</span>
                                </div>
                            )}
                        </div>

                        {/* Tags Input */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                Thẻ (Hashtags) {tags.length > 0 && <span className="text-purple-600">({tags.length}/10)</span>}
                            </label>
                            <input
                                type="text"
                                placeholder="Thêm thẻ "
                                value={currentTagInput}
                                onChange={(e) => setCurrentTagInput(e.target.value)}
                                onKeyPress={handleAddTag}
                                className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
                                    } shadow-sm hover:shadow-md transition-all duration-200`}
                            />
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className={`text-sm px-3 py-1.5 rounded-full flex items-center transition-all duration-200 ${isDarkMode ? "bg-purple-700 text-white" : "bg-purple-100 text-purple-700"} hover:shadow-md`}
                                        >
                                            #{tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className={`ml-2 rounded-full p-1 ${isDarkMode ? "hover:bg-purple-600" : "hover:bg-purple-200"}`}
                                                aria-label={`Remove tag ${tag}`}
                                            >
                                                <X className={`h-4 w-4 ${isDarkMode ? "text-white" : "text-purple-700"}`} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Location */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                Vị trí
                            </label>
                            <input
                                type="text"
                                placeholder="Thêm vị trí"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
                                    } shadow-sm hover:shadow-md transition-all duration-200`}
                            />
                        </div>

                        {/* Media Options */}
                        <div className="flex flex-wrap items-center gap-3">
                            <label htmlFor="image-upload" className="cursor-pointer">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    title="Thêm hình ảnh từ máy tính"
                                    className={`rounded-full px-5 py-2.5 flex items-center space-x-2 ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-100"} shadow-sm hover:shadow-md transition-all duration-200`}
                                >
                                    <div>
                                        <ImageIcon className="h-5 w-5" />
                                        <span>Ảnh</span>
                                    </div>
                                </Button>
                            </label>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="hidden"
                            />

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddImageFromUrl}
                                title="Thêm ảnh từ URL"
                                className={`rounded-full px-5 py-2.5 flex items-center space-x-2 ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-100"} shadow-sm hover:shadow-md transition-all duration-200`}
                            >
                                <LinkIcon className="h-4 w-4" />
                                <span>URL Ảnh</span>
                            </Button>

                            <label htmlFor="video-upload" className="cursor-pointer">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    title="Thêm video"
                                    className={`rounded-full px-5 py-2.5 flex items-center space-x-2 ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-100"} shadow-sm hover:shadow-md transition-all duration-200`}
                                >
                                    <div>
                                        <Video className="h-5 w-5" />
                                        <span>Video</span>
                                    </div>
                                </Button>
                            </label>
                            <input
                                id="video-upload"
                                type="file"
                                accept="video/*"
                                onChange={handleVideoChange}
                                className="hidden"
                            />

                            <label htmlFor="file-upload" className="cursor-pointer">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    title="Thêm tệp đính kèm"
                                    className={`rounded-full px-5 py-2.5 flex items-center space-x-2 ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-100"} shadow-sm hover:shadow-md transition-all duration-200`}
                                >
                                    <div>
                                        <Paperclip className="h-5 w-5" />
                                        <span>Tệp</span>
                                    </div>
                                </Button>
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                multiple
                                onChange={handleAttachmentChange}
                                className="hidden"
                            />

                            <div className="relative" ref={emojiPickerRef}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    title="Thêm emoji"
                                    className={`rounded-full px-5 py-2.5 flex items-center space-x-2 ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-100"} shadow-sm hover:shadow-md transition-all duration-200`}
                                >
                                    <Smile className="h-5 w-5" />
                                    <span>Cảm xúc</span>
                                </Button>

                                {showEmojiPicker && (
                                    <div className={`absolute bottom-full mb-3 left-0 w-72 p-4 rounded-xl shadow-xl grid grid-cols-6 gap-3 z-10 ${isDarkMode ? "bg-gray-700 border border-gray-600" : "bg-white border border-gray-200"}`}>
                                        {emojis.map((emoji, index) => (
                                            <span
                                                key={index}
                                                onClick={() => handleSelectEmoji(emoji)}
                                                className="cursor-pointer text-2xl hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-2 flex items-center justify-center transition-all duration-200"
                                                title={`Add ${emoji}`}
                                            >
                                                {emoji}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Preview sections for uploaded files */}
                        {selectedImages.length > 0 && (
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                                {selectedImages.map((file, index) => (
                                    <div key={index} className="relative aspect-square">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Selected image ${index + 1}`}
                                            className="w-full h-full object-cover rounded-lg shadow-md"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedImages(selectedImages.filter((_, i) => i !== index));
                                                showToast("Đã xóa ảnh", "info");
                                            }}
                                            className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1.5 text-xs hover:bg-opacity-80 transition-all duration-200"
                                            aria-label="Remove image"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedVideo && (
                            <div className="relative mt-4">
                                <video src={URL.createObjectURL(selectedVideo)} controls className="w-full max-h-72 object-cover rounded-xl shadow-md" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedVideo(null);
                                        showToast("Đã xóa video", "info");
                                    }}
                                    className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1.5 text-xs hover:bg-opacity-80 transition-all duration-200"
                                    aria-label="Remove video"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {selectedAttachments.length > 0 && (
                            <div className="space-y-2 mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm">
                                <p className={`text-base font-semibold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    Tệp đã chọn ({selectedAttachments.length}):
                                </p>
                                {selectedAttachments.map((file, index) => (
                                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-100 hover:bg-gray-200"} transition-all duration-200`}>
                                        <div className="flex items-center space-x-2">
                                            <Paperclip className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                                            <span className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>{file.name}</span>
                                            <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedAttachments(selectedAttachments.filter((_, i) => i !== index));
                                                showToast(`Đã xóa ${file.name}`, "info");
                                            }}
                                            className={`text-sm font-medium rounded-full p-1.5 ${isDarkMode ? "text-red-400 hover:bg-red-900" : "text-red-600 hover:bg-red-100"} transition-all duration-200`}
                                            aria-label="Remove file"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className={`rounded-full px-6 py-2.5 text-base font-medium ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-100"} shadow-sm hover:shadow-md transition-all duration-200`}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isOverLimit || (!stripHtml(content).trim() && selectedImages.length === 0 && !selectedVideo && selectedAttachments.length === 0)}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full px-7 py-2.5 text-base font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                Đăng bài
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />

            {/* Input Modal */}
            <InputModal
                isOpen={inputModal.isOpen}
                onClose={() => setInputModal({ isOpen: false, type: null, title: '', placeholder: '', value: '' })}
                onConfirm={handleInputModalConfirm}
                title={inputModal.title}
                placeholder={inputModal.placeholder}
                value={inputModal.value}
                onChange={(value) => setInputModal(prev => ({ ...prev, value }))}
                isDarkMode={isDarkMode}
            />
        </>
    )
}
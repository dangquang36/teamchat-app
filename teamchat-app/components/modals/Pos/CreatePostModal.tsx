import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ImageIcon, Video, Paperclip, Smile, X, Type, AlertCircle, CheckCircle, Link as LinkIcon, Play, FileText, Download, Eye, MapPin } from "lucide-react";
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
        <div className="fixed top-4 right-4 z-[70] animate-in slide-in-from-top-2">
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

// Image Gallery Component
function ImageGallery({ images, onRemove, isDarkMode }: {
    images: File[];
    onRemove: (index: number) => void;
    isDarkMode: boolean;
}) {
    if (images.length === 0) return null;

    const getGridClass = () => {
        switch (images.length) {
            case 1:
                return "grid-cols-1";
            case 2:
                return "grid-cols-2";
            case 3:
                return "grid-cols-3";
            case 4:
                return "grid-cols-2";
            default:
                return "grid-cols-3";
        }
    };

    return (
        <div className={`mt-4 p-3 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between mb-3">
                <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    📸 Hình ảnh ({images.length})
                </h4>
                <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-700'}`}>
                    {images.length}/10
                </span>
            </div>

            <div className={`grid gap-2 ${getGridClass()}`}>
                {images.map((file, index) => (
                    <div key={index} className="relative group">
                        <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-600">
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`Selected image ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemove(index)}
                                    className="opacity-0 group-hover:opacity-100 bg-red-500 bg-opacity-90 text-white hover:bg-red-600 rounded-full p-2"
                                    title="Xóa ảnh"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Video Preview Component
function VideoPreview({ video, onRemove, isDarkMode }: {
    video: File;
    onRemove: () => void;
    isDarkMode: boolean;
}) {
    return (
        <div className={`mt-4 p-3 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between mb-3">
                <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    🎥 Video
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemove}
                    className="text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-full p-1"
                    title="Xóa video"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                    src={URL.createObjectURL(video)}
                    controls
                    className="w-full max-h-60 object-contain"
                    preload="metadata"
                />
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
                if (selectedImages.length + newFiles.length > 10) {
                    showToast("Tối đa 10 ảnh cho mỗi bài viết", "warning");
                    return;
                }
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

    const stripHtml = (html: string) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    const handleSubmit = () => {
        const plainTextContent = stripHtml(content).trim()

        if (!plainTextContent && selectedImages.length === 0 && !selectedVideo) {
            showToast("Vui lòng thêm nội dung hoặc media để đăng bài!", "warning");
            return
        }

        const imageUrls = selectedImages.map((file) => URL.createObjectURL(file))
        const videoUrl = selectedVideo ? URL.createObjectURL(selectedVideo) : undefined

        const newPost: Post = {
            id: Date.now().toString(),
            author: {
                id: "current-user",
                name: "Bạn",
                avatar: "/placeholder.svg?height=40&width=40&text=U",
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
        }

        onSubmit(newPost)

        // Clear form
        setContent("")
        setVisibility("public")
        setSelectedImages([])
        setSelectedVideo(null)
        setTags([])
        setLocation("")
        setCurrentTagInput("")
        setShowEmojiPicker(false)
    }

    if (!isOpen) return null

    const maxCharacters = 2000
    const isOverLimit = characterCount > maxCharacters

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
                    {/* Header */}
                    <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            Tạo bài viết
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="p-4 space-y-4">
                        {/* User Info */}
                        <div className="flex items-center space-x-3">
                            <img
                                src="/placeholder.svg?height=40&width=40&text=U"
                                alt="Your avatar"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                                <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Bạn</h3>

                            </div>
                        </div>

                        {/* Content Editor */}
                        <div className="space-y-3">
                            <TiptapEditor
                                content={content}
                                onChange={setContent}
                                placeholder="Bạn đang nghĩ gì?"
                                isDarkMode={isDarkMode}
                            />

                            {/* Character count */}
                            {characterCount > 0 && (
                                <div className={`text-xs text-right ${isOverLimit ? 'text-red-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {characterCount}/{maxCharacters}
                                </div>
                            )}
                        </div>

                        {/* Media Previews */}
                        <ImageGallery
                            images={selectedImages}
                            onRemove={(index) => {
                                setSelectedImages(selectedImages.filter((_, i) => i !== index));
                                showToast("Đã xóa ảnh", "info");
                            }}
                            isDarkMode={isDarkMode}
                        />

                        {selectedVideo && (
                            <VideoPreview
                                video={selectedVideo}
                                onRemove={() => {
                                    setSelectedVideo(null);
                                    showToast("Đã xóa video", "info");
                                }}
                                isDarkMode={isDarkMode}
                            />
                        )}

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className={`text-xs px-2 py-1 rounded-full flex items-center ${isDarkMode ? "bg-purple-700 text-white" : "bg-purple-100 text-purple-700"}`}
                                        >
                                            #{tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="ml-1 text-xs"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Location */}
                        {location && (
                            <div className={`flex items-center space-x-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                <MapPin className="h-4 w-4" />
                                <span>{location}</span>
                                <button
                                    onClick={() => setLocation("")}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}

                        {/* Location Input */}
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="📍 Thêm vị trí..."
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
                                    }`}
                            />
                        </div>
                        {/* Add to post options */}
                        <div className={`border rounded-lg p-3 ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Thêm vào bài viết của bạn
                                </span>
                                <div className="flex items-center space-x-1">
                                    {/* Image upload */}
                                    <label htmlFor="image-upload" className="cursor-pointer">
                                        <div className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                            <ImageIcon className="h-6 w-6 text-green-500" />
                                        </div>
                                    </label>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />

                                    {/* Video upload */}
                                    <label htmlFor="video-upload" className="cursor-pointer">
                                        <div className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                            <Video className="h-6 w-6 text-red-500" />
                                        </div>
                                    </label>
                                    <input
                                        id="video-upload"
                                        type="file"
                                        accept="video/*"
                                        onChange={handleVideoChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit button */}
                        <Button
                            onClick={handleSubmit}
                            disabled={isOverLimit || (!stripHtml(content).trim() && selectedImages.length === 0 && !selectedVideo)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Đăng
                        </Button>
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
        </>
    )
}
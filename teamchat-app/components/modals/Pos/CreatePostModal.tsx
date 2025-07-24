
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ImageIcon, Video, Paperclip, Smile, X } from "lucide-react";
import { Post } from "@/app/types";
import { emojis } from "@/data/mockData";

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
    const emojiPickerRef = useRef<HTMLDivElement>(null)

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
            const newFiles = Array.from(e.target.files).filter(file => file.type.startsWith('image/'))
            setSelectedImages(prev => [...prev, ...newFiles])
        }
    }

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.type.startsWith('video/')) {
                setSelectedVideo(file)
            } else {
                alert("Vui lòng chọn một tệp video.")
            }
        }
    }

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedAttachments(prev => [...prev, ...Array.from(e.target.files ?? [])])
        }
    }

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && currentTagInput.trim() !== "") {
            const newTag = currentTagInput.trim().toLowerCase()
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag])
            }
            setCurrentTagInput("")
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove))
    }

    const handleSelectEmoji = (emoji: string) => {
        setContent(prevContent => prevContent + emoji)
    }

    const handleSubmit = () => {
        if (!content.trim() && selectedImages.length === 0 && !selectedVideo && selectedAttachments.length === 0) return

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
        setContent("")
        setVisibility("public")
        setSelectedImages([])
        setSelectedVideo(null)
        setSelectedAttachments([])
        setTags([])
        setLocation("")
        setCurrentTagInput("")
        setShowEmojiPicker(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div
                className={`rounded-2xl p-8 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-300 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
            >
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                    <h3 className={`text-2xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>Tạo bài viết mới</h3>
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
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-300">
                                    <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9l4.95 4.95z" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <textarea
                        placeholder="Bạn đang nghĩ gì?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-base font-normal ${isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
                            } shadow-sm hover:shadow-md transition-all duration-200`}
                        rows={6}
                    />

                    {/* Tags Input */}
                    <div>
                        <input
                            type="text"
                            placeholder="Thêm thẻ (ví dụ: #thiếtkế, #côngnghệ). Nhấn Enter để thêm."
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
                                        <button type="button" onClick={() => handleRemoveTag(tag)} className={`ml-2 rounded-full p-1 ${isDarkMode ? "hover:bg-purple-600" : "hover:bg-purple-200"}`}>
                                            <X className={`h-4 w-4 ${isDarkMode ? "text-white" : "text-purple-700"}`} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Location */}
                    <input
                        type="text"
                        placeholder="Thêm vị trí..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
                            } shadow-sm hover:shadow-md transition-all duration-200`}
                    />

                    {/* Media Options & Upload */}
                    <div className="flex flex-wrap items-center gap-3">
                        <label htmlFor="image-upload" className="cursor-pointer">
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
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

                        <label htmlFor="video-upload" className="cursor-pointer">
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
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
                                className={`rounded-full px-5 py-2.5 flex items-center space-x-2 ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-100"} shadow-sm hover:shadow-md transition-all duration-200`}
                            >
                                <Smile className="h-5 w-5" />
                                <span>Cảm xúc</span>
                            </Button>

                            {showEmojiPicker && (
                                <div
                                    className={`absolute bottom-full mb-3 left-0 w-72 p-4 rounded-xl shadow-xl grid grid-cols-6 gap-3 z-10 ${isDarkMode ? "bg-gray-700 border border-gray-600" : "bg-white border border-gray-200"}`}
                                >
                                    {emojis.map((emoji, index) => (
                                        <span
                                            key={index}
                                            onClick={() => handleSelectEmoji(emoji)}
                                            className="cursor-pointer text-2xl hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-2 flex items-center justify-center transition-all duration-200"
                                        >
                                            {emoji}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

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
                                        onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                                        className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1.5 text-xs hover:bg-opacity-80 transition-all duration-200"
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
                                onClick={() => setSelectedVideo(null)}
                                className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1.5 text-xs hover:bg-opacity-80 transition-all duration-200"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {selectedAttachments.length > 0 && (
                        <div className="space-y-2 mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm">
                            <p className={`text-base font-semibold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Tệp đã chọn:</p>
                            {selectedAttachments.map((file, index) => (
                                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-100 hover:bg-gray-200"} transition-all duration-200`}>
                                    <div className="flex items-center space-x-2">
                                        <Paperclip className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                                        <span className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>{file.name}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedAttachments(selectedAttachments.filter((_, i) => i !== index))}
                                        className={`text-sm font-medium rounded-full p-1.5 ${isDarkMode ? "text-red-400 hover:bg-red-900" : "text-red-600 hover:bg-red-100"} transition-all duration-200`}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

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
                            disabled={!content.trim() && selectedImages.length === 0 && !selectedVideo && selectedAttachments.length === 0}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full px-7 py-2.5 text-base font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            Đăng bài
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
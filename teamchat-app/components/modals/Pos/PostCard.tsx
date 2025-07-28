import { useState, useRef, useEffect } from "react";
import { Post } from "@/app/types";
import { Button } from "@/components/ui/button";
import { HTMLContentRenderer } from "@/components/ui/HTMLContentRenderer";
import { Heart, MessageCircle, Globe, Users, Lock, Paperclip, MoreHorizontal, Trash2, X, ChevronLeft, ChevronRight, Download } from "lucide-react";

export const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days} ngày trước`
    if (hours > 0) return `${hours} giờ trước`
    if (minutes > 0) return `${minutes} phút trước`
    return "Vừa xong"
}

// Image Gallery Modal Component
function ImageGalleryModal({
    images,
    isOpen,
    onClose,
    isDarkMode,
    initialIndex = 0
}: {
    images: string[];
    isOpen: boolean;
    onClose: () => void;
    isDarkMode: boolean;
    initialIndex?: number;
}) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    if (!isOpen || !images || images.length === 0) return null;

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = images[currentIndex];
        link.download = `image-${currentIndex + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[60] p-4">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="text-white">
                            <span className="text-lg font-semibold">
                                {currentIndex + 1} / {images.length}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDownload}
                            className="text-white hover:bg-white/20 rounded-full"
                            title="Tải xuống"
                        >
                            <Download className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Image */}
            <div className="relative flex items-center justify-center w-full h-full">
                {/* Navigation Buttons */}
                {images.length > 1 && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goToPrevious}
                            className="absolute left-4 z-10 text-white hover:bg-white/20 rounded-full w-12 h-12"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goToNext}
                            className="absolute right-4 z-10 text-white hover:bg-white/20 rounded-full w-12 h-12"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </Button>
                    </>
                )}

                {/* Current Image */}
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                    <img
                        src={images[currentIndex]}
                        alt={`Image ${currentIndex + 1}`}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        style={{ maxHeight: 'calc(100vh - 200px)' }}
                    />
                </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex justify-center">
                        <div className="flex space-x-2 overflow-x-auto max-w-full pb-2">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${currentIndex === index
                                        ? 'border-white scale-110'
                                        : 'border-transparent opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img
                                        src={image}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Keyboard Navigation */}
            <div
                className="absolute inset-0 outline-none"
                tabIndex={0}
                onKeyDown={(e) => {
                    switch (e.key) {
                        case 'Escape':
                            onClose();
                            break;
                        case 'ArrowLeft':
                            goToPrevious();
                            break;
                        case 'ArrowRight':
                            goToNext();
                            break;
                    }
                }}
            />
        </div>
    );
}

// Dropdown Menu Component
function PostDropdownMenu({
    post,
    isOpen,
    onClose,
    onDelete,
    onChangeVisibility,
    isDarkMode
}: {
    post: Post;
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    onChangeVisibility: (visibility: "public" | "friends" | "private") => void;
    isDarkMode: boolean;
}) {
    if (!isOpen) return null;

    const handleDeleteClick = () => {
        onDelete();
        onClose();
    };

    return (
        <div className={`absolute top-10 right-0 w-64 rounded-lg shadow-lg border z-50 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}>
            {/* Actions */}
            <div className="p-2">
                <button
                    onClick={handleDeleteClick}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${isDarkMode ? "hover:bg-red-900 text-red-400 hover:text-red-300" : "hover:bg-red-50 text-red-600 hover:text-red-700"
                        }`}
                >
                    <Trash2 className="h-4 w-4" />
                    <span>Xóa bài viết</span>
                </button>
            </div>
        </div>
    );
}

export function PostCard({
    post,
    onLike,
    onBookmark,
    onShare,
    onComment,
    onDelete,
    onChangeVisibility,
    isDarkMode,
}: {
    post: Post;
    onLike: () => void;
    onBookmark: () => void;
    onShare: () => void;
    onComment: () => void;
    onDelete?: () => void;
    onChangeVisibility?: (visibility: "public" | "friends" | "private") => void;
    isDarkMode: boolean;
}) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showImageGallery, setShowImageGallery] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getVisibilityIcon = (): JSX.Element => {
        switch (post.visibility) {
            case "public": return <Globe className="h-4 w-4" />;
            case "friends": return <Users className="h-4 w-4" />;
            case "private": return <Lock className="h-4 w-4" />;
            default: return <Globe className="h-4 w-4" />;
        }
    };

    // Hàm kiểm tra xem content có phải là HTML hay không
    const isHtmlContent = (content: string) => {
        return content.includes('<') && content.includes('>')
    }

    // Hàm xử lý khi click vào overlay "+X"
    const handleShowAllImages = () => {
        setSelectedImageIndex(0);
        setShowImageGallery(true);
    };

    // Hàm xử lý khi click vào một ảnh cụ thể
    const handleImageClick = (index: number) => {
        setSelectedImageIndex(index);
        setShowImageGallery(true);
    };

    return (
        <>
            <div
                className={`rounded-2xl border p-6 transition-all duration-300 shadow-lg hover:shadow-xl ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
            >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <img
                            src={post.author.avatar || "/placeholder.svg"}
                            alt={post.author.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-purple-500"
                        />
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className={`font-semibold text-xl tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>{post.author.name}</h3>
                                {post.author.verified && (
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            {post.author.title && (
                                <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{post.author.title}</p>
                            )}
                            <div className="flex items-center space-x-2 mt-1.5">
                                <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    {formatTimeAgo(post.timestamp)}
                                </span>
                                <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{getVisibilityIcon()}</div>
                                {post.location && (
                                    <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>• {post.location}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    <div className="relative" ref={dropdownRef}>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>

                        <PostDropdownMenu
                            post={post}
                            isOpen={showDropdown}
                            onClose={() => setShowDropdown(false)}
                            onDelete={() => onDelete?.()}
                            onChangeVisibility={(visibility) => onChangeVisibility?.(visibility)}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </div>

                {/* Post Content */}
                <div className="mb-5">
                    {isHtmlContent(post.content) ? (
                        <HTMLContentRenderer
                            content={post.content}
                            isDarkMode={isDarkMode}
                            className="leading-relaxed"
                        />
                    ) : (
                        <p className={`text-base leading-relaxed font-normal ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{post.content}</p>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {post.tags.map((tag) => (
                                <span key={tag} className="text-xs bg-purple-100 text-purple-600 px-3 py-1.5 rounded-full font-medium hover:bg-purple-200 transition-colors duration-200">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Post Media - KHUNG CỐ ĐỊNH */}
                {(post.images || post.video) && (
                    <div className="mb-5">
                        {/* Khung cố định với tỷ lệ 16:9 */}
                        <div className="w-full aspect-video bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden shadow-md">
                            {(() => {
                                // Tính tổng số media (ảnh + video)
                                const hasImages = post.images && post.images.length > 0;
                                const hasVideo = post.video;
                                const imageCount = hasImages ? post.images!.length : 0;
                                const totalMedia = imageCount + (hasVideo ? 1 : 0);

                                // Nếu chỉ có video
                                if (hasVideo && !hasImages) {
                                    return (
                                        <video
                                            src={post.video}
                                            controls
                                            className="w-full h-full object-cover"
                                        />
                                    );
                                }

                                // Nếu chỉ có ảnh
                                if (hasImages && !hasVideo) {
                                    return (
                                        <div className="w-full h-full relative">
                                            {imageCount === 1 ? (
                                                // 1 ảnh - hiển thị full khung
                                                <img
                                                    src={post.images![0] || "/placeholder.svg"}
                                                    alt="Post image"
                                                    className="w-full h-full object-cover cursor-pointer"
                                                    onClick={() => handleImageClick(0)}
                                                />
                                            ) : imageCount === 2 ? (
                                                // 2 ảnh - chia đôi khung
                                                <div className="flex w-full h-full">
                                                    <div className="w-1/2 h-full border-r border-gray-200 dark:border-gray-700">
                                                        <img
                                                            src={post.images![0] || "/placeholder.svg"}
                                                            alt="Post image 1"
                                                            className="w-full h-full object-cover cursor-pointer"
                                                            onClick={() => handleImageClick(0)}
                                                        />
                                                    </div>
                                                    <div className="w-1/2 h-full">
                                                        <img
                                                            src={post.images![1] || "/placeholder.svg"}
                                                            alt="Post image 2"
                                                            className="w-full h-full object-cover cursor-pointer"
                                                            onClick={() => handleImageClick(1)}
                                                        />
                                                    </div>
                                                </div>
                                            ) : imageCount === 3 ? (
                                                // 3 ảnh - 1 lớn bên trái, 2 nhỏ bên phải
                                                <div className="flex w-full h-full">
                                                    <div className="w-2/3 h-full border-r border-gray-200 dark:border-gray-700">
                                                        <img
                                                            src={post.images![0] || "/placeholder.svg"}
                                                            alt="Post image 1"
                                                            className="w-full h-full object-cover cursor-pointer"
                                                            onClick={() => handleImageClick(0)}
                                                        />
                                                    </div>
                                                    <div className="w-1/3 h-full flex flex-col">
                                                        <div className="h-1/2 border-b border-gray-200 dark:border-gray-700">
                                                            <img
                                                                src={post.images![1] || "/placeholder.svg"}
                                                                alt="Post image 2"
                                                                className="w-full h-full object-cover cursor-pointer"
                                                                onClick={() => handleImageClick(1)}
                                                            />
                                                        </div>
                                                        <div className="h-1/2">
                                                            <img
                                                                src={post.images![2] || "/placeholder.svg"}
                                                                alt="Post image 3"
                                                                className="w-full h-full object-cover cursor-pointer"
                                                                onClick={() => handleImageClick(2)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                // 4+ ảnh - 2x2 grid
                                                <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-px">
                                                    {post.images?.slice(0, 4).map((image, index) => (
                                                        <div
                                                            key={index}
                                                            className="relative overflow-hidden cursor-pointer"
                                                            onClick={() => index === 3 && imageCount > 4 ? handleShowAllImages() : handleImageClick(index)}
                                                        >
                                                            <img
                                                                src={image || "/placeholder.svg"}
                                                                alt={`Post image ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            {index === 3 && imageCount > 4 && (
                                                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center hover:bg-opacity-70 transition-all duration-200">
                                                                    <span className="text-white text-2xl font-bold">
                                                                        +{imageCount - 4}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                // Nếu có cả ảnh và video - sắp xếp trong grid
                                if (hasImages && hasVideo) {
                                    if (totalMedia === 2) {
                                        // 1 ảnh + 1 video = chia đôi
                                        return (
                                            <div className="flex w-full h-full">
                                                <div className="w-1/2 h-full border-r border-gray-200 dark:border-gray-700">
                                                    <img
                                                        src={post.images![0] || "/placeholder.svg"}
                                                        alt="Post image"
                                                        className="w-full h-full object-cover cursor-pointer"
                                                        onClick={() => handleImageClick(0)}
                                                    />
                                                </div>
                                                <div className="w-1/2 h-full relative">
                                                    <video
                                                        src={post.video}
                                                        controls
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 rounded">
                                                        Video
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                }

                                return null;
                            })()}
                        </div>
                    </div>
                )}

                {post.attachments && post.attachments.length > 0 && (
                    <div className="mb-5">
                        <h4 className={`font-semibold text-sm mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Tệp đính kèm:</h4>
                        <div className="space-y-2">
                            {post.attachments.map((attachment, index) => (
                                <a
                                    key={index}
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center space-x-2 p-3 rounded-lg transition-colors duration-200 ${isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
                                >
                                    <Paperclip className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                                    <span className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>{attachment.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Post Stats */}
                <div
                    className={`flex items-center justify-between py-3 border-t border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
                >
                    <div className="flex items-center space-x-6 text-sm font-medium">
                        <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>{post.likes} lượt thích</span>
                        <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>{post.comments} bình luận</span>
                    </div>
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onLike}
                            className={`flex items-center space-x-2 rounded-full px-5 py-2.5 ${post.isLiked ? "text-red-500" : isDarkMode ? "text-gray-400" : "text-gray-600"} hover:bg-red-500/10 transition-all duration-200`}
                        >
                            <Heart className={`h-5 w-5 ${post.isLiked ? "fill-current" : ""}`} />
                            <span>Thích</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onComment}
                            className={`rounded-full px-5 py-2.5 ${isDarkMode ? "text-gray-400" : "text-gray-600"} hover:bg-purple-500/10 transition-all duration-200`}
                        >
                            <MessageCircle className="h-5 w-5 mr-2" />
                            Bình luận
                        </Button>
                    </div>
                </div>
            </div>

            {/* Image Gallery Modal */}
            {post.images && (
                <ImageGalleryModal
                    images={post.images}
                    isOpen={showImageGallery}
                    onClose={() => setShowImageGallery(false)}
                    isDarkMode={isDarkMode}
                    initialIndex={selectedImageIndex}
                />
            )}
        </>
    )
}
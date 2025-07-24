
import { Post } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Globe, Users, Lock, Paperclip } from "lucide-react";
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

export function PostCard({
    post,
    onLike,
    onBookmark,
    onShare,
    onComment,
    isDarkMode,
}: {
    post: Post;
    onLike: () => void;
    onBookmark: () => void;
    onShare: () => void;
    onComment: () => void;
    isDarkMode: boolean;
}) {
    const getVisibilityIcon = (): JSX.Element => {
        switch (post.visibility) {
            case "public": return <Globe className="h-4 w-4" />;
            case "friends": return <Users className="h-4 w-4" />;
            case "private": return <Lock className="h-4 w-4" />;
            default: return <Globe className="h-4 w-4" />;
        }
    };

    return (
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
            </div>

            {/* Post Content */}
            <div className="mb-5">
                <p className={`text-base leading-relaxed font-normal ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{post.content}</p>

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

            {/* Post Media */}
            {(post.images || post.video) && (
                <div className="mb-5">
                    {post.images && post.images.length > 0 && (
                        <div className="grid gap-3">
                            {post.images.length === 1 ? (
                                <img
                                    src={post.images[0] || "/placeholder.svg"}
                                    alt="Post image"
                                    className="w-full h-72 object-cover rounded-xl shadow-md"
                                />
                            ) : post.images.length === 2 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {post.images.slice(0, 2).map((image, index) => (
                                        <img
                                            key={index}
                                            src={image || "/placeholder.svg"}
                                            alt={`Post image ${index + 1}`}
                                            className="w-full h-72 object-cover rounded-xl shadow-md"
                                        />
                                    ))}
                                </div>
                            ) : post.images.length >= 3 ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {post.images.slice(0, 3).map((image, index) => (
                                        <img
                                            key={index}
                                            src={image || "/placeholder.svg"}
                                            alt={`Post image ${index + 1}`}
                                            className="w-full h-72 object-cover rounded-xl shadow-md"
                                        />
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    )}

                    {post.video && (
                        <div className="relative bg-gray-900 rounded-xl aspect-video flex items-center justify-center overflow-hidden shadow-md">
                            <video
                                src={post.video}
                                controls
                                className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-2 right-2 text-white text-sm font-medium px-2 py-1 bg-black bg-opacity-60 rounded-md">Video</span>
                        </div>
                    )}
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
    )
}
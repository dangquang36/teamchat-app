import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Send, X, MessageCircle, Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { Post, Comment } from "@/app/types";

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

// Enhanced Media Gallery Component
function MediaGallery({ post, isDarkMode }: { post: Post; isDarkMode: boolean }) {
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const hasImages = post.images && post.images.length > 0;
    const hasVideo = post.video;
    const imageCount = hasImages ? post.images!.length : 0;
    const totalMedia = imageCount + (hasVideo ? 1 : 0);

    // Create media array (images first, then video)
    const mediaItems = [
        ...(hasImages ? post.images!.map((img, idx) => ({ type: 'image', src: img, index: idx })) : []),
        ...(hasVideo ? [{ type: 'video', src: post.video, index: imageCount }] : [])
    ];

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    if (totalMedia === 0) return null;

    return (
        <div className="mt-4 ml-16">
            {/* Main Media Display */}
            <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg mb-3">
                {mediaItems[selectedMediaIndex]?.type === 'image' ? (
                    <img
                        src={mediaItems[selectedMediaIndex].src}
                        alt={`Media ${selectedMediaIndex + 1}`}
                        className="w-full h-full object-contain bg-black"
                    />
                ) : (
                    <div className="relative w-full h-full">
                        <video
                            ref={videoRef}
                            src={mediaItems[selectedMediaIndex]?.src}
                            className="w-full h-full object-contain bg-black"
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            controls={false}
                        />

                        {/* Custom Video Controls */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Button
                                onClick={togglePlay}
                                variant="ghost"
                                size="icon"
                                className="w-16 h-16 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm"
                            >
                                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                            </Button>
                        </div>

                        {/* Video Controls Bottom */}
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                            <Button
                                onClick={toggleMute}
                                variant="ghost"
                                size="icon"
                                className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm"
                            >
                                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                            </Button>

                            <Button
                                onClick={() => videoRef.current?.requestFullscreen()}
                                variant="ghost"
                                size="icon"
                                className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm"
                            >
                                <Maximize2 className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Media Counter */}
                {totalMedia > 1 && (
                    <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                        {selectedMediaIndex + 1} / {totalMedia}
                    </div>
                )}
            </div>

            {/* Thumbnail Navigation */}
            {totalMedia > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                    {mediaItems.map((media, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedMediaIndex(index)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedMediaIndex === index
                                ? 'border-blue-500 scale-105'
                                : isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
                                }`}
                        >
                            {media.type === 'image' ? (
                                <img
                                    src={media.src}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                    <Play className="h-6 w-6 text-white" />
                                </div>
                            )}

                            {selectedMediaIndex !== index && (
                                <div className="absolute inset-0 bg-black/30"></div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export function CommentsModal({
    post,
    comments,
    onClose,
    onAddComment,
    onLikeComment,
    isDarkMode,
}: {
    post: Post
    comments: Comment[]
    onClose: () => void
    onAddComment: (postId: string, content: string, parentId?: string) => void
    onLikeComment: (commentId: string) => void
    isDarkMode: boolean
}) {
    const [newComment, setNewComment] = useState("")
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const handleSubmitComment = () => {
        if (!newComment.trim()) return
        onAddComment(post.id, newComment, replyingTo ?? undefined)
        setNewComment("")
        setReplyingTo(null)
    }

    const handleReply = (commentId: string) => {
        setReplyingTo(commentId)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div
                className={`rounded-2xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-hidden flex flex-col shadow-2xl ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
            >
                {/* Header */}
                <div className={`p-6 border-b flex-shrink-0 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <div className="flex items-center justify-between">
                        <h3 className={`text-2xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>Bình luận</h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-full w-10 h-10 hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                {/* Content - Scrollable area */}
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
                    {/* Original Post */}
                    <div className="p-6 border-b border-dashed border-gray-200 dark:border-gray-700">
                        <div className="flex items-start space-x-4">
                            <img
                                src={post.author.avatar || "/placeholder.svg"}
                                alt={post.author.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                            />
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <h4 className={`font-semibold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>{post.author.name}</h4>
                                    <span className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{formatTimeAgo(post.timestamp)}</span>
                                </div>
                                <div
                                    className={`text-base font-normal ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />
                            </div>
                        </div>

                        {/* Enhanced Media Gallery - thay thế phần media cũ */}
                        {(post.images || post.video) && (
                            <MediaGallery post={post} isDarkMode={isDarkMode} />
                        )}
                    </div>

                    {/* Comments Section */}
                    <div className="p-6">
                        {comments.length > 0 ? (
                            <div className="space-y-6">
                                {comments
                                    .filter((c) => c.postId === post.id && !c.parentId)
                                    .sort((a, b) => b.timestamp - a.timestamp)
                                    .map((comment) => (
                                        <div key={comment.id} className="space-y-4">
                                            <div className="flex items-start space-x-4">
                                                <img
                                                    src={comment.author.avatar || "/placeholder.svg"}
                                                    alt={comment.author.name}
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                                                />
                                                <div className="flex-1">
                                                    <div className={`p-4 rounded-xl shadow-sm ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <h5 className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>{comment.author.name}</h5>
                                                            <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{formatTimeAgo(comment.timestamp)}</span>
                                                        </div>
                                                        <p className={`text-sm font-normal ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{comment.content}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-4 mt-3">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => onLikeComment(comment.id)}
                                                            className={`text-xs rounded-full px-4 py-2 ${comment.isLiked ? "text-red-500" : isDarkMode ? "text-gray-400" : "text-gray-600"} hover:bg-red-500/10 transition-all duration-200`}
                                                        >
                                                            <Heart className={`h-4 w-4 mr-1.5 ${comment.isLiked ? "fill-current" : ""}`} />
                                                            {comment.likes}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleReply(comment.id)}
                                                            className={`text-xs rounded-full px-4 py-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"} hover:bg-purple-500/10 transition-all duration-200`}
                                                        >
                                                            Trả lời
                                                        </Button>
                                                    </div>
                                                    {replyingTo === comment.id && (
                                                        <div className="mt-4 ml-6 flex items-center space-x-3">
                                                            <img src="/placeholder.svg?height=32&width=32&text=U" alt="Your avatar" className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-600" />
                                                            <div className="flex-1 flex items-center space-x-3">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Viết trả lời..."
                                                                    value={newComment}
                                                                    onChange={(e) => setNewComment(e.target.value)}
                                                                    onKeyPress={(e) => e.key === "Enter" && handleSubmitComment()}
                                                                    className={`flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-normal ${isDarkMode
                                                                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                                                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
                                                                        } shadow-sm hover:shadow-md transition-all duration-200`}
                                                                />

                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="ml-10 space-y-4">
                                                    {comment.replies.map((reply) => (
                                                        <div key={reply.id} className="flex items-start space-x-4">
                                                            <img
                                                                src={reply.author.avatar || "/placeholder.svg"}
                                                                alt={reply.author.name}
                                                                className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                                                            />
                                                            <div className="flex-1">
                                                                <div className={`p-3 rounded-xl shadow-sm ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                                                                    <div className="flex items-center space-x-2 mb-2">
                                                                        <h5 className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>{reply.author.name}</h5>
                                                                        <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{formatTimeAgo(reply.timestamp)}</span>
                                                                    </div>
                                                                    <p className={`text-sm font-normal ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{reply.content}</p>
                                                                </div>
                                                                <div className="flex items-center space-x-4 mt-3">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => onLikeComment(reply.id)}
                                                                        className={`text-xs rounded-full px-4 py-2 ${reply.isLiked ? "text-red-500" : isDarkMode ? "text-gray-400" : "text-gray-600"} hover:bg-red-500/10 transition-all duration-200`}
                                                                    >
                                                                        <Heart className={`h-4 w-4 mr-1.5 ${reply.isLiked ? "fill-current" : ""}`} />
                                                                        {reply.likes}
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleReply(reply.id)}
                                                                        className={`text-xs rounded-full px-4 py-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"} hover:bg-purple-500/10 transition-all duration-200`}
                                                                    >
                                                                        Trả lời
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <MessageCircle className={`h-20 w-20 mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`} />
                                <p className={`text-lg font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Comment Input - Fixed at bottom */}
                <div className={`p-6 border-t flex-shrink-0 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <div className="flex items-center space-x-4">
                        <img src="/placeholder.svg?height=32&width=32&text=U" alt="Your avatar" className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-600" />
                        <div className="flex-1 flex items-center space-x-3">
                            <input
                                type="text"
                                placeholder={replyingTo ? "Viết trả lời..." : "Viết bình luận..."}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSubmitComment()}
                                className={`flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-normal ${isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
                                    } shadow-sm hover:shadow-md transition-all duration-200`}
                            />
                            <Button
                                onClick={handleSubmitComment}
                                disabled={!newComment.trim()}
                                size="icon"
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-full w-12 h-12 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                <Send className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Send, X, MessageCircle } from "lucide-react";
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

    const formatTimeAgo = (timestamp: number) => {
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div
                className={`rounded-2xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-hidden flex flex-col shadow-2xl ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
            >
                {/* Header của Modal */}
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

                {/* --- THAY ĐỔI: Toàn bộ nội dung chính sẽ nằm trong div cuộn này --- */}
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {/* Phần bài đăng gốc (được đưa vào trong khu vực cuộn) */}
                    <div className="pb-6 border-b border-dashed border-gray-200 dark:border-gray-700">
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
                                <p className={`text-base font-normal ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{post.content}</p>
                            </div>
                        </div>
                        {(post.images || post.video) && (
                            <div className="mt-4">
                                {post.images && post.images.length > 0 && (
                                    <div className="grid gap-3 grid-cols-1">
                                        {post.images.map((image, index) => (
                                            <img
                                                key={index}
                                                src={image || "/placeholder.svg"}
                                                alt={`Post image ${index + 1}`}
                                                className="w-full h-auto max-h-96 object-contain rounded-xl"
                                            />
                                        ))}
                                    </div>
                                )}
                                {post.video && (
                                    <div className="relative bg-gray-900 rounded-xl aspect-video flex items-center justify-center overflow-hidden shadow-md mt-3">
                                        <video
                                            src={post.video}
                                            controls
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
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
                                                                {replyingTo === reply.id && (
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
                                                                            <Button
                                                                                onClick={handleSubmitComment}
                                                                                disabled={!newComment.trim()}
                                                                                size="icon"
                                                                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-full w-10 h-10 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                                                            >
                                                                                <Send className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                )}
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
        </div>
    )
}
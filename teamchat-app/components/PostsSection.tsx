"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Plus,
  ImageIcon,
  Video,
  Paperclip,
  Smile,
  Send,
  Search,
  Globe,
  Lock,
  Eye,
  X,
  Users,
} from "lucide-react"

const emojis = [
  "😊", "😂", "🥰", "😎", "🤩", "🎉", "🔥", "✨", "🚀", "💡",
  "❤️", "👍", "🙏", "💪", "💡", "🤔", "🥳", "🌈", "☀️", "🌙",
  "🐶", "🐱", "🍔", "🍕", "☕", "💻", "📱", "📚", "✈️", "🎵",
];

interface Post {
  id: string
  author: {
    id: string
    name: string
    avatar: string
    title?: string
    verified?: boolean
  }
  content: string
  images?: string[]
  video?: string
  timestamp: number
  likes: number
  comments: number
  shares: number
  bookmarks: number
  isLiked: boolean
  isBookmarked: boolean
  visibility: "public" | "friends" | "private"
  tags?: string[]
  location?: string
  attachments?: { type: "file"; name: string; url: string }[]
}

interface Comment {
  id: string
  postId: string
  author: {
    id: string
    name: string
    avatar: string
  }
  content: string
  timestamp: number
  likes: number
  replies?: Comment[]
  isLiked: boolean
}

const mockPosts: Post[] = [
  {
    id: "1",
    author: {
      id: "1",
      name: "Victoria Lane",
      avatar: "/placeholder.svg?height=40&width=40&text=VL",
      title: "Senior Designer",
      verified: true,
    },
    content:
      "Vừa hoàn thành dự án thiết kế mới cho ứng dụng TeamChat! Rất hào hứng với những tính năng mới mà chúng tôi đã phát triển. Cảm ơn cả team đã làm việc chăm chỉ! 🎨✨",
    images: [
      "/placeholder.svg?height=300&width=400&text=Design1",
      "/placeholder.svg?height=300&width=400&text=Design2",
    ],
    timestamp: Date.now() - 3600000,
    likes: 24,
    comments: 8,
    shares: 3,
    bookmarks: 12,
    isLiked: true,
    isBookmarked: false,
    visibility: "public",
    tags: ["design", "teamchat", "ui"],
    location: "Hà Nội, Việt Nam",
  },
  {
    id: "2",
    author: {
      id: "2",
      name: "James Pinard",
      avatar: "/placeholder.svg?height=40&width=40&text=JP",
      title: "Frontend Developer",
    },
    content:
      "Chia sẻ một số tips về React hooks mà tôi đã học được tuần này. Việc sử dụng useCallback và useMemo đúng cách thực sự có thể cải thiện performance đáng kể!",
    timestamp: Date.now() - 7200000,
    likes: 18,
    comments: 12,
    shares: 6,
    bookmarks: 8,
    isLiked: false,
    isBookmarked: true,
    visibility: "public",
    tags: ["react", "javascript", "programming"],
  },
  {
    id: "3",
    author: {
      id: "3",
      name: "Etla McDaniel",
      avatar: "/placeholder.svg?height=40&width=40&text=EM",
      title: "Product Manager",
    },
    content:
      "Team meeting hôm nay thật tuyệt vời! Chúng ta đã thảo luận về roadmap Q1 và tôi rất phấn khích với những tính năng mới sắp ra mắt. 🚀",
    video: "/placeholder.svg?height=200&width=400&text=Video",
    timestamp: Date.now() - 10800000,
    likes: 31,
    comments: 15,
    shares: 4,
    bookmarks: 6,
    isLiked: true,
    isBookmarked: false,
    visibility: "friends",
    tags: ["teamwork", "planning"],
  },
]

const mockComments: Comment[] = [
  {
    id: "1",
    postId: "1",
    author: {
      id: "4",
      name: "Ronald Downey",
      avatar: "/placeholder.svg?height=32&width=32&text=RD",
    },
    content: "Thiết kế rất đẹp! Tôi thích cách bạn sử dụng màu sắc.",
    timestamp: Date.now() - 1800000,
    likes: 3,
    isLiked: false,
  },
  {
    id: "2",
    postId: "1",
    author: {
      id: "5",
      name: "Kathryn Swarey",
      avatar: "/placeholder.svg?height=32&width=32&text=KS",
    },
    content: "Có thể chia sẻ process thiết kế được không? Tôi rất muốn học hỏi!",
    timestamp: Date.now() - 3600000,
    likes: 5,
    isLiked: true,
  },
]

export function PostsSection({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const postsContainerRef = useRef<HTMLDivElement>(null)

  const handleLikePost = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          }
          : post,
      ),
    )
  }

  const handleBookmarkPost = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
            ...post,
            isBookmarked: !post.isBookmarked,
            bookmarks: post.isBookmarked ? post.bookmarks - 1 : post.bookmarks + 1,
          }
          : post,
      ),
    )
  }

  const handleSharePost = (postId: string) => {
    setPosts(posts.map((post) => (post.id === postId ? { ...post, shares: post.shares + 1 } : post)))
    console.log("Sharing post:", postId)
  }


  const scrollToTop = () => {
    if (postsContainerRef.current) {
      postsContainerRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const scrollToBottom = () => {
    if (postsContainerRef.current) {
      postsContainerRef.current.scrollTo({
        top: postsContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }

  const filteredPosts = posts
    .filter((post) => {
      return (
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (post.location && post.location.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })
    .sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="flex-1 flex min-w-0 overflow-hidden">
      {/* Posts Feed */}
      <div className={`flex-1 flex flex-col transition-colors ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        {/* Header */}
        <div
          className={`p-4 border-b flex-shrink-0 transition-colors ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Bài Đăng</h2>
            <Button onClick={() => setShowCreatePost(true)} className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-4 py-2 shadow-lg">
              <Plus className="h-5 w-5 mr-2" />
              Tạo bài viết
            </Button>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
              />
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div ref={postsContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6 relative">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => handleLikePost(post.id)}
              onBookmark={() => handleBookmarkPost(post.id)}
              onShare={() => handleSharePost(post.id)}
              onComment={() => setSelectedPost(post)}
              isDarkMode={isDarkMode}
            />
          ))}

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className={`text-gray-500 ${isDarkMode ? "text-gray-400" : ""}`}>
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl font-medium mb-2">Không tìm thấy bài viết nào</p>
                <p className="text-md">Thử thay đổi từ khóa tìm kiếm</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSubmit={(newPost) => {
          setPosts([newPost, ...posts])
          setShowCreatePost(false)
        }}
        isDarkMode={isDarkMode}
      />

      {/* Comments Modal */}
      {selectedPost && (
        <CommentsModal
          post={selectedPost}
          comments={comments.filter((c) => c.postId === selectedPost.id)}
          onClose={() => setSelectedPost(null)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  )
}

function PostCard({
  post,
  onLike,
  onBookmark,
  onShare,
  onComment,
  isDarkMode,
}: {
  post: Post
  onLike: () => void
  onBookmark: () => void
  onShare: () => void
  onComment: () => void
  isDarkMode: boolean
}) {
  const getVisibilityIcon = (): JSX.Element => {
    switch (post.visibility) {
      case "public":
        return <Globe className="h-4 w-4" />
      case "friends":
        return <Users className="h-4 w-4" />
      case "private":
        return <Lock className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  return (
    <div
      className={`rounded-xl border p-6 transition-colors shadow-md ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
    >
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.author.avatar || "/placeholder.svg"}
            alt={post.author.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`font-semibold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>{post.author.name}</h3>
              {post.author.verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
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
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{post.author.title}</p>
            )}
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {formatTimeAgo(post.timestamp)}
              </span>
              <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{getVisibilityIcon()}</div>
              {post.location && (
                <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>• {post.location}</span>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="rounded-full">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className={`text-base leading-relaxed ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>{post.content}</p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Media */}
      {post.images && post.images.length > 0 && (
        <div className="mb-4">
          {post.images.length === 1 ? (
            <img
              src={post.images[0] || "/placeholder.svg"}
              alt="Post image"
              className="w-full h-64 object-cover rounded-lg shadow-sm"
            />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {post.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg shadow-sm"
                  />
                  {index === 3 && post.images!.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">+{post.images!.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {post.video && (
        <div className="mb-4">
          <div className="relative bg-gray-900 rounded-lg aspect-video flex items-center justify-center overflow-hidden shadow-sm">
            <img src={post.video} alt="Video preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <div className="w-16 h-16 bg-white bg-opacity-30 rounded-full flex items-center justify-center cursor-pointer">
                <div className="w-0 h-0 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1"></div>
              </div>
            </div>
            <span className="absolute bottom-2 right-2 text-white text-sm font-medium px-2 py-1 bg-black bg-opacity-60 rounded-md">Video</span>
          </div>
        </div>
      )}

      {post.attachments && post.attachments.length > 0 && (
        <div className="mb-4">
          <h4 className={`font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Tệp đính kèm:</h4>
          <div className="space-y-2">
            {post.attachments.map((attachment, index) => (
              <a
                key={index}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
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
        className={`flex items-center justify-between py-2 border-t border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
      >
        <div className="flex items-center space-x-4 text-sm">
          <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>{post.likes} lượt thích</span>
          <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>{post.comments} bình luận</span>
        </div>
        <div className="flex items-center space-x-2">
          <Eye className={`h-4 w-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
          <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{Math.floor(Math.random() * 1000) + 100}</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-3">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            className={`flex items-center space-x-2 rounded-full px-4 py-2 ${post.isLiked ? "text-red-500" : isDarkMode ? "text-gray-400" : "text-gray-500"} hover:bg-red-500/10`}
          >
            <Heart className={`h-5 w-5 ${post.isLiked ? "fill-current" : ""}`} />
            <span>Thích</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onComment}
            className={`rounded-full px-4 py-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"} hover:bg-purple-500/10`}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Bình luận
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className={`rounded-full px-4 py-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"} hover:bg-blue-500/10`}
          >
          </Button>
        </div>
      </div>
    </div>
  )
}
function CreatePostModal({
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-xl p-6 max-w-2xl w-full mx-auto max-h-[95vh] overflow-y-auto shadow-2xl transition-colors ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
      >
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h3 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Tạo bài viết mới</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full w-8 h-8 hover:bg-gray-200 dark:hover:bg-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-5">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <img
              src="/placeholder.svg?height=40&width=40&text=U"
              alt="Your avatar"
              className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
            />
            <div>
              <h4 className={`font-semibold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>Bạn</h4>
              <div className="relative inline-block text-left">
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className={`text-sm font-medium border rounded-full px-3 py-1 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300 text-gray-700"}`}
                >
                  <option value="public">🌍 Công khai</option>
                  <option value="friends">👥 Bạn bè</option>
                  <option value="private">🔒 Riêng tư</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9l4.95 4.95z" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <textarea
            placeholder="Bạn đang nghĩ gì?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-base ${isDarkMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
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
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDarkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-sm px-3 py-1 rounded-full flex items-center transition-colors ${isDarkMode ? "bg-purple-700 text-white" : "bg-purple-100 text-purple-700"}`}
                  >
                    #{tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className={`ml-2 rounded-full p-0.5 ${isDarkMode ? "hover:bg-purple-600" : "hover:bg-purple-200"}`}>
                      <X className={`h-3 w-3 ${isDarkMode ? "text-white" : "text-purple-700"}`} />
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
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDarkMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
          />

          {/* Media Options & Upload */}
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="image-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild className={`rounded-full px-4 py-2 flex items-center space-x-2 ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}>
                <>
                  <ImageIcon className="h-5 w-5" />
                  <span>Ảnh</span>
                </>
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
              <Button variant="outline" size="sm" asChild className={`rounded-full px-4 py-2 flex items-center space-x-2 ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}>
                <>
                  <Video className="h-5 w-5" />
                  <span>Video</span>
                </>
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
              <Button variant="outline" size="sm" asChild className={`rounded-full px-4 py-2 flex items-center space-x-2 ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}>
                <>
                  <Paperclip className="h-5 w-5" />
                  <span>Tệp</span>
                </>
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
                className={`rounded-full px-4 py-2 flex items-center space-x-2 ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}
              >
                <Smile className="h-5 w-5" />
                <span>Cảm xúc</span>
              </Button>

              {showEmojiPicker && (
                <div
                  className={`absolute bottom-full mb-2 left-0 w-64 p-3 rounded-lg shadow-xl grid grid-cols-6 gap-2 z-10 ${isDarkMode ? "bg-gray-700 border border-gray-600" : "bg-white border border-gray-200"}`}
                >
                  {emojis.map((emoji, index) => (
                    <span
                      key={index}
                      onClick={() => handleSelectEmoji(emoji)}
                      className="cursor-pointer text-2xl hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md p-1 flex items-center justify-center transition-colors"
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedImages.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-3">
              {selectedImages.map((file, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Selected image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                    className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 text-xs hover:bg-opacity-80 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedVideo && (
            <div className="relative mt-3">
              <video src={URL.createObjectURL(selectedVideo)} controls className="w-full max-h-64 object-cover rounded-lg shadow-sm" />
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1.5 text-xs hover:bg-opacity-80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {selectedAttachments.length > 0 && (
            <div className="space-y-2 mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
              <p className={`text-base font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Tệp đã chọn:</p>
              {selectedAttachments.map((file, index) => (
                <div key={index} className={`flex items-center justify-between p-2 rounded-lg ${isDarkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-100 hover:bg-gray-200"} transition-colors`}>
                  <div className="flex items-center space-x-2">
                    <Paperclip className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                    <span className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAttachments(selectedAttachments.filter((_, i) => i !== index))}
                    className={`text-sm font-medium rounded-full p-1 ${isDarkMode ? "text-red-400 hover:bg-red-900" : "text-red-600 hover:bg-red-100"}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t pt-4">
            <Button variant="outline" onClick={onClose} className={`rounded-full px-5 py-2 ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() && selectedImages.length === 0 && !selectedVideo && selectedAttachments.length === 0}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 py-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Đăng bài
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CommentsModal({
  post,
  comments,
  onClose,
  isDarkMode,
}: {
  post: Post
  comments: Comment[]
  onClose: () => void
  isDarkMode: boolean
}) {
  const [newComment, setNewComment] = useState("")

  const handleSubmitComment = () => {
    if (!newComment.trim()) return
    console.log("Adding comment:", newComment, "to post:", post.id)
    setNewComment("")
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-xl max-w-2xl w-full mx-auto max-h-[95vh] overflow-hidden flex flex-col shadow-2xl ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
      >
        <div className={`p-4 border-b flex-shrink-0 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Bình luận</h3>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full w-8 h-8 hover:bg-gray-200 dark:hover:bg-gray-700">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className={`p-4 border-b flex-shrink-0 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex items-start space-x-3">
            <img
              src={post.author.avatar || "/placeholder.svg"}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{post.author.name}</h4>
                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{formatTimeAgo(post.timestamp)}</span>
              </div>
              <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>{post.content}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <img
                    src={comment.author.avatar || "/placeholder.svg"}
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>{comment.author.name}</h5>
                        <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{formatTimeAgo(comment.timestamp)}</span>
                      </div>
                      <p className={`text-sm ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>{comment.content}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-xs rounded-full px-3 ${comment.isLiked ? "text-red-500" : isDarkMode ? "text-gray-400" : "text-gray-500"} hover:bg-red-500/10`}
                      >
                        <Heart className={`h-3 w-3 mr-1 ${comment.isLiked ? "fill-current" : ""}`} />
                        {comment.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-xs rounded-full px-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"} hover:bg-purple-500/10`}
                      >
                        Trả lời
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`} />
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            </div>
          )}
        </div>

        <div className={`p-4 border-t flex-shrink-0 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex items-center space-x-3">
            <img src="/placeholder.svg?height=32&width=32&text=U" alt="Your avatar" className="w-9 h-9 rounded-full object-cover" />
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Viết bình luận..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSubmitComment()}
                className={`flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                size="icon"
                className="bg-purple-600 hover:bg-purple-700 rounded-full w-10 h-10 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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

function formatTimeAgo(timestamp: number) {
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
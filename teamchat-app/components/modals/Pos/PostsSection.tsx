"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, Search } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { Post } from "@/app/types";
import { PostCard } from "./PostCard";
import { CreatePostModal } from "./CreatePostModal";
import { CommentsModal } from "./CommentsModal";

export function PostsSection({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const {
    filteredPosts,
    comments,
    searchQuery,
    setSearchQuery,
    handleLikePost,
    handleBookmarkPost,
    handleSharePost,
    addPost,
    addComment,
    handleLikeComment,
    deletePost,
    updatePost,
  } = usePosts();

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchExpanded) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchExpanded]);

  const handleSearchToggle = () => {
    if (isSearchExpanded && !searchQuery) {
      setIsSearchExpanded(false);
    } else {
      setIsSearchExpanded(true);
    }
  };

  // Handle delete post - xóa bỏ confirmation dialog
  const handleDeletePost = (postId: string) => {
    deletePost?.(postId);
  };

  // Handle change visibility
  const handleChangeVisibility = (postId: string, visibility: "public" | "friends" | "private") => {
    updatePost?.(postId, { visibility });
  };

  return (
    <div className="flex-1 flex min-w-0 overflow-hidden">
      <div className={`flex-1 flex flex-col transition-colors duration-300 ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
        {/* Header */}
        <div className={`p-4 border-b flex-shrink-0 transition-colors duration-300 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow-sm`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Bài Đăng
            </h2>

            {/* Search Bar */}
            <div className="relative">
              <div className={`flex items-center transition-all duration-300 ${isSearchExpanded ? 'w-80' : 'w-auto'}`}>
                {isSearchExpanded && (
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Tìm kiếm bài viết..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onBlur={() => !searchQuery && setIsSearchExpanded(false)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-full outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm ${isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
                        }`}
                    />
                  </div>
                )}
                {!isSearchExpanded && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSearchToggle}
                    className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Create Post */}
        <div className={`p-4 border-b ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex items-center space-x-3">
            <img
              src="/placeholder.svg?height=40&width=40&text=U"
              alt="Your avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <button
              onClick={() => setShowCreatePost(true)}
              className={`flex-1 text-left px-4 py-3 rounded-full transition-colors duration-200 ${isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300 placeholder-gray-400"
                : "bg-gray-100 hover:bg-gray-200 text-gray-500"
                }`}
            >
              Bạn đang nghĩ gì?
            </button>
          </div>
        </div>

        {/* Posts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className={`text-gray-500 ${isDarkMode ? "text-gray-400" : ""}`}>
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl font-semibold mb-2">Không tìm thấy bài viết nào</p>
                <p className="text-sm text-gray-400">
                  {searchQuery ? "Thử thay đổi từ khóa tìm kiếm" : "Hãy tạo bài viết đầu tiên của bạn"}
                </p>
              </div>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleLikePost(post.id)}
                onBookmark={() => handleBookmarkPost(post.id)}
                onShare={() => handleSharePost(post.id)}
                onComment={() => setSelectedPost(post)}
                onDelete={() => handleDeletePost(post.id)}
                onChangeVisibility={(visibility) => handleChangeVisibility(post.id, visibility)}
                isDarkMode={isDarkMode}
              />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSubmit={(newPost: Post) => {
          addPost(newPost);
          setShowCreatePost(false);
        }}
        isDarkMode={isDarkMode}
      />

      {selectedPost && (
        <CommentsModal
          post={selectedPost}
          comments={comments.filter((c) => c.postId === selectedPost.id)}
          onClose={() => setSelectedPost(null)}
          onAddComment={addComment}
          onLikeComment={handleLikeComment}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
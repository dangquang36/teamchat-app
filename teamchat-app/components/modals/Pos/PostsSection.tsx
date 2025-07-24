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
  } = usePosts();

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const postsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSearchActive) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchActive]);

  return (
    <div className="flex-1 flex min-w-0 overflow-hidden">
      <div className={`flex-1 flex flex-col transition-colors duration-300 ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
        {/* Header và thanh tìm kiếm */}
        <div className={`p-6 border-b flex-shrink-0 transition-colors duration-300 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow-sm`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>Bài Đăng</h2>
            <Button
              onClick={() => setShowCreatePost(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full px-6 py-2.5 shadow-md transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Tạo bài viết
            </Button>
          </div>

          <div className="relative flex items-center justify-end w-full h-12">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-opacity duration-300 pointer-events-none ${isSearchActive ? 'opacity-100' : 'opacity-0'}`} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => !searchQuery && setIsSearchActive(false)}
              className={`w-full pl-12 pr-4 py-3 border rounded-full outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ease-in-out text-sm absolute top-0 right-0 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"} ${isSearchActive ? 'w-full opacity-100' : 'w-12 opacity-0 pointer-events-none'}`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchActive(true)}
              className={`rounded-full transition-opacity duration-300 ${isSearchActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </Button>
          </div>
        </div>

        {/* Danh sách bài đăng */}
        <div ref={postsContainerRef} className="flex-1 overflow-y-auto p-6 space-y-8 relative scrollbar-hide">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className={`text-gray-500 ${isDarkMode ? "text-gray-400" : ""}`}>
                <MessageCircle className="h-20 w-20 mx-auto mb-4 opacity-50" />
                <p className="text-2xl font-semibold mb-2">Không tìm thấy bài viết nào</p>
                <p className="text-md text-gray-400">Thử thay đổi từ khóa tìm kiếm hoặc tạo bài viết mới.</p>
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
                isDarkMode={isDarkMode}
              />
            ))
          )}
        </div>
      </div>

      {/* Các Modals */}
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

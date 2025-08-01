"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, MoreVertical, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/ThemeContext";
import { usePosts } from "@/hooks/usePosts";
import { Post } from "@/app/types";

export default function PostDetailPage() {
    const { isDarkMode } = useTheme();
    const router = useRouter();
    const params = useParams();
    const postId = params.postId as string;

    const { posts, handleLikePost, handleBookmarkPost, handleSharePost } = usePosts();
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('🔍 Looking for post:', postId);
        console.log('📊 Available posts:', posts.length);

        if (postId) {
            // Always try to find the post, even if posts array is empty initially
            const foundPost = posts.find(p => p.id === postId);
            console.log('🎯 Found post:', foundPost ? foundPost.title : 'not found');

            setPost(foundPost || null);
            setIsLoading(false);
        }
    }, [postId, posts]);

    const handleBack = () => {
        router.back();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getVisibilityInfo = (post: Post) => {
        switch (post.visibility) {
            case 'public':
                return { text: 'Công khai', color: 'bg-green-100 text-green-800', icon: '🌍' };
            case 'channels':
                return { text: `${post.sharedChannels?.length || 0} kênh`, color: 'bg-blue-100 text-blue-800', icon: '👥' };
            case 'private':
                return { text: 'Riêng tư', color: 'bg-red-100 text-red-800', icon: '🔒' };
            default:
                return { text: 'Không xác định', color: 'bg-gray-100 text-gray-800', icon: '❓' };
        }
    };

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Đang tải bài viết...</p>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <h2 className="text-2xl font-bold mb-2">Không tìm thấy bài viết</h2>
                    <p className="text-gray-500 mb-4">Bài viết này có thể đã bị xóa hoặc bạn không có quyền truy cập.</p>
                    <Button onClick={handleBack} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                </div>
            </div>
        );
    }

    const visibilityInfo = getVisibilityInfo(post);

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className={`sticky top-0 z-10 backdrop-blur-sm ${isDarkMode ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-gray-200'} border-b`}>
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" onClick={handleBack} className="flex items-center">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại
                        </Button>
                        <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className={visibilityInfo.color}>
                                <span className="mr-1">{visibilityInfo.icon}</span>
                                {visibilityInfo.text}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <article className={`rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border`}>
                    {/* Article Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                    <AvatarFallback className="bg-blue-600 text-white">
                                        {post.author.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {post.author.name}
                                    </h3>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {formatDate(post.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Title */}
                        <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {post.title}
                        </h1>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Article Content */}
                    <div className="p-6">
                        <div
                            className={`prose prose-lg max-w-none ${isDarkMode ? 'prose-invert' : ''}`}
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </div>

                    {/* Article Footer */}
                    <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleLikePost(post.id)}
                                    className={`flex items-center space-x-2 ${post.isLiked ? 'text-red-500' : ''}`}
                                >
                                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                                    <span>{post.likes}</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>{post.comments}</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSharePost(post.id)}
                                    className="flex items-center space-x-2"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span>{post.shares}</span>
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleBookmarkPost(post.id)}
                                className={post.isBookmarked ? 'text-yellow-500' : ''}
                            >
                                <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </article>

                {/* Shared Channels Info */}
                {post.visibility === 'channels' && post.sharedChannels && post.sharedChannels.length > 0 && (
                    <Card className={`mt-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                        <CardHeader>
                            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Được chia sẻ đến các kênh
                            </h3>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {post.sharedChannels.slice(0, 5).map((channelId, index) => (
                                    <Badge key={index} variant="secondary">
                                        #{channelId}
                                    </Badge>
                                ))}
                                {post.sharedChannels.length > 5 && (
                                    <Badge variant="outline">
                                        +{post.sharedChannels.length - 5} kênh khác
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Related Posts - Placeholder */}
                <div className="mt-8">
                    <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Bài viết liên quan
                    </h3>
                    <div className={`text-center py-8 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                        <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Tính năng bài viết liên quan sẽ được phát triển trong tương lai</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
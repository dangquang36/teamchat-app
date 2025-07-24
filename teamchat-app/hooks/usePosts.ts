import { useState, useMemo } from "react"
import { Post, Comment } from "@/app/types"
import { mockPosts, mockComments } from "@/data/mockData"

export const usePosts = () => {
    const [posts, setPosts] = useState<Post[]>(mockPosts)
    const [comments, setComments] = useState<Comment[]>(mockComments)
    const [searchQuery, setSearchQuery] = useState("")

    const handleLikePost = (postId: string) => {
        setPosts((prev) =>
            prev.map((post) =>
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
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? { ...post, isBookmarked: !post.isBookmarked }
                    : post,
            ),
        )
    }

    const handleSharePost = (postId: string) => {
        setPosts(posts.map((post) => (post.id === postId ? { ...post, shares: post.shares + 1 } : post)))
        console.log("Chia sẻ bài viết:", postId);
    }

    const addPost = (newPost: Post) => {
        setPosts((prev) => [newPost, ...prev])
    }

    const addComment = (postId: string, content: string, parentId?: string) => {
        const newComment: Comment = {
            id: Date.now().toString(),
            postId,
            parentId,
            author: {
                id: "current-user",
                name: "Bạn",
                avatar: "/placeholder.svg?height=32&width=32&text=U",
            },
            content,
            timestamp: Date.now(),
            likes: 0,
            isLiked: false,
        }

        setComments((prev) => {
            if (parentId) {
                return prev.map((comment) =>
                    comment.id === parentId
                        ? { ...comment, replies: [...(comment.replies || []), newComment] }
                        : comment,
                )
            }
            return [newComment, ...prev]
        })

        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId ? { ...post, comments: post.comments + 1 } : post,
            ),
        )
    }

    const handleLikeComment = (commentId: string) => {
        const likeLogic = (c: Comment) => ({
            ...c,
            isLiked: !c.isLiked,
            likes: c.isLiked ? c.likes - 1 : c.likes + 1
        });

        setComments(prev =>
            prev.map(comment => {
                if (comment.id === commentId) return likeLogic(comment);
                if (comment.replies) {
                    return {
                        ...comment,
                        replies: comment.replies.map(reply =>
                            reply.id === commentId ? likeLogic(reply) : reply
                        )
                    }
                }
                return comment;
            })
        );
    }

    const filteredPosts = useMemo(
        () =>
            posts
                .filter(
                    (post) =>
                        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        post.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
                )
                .sort((a, b) => b.timestamp - a.timestamp),
        [posts, searchQuery],
    )

    return {
        posts,
        comments,
        filteredPosts,
        searchQuery,
        setSearchQuery,
        handleLikePost,
        handleBookmarkPost,
        handleSharePost,
        addPost,
        addComment,
        handleLikeComment,
    }
}
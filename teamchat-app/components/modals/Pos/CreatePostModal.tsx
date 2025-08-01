"use client";

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    X,
    Bold,
    Italic,
    List,
    ListOrdered,
    Image as ImageIcon,
    Video,
    FileText,
    Globe,
    Lock,
    Users,
    Send,
    Hash
} from "lucide-react";
import { useChannels } from "@/contexts/ChannelContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Post } from "@/app/types";

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (newPost: Post) => void;
    isDarkMode?: boolean;
}

interface ChannelSelection {
    id: string;
    name: string;
    selected: boolean;
}

export function CreatePostModal({ isOpen, onClose, onSubmit, isDarkMode = false }: CreatePostModalProps) {
    const [title, setTitle] = useState("");
    const [visibility, setVisibility] = useState<"public" | "channels" | "private">("public");
    const [selectedChannels, setSelectedChannels] = useState<ChannelSelection[]>([]);
    const { channels } = useChannels();
    const currentUser = useCurrentUser();

    // Initialize Tiptap editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Bạn đang nghĩ gì? Chia sẻ ý tưởng của bạn..."
            })
        ],
        content: '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 ${isDarkMode ? 'prose-invert' : ''
                    }`
            }
        }
    });

    // Initialize selected channels when modal opens
    useEffect(() => {
        if (isOpen && channels.length > 0) {
            setSelectedChannels(
                channels.map(channel => ({
                    id: channel.id,
                    name: channel.name,
                    selected: false
                }))
            );
        }
    }, [isOpen, channels]);

    // Cleanup when modal closes
    useEffect(() => {
        if (!isOpen) {
            setTitle("");
            setVisibility("public");
            setSelectedChannels([]);
            editor?.commands.clearContent();
        }
    }, [isOpen, editor]);

    const toggleChannelSelection = (channelId: string) => {
        setSelectedChannels(prev =>
            prev.map(channel =>
                channel.id === channelId
                    ? { ...channel, selected: !channel.selected }
                    : channel
            )
        );
    };

    const handleSubmit = () => {
        if (!title.trim() || !editor?.getHTML().trim() || !currentUser) {
            return;
        }

        const selectedChannelIds = selectedChannels
            .filter(channel => channel.selected)
            .map(channel => channel.id);

        const newPost: Post = {
            id: Date.now().toString(),
            author: {
                id: currentUser.id,
                name: currentUser.name,
                avatar: currentUser.avatar || "/placeholder.svg?height=40&width=40&text=U"
            },
            title: title.trim(),
            content: editor.getHTML(),
            plainTextContent: editor.getText(), // For search functionality
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            likes: 0,
            comments: 0,
            shares: 0,
            isLiked: false,
            isBookmarked: false,
            visibility: visibility,
            sharedChannels: visibility === "channels" ? selectedChannelIds : [],
            tags: extractHashtags(editor.getText()),
            timestamp: Date.now() // Add timestamp for consistency
        };

        console.log('📝 Creating new post:', newPost.title);
        console.log('👁️ Visibility:', newPost.visibility);
        console.log('📢 Shared channels:', newPost.sharedChannels);

        onSubmit(newPost);
        onClose();
    };

    const extractHashtags = (text: string): string[] => {
        const hashtags = text.match(/#[\w\u00C0-\u024F\u1E00-\u1EFF]+/g);
        return hashtags ? hashtags.map(tag => tag.substring(1)) : [];
    };

    const getVisibilityIcon = () => {
        switch (visibility) {
            case "public": return <Globe className="w-4 h-4" />;
            case "channels": return <Users className="w-4 h-4" />;
            case "private": return <Lock className="w-4 h-4" />;
        }
    };

    const getVisibilityText = () => {
        switch (visibility) {
            case "public": return "Công khai";
            case "channels": return "Chọn kênh";
            case "private": return "Riêng tư";
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-3xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden ${isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white"
                }`}>
                {/* Header */}
                <div className={`p-6 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <div className="flex items-center justify-between">
                        <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            Tạo Bài Viết Mới
                        </h2>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="p-6 space-y-6">
                        {/* Author Info */}
                        <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12">
                                <AvatarImage
                                    src={currentUser?.avatar || "/placeholder.svg?height=48&width=48&text=U"}
                                    alt={currentUser?.name || "User"}
                                />
                                <AvatarFallback className="bg-blue-600 text-white text-lg">
                                    {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    {currentUser?.name || "Unknown User"}
                                </h3>
                                <div className="flex items-center space-x-2">
                                    {getVisibilityIcon()}
                                    <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        {getVisibilityText()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Title Input */}
                        <div>
                            <Input
                                placeholder="Tiêu đề bài viết..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className={`text-lg font-medium border-0 border-b rounded-none px-0 focus-visible:ring-0 ${isDarkMode
                                    ? "bg-transparent text-white placeholder-gray-400 border-gray-700"
                                    : "bg-transparent border-gray-200"
                                    }`}
                            />
                        </div>

                        {/* Editor Toolbar */}
                        {editor && (
                            <div className={`flex items-center space-x-2 p-2 rounded-lg border ${isDarkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"
                                }`}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                    className={editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : ''}
                                >
                                    <Bold className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                    className={editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : ''}
                                >
                                    <Italic className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                                    className={editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : ''}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                    className={editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : ''}
                                >
                                    <ListOrdered className="w-4 h-4" />
                                </Button>
                                <Separator orientation="vertical" className="h-6" />
                                <Button variant="ghost" size="sm">
                                    <ImageIcon className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <Video className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <FileText className="w-4 h-4" />
                                </Button>
                            </div>
                        )}

                        {/* Editor Content */}
                        <div className={`border rounded-lg min-h-[200px] ${isDarkMode ? "border-gray-700" : "border-gray-200"
                            }`}>
                            <EditorContent editor={editor} />
                        </div>

                        {/* Visibility Settings */}
                        <Card className={isDarkMode ? "bg-gray-800 border-gray-700" : ""}>
                            <CardHeader className="pb-3">
                                <h4 className={`font-semibold flex items-center ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    <Users className="w-4 h-4 mr-2" />
                                    Ai có thể xem bài viết này?
                                </h4>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant={visibility === "public" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setVisibility("public")}
                                        className="flex items-center space-x-2"
                                    >
                                        <Globe className="w-4 h-4" />
                                        <span>Công khai</span>
                                    </Button>
                                    <Button
                                        variant={visibility === "channels" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setVisibility("channels")}
                                        className="flex items-center space-x-2"
                                    >
                                        <Hash className="w-4 h-4" />
                                        <span>Chọn kênh</span>
                                    </Button>
                                    <Button
                                        variant={visibility === "private" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setVisibility("private")}
                                        className="flex items-center space-x-2"
                                    >
                                        <Lock className="w-4 h-4" />
                                        <span>Riêng tư</span>
                                    </Button>
                                </div>

                                {/* Channel Selection */}
                                {visibility === "channels" && (
                                    <div className="mt-4">
                                        <p className={`text-sm mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                            Chọn kênh để chia sẻ bài viết:
                                        </p>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {selectedChannels.map((channel) => (
                                                <div
                                                    key={channel.id}
                                                    className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${channel.selected
                                                        ? isDarkMode
                                                            ? "bg-blue-900/50 border border-blue-600"
                                                            : "bg-blue-50 border border-blue-200"
                                                        : isDarkMode
                                                            ? "hover:bg-gray-700"
                                                            : "hover:bg-gray-50"
                                                        }`}
                                                    onClick={() => toggleChannelSelection(channel.id)}
                                                >
                                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${channel.selected
                                                        ? "bg-blue-600 border-blue-600"
                                                        : isDarkMode
                                                            ? "border-gray-500"
                                                            : "border-gray-300"
                                                        }`}>
                                                        {channel.selected && (
                                                            <div className="w-2 h-2 bg-white rounded-full" />
                                                        )}
                                                    </div>
                                                    <Hash className="w-4 h-4 text-gray-500" />
                                                    <span className={isDarkMode ? "text-white" : "text-gray-900"}>
                                                        {channel.name}
                                                    </span>
                                                    {channel.selected && (
                                                        <Badge variant="secondary" className="ml-auto">
                                                            Đã chọn
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {selectedChannels.filter(c => c.selected).length > 0 && (
                                            <p className={`text-sm mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                                Đã chọn {selectedChannels.filter(c => c.selected).length} kênh
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-6 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <div className="flex justify-end space-x-3">
                        <Button variant="outline" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!title.trim() || !editor?.getText().trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Đăng bài
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
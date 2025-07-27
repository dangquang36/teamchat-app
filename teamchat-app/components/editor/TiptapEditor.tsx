// components/editor/TiptapEditor.tsx (Enhanced with Icon Support & Facebook-style Media)
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect, useState } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { Button } from "@/components/ui/button"
import {
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    ImageIcon,
    X,
    ExternalLink,
    Upload,
    Eye,
    EyeOff,
    Globe,
    Smile,
    Heart,
    ThumbsUp,
    Star,
    Coffee,
    Music,
    Gift,
    Camera,
    MapPin,
    Sun,
    Moon,
    Zap,
    Award,
    Target,
    Bookmark,
    Flag,
    Crown,
    Sparkles,
    Rocket,
    Flame,
    Gem
} from "lucide-react"

interface TiptapEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
    isDarkMode?: boolean
}

// Icon picker modal
function IconPickerModal({
    isOpen,
    onClose,
    onSelectIcon,
    isDarkMode
}: {
    isOpen: boolean;
    onClose: () => void;
    onSelectIcon: (icon: string) => void;
    isDarkMode: boolean;
}) {
    const icons = [
        { icon: Smile, name: "smile", label: "😊" },
        { icon: Heart, name: "heart", label: "❤️" },
        { icon: ThumbsUp, name: "thumbs-up", label: "👍" },
        { icon: Star, name: "star", label: "⭐" },
        { icon: Flame, name: "flame", label: "🔥" },
        { icon: Coffee, name: "coffee", label: "☕" },
        { icon: Music, name: "music", label: "🎵" },
        { icon: Gift, name: "gift", label: "🎁" },
        { icon: Camera, name: "camera", label: "📷" },
        { icon: MapPin, name: "map-pin", label: "📍" },
        { icon: Sun, name: "sun", label: "☀️" },
        { icon: Moon, name: "moon", label: "🌙" },
        { icon: Zap, name: "zap", label: "⚡" },
        { icon: Award, name: "award", label: "🏆" },
        { icon: Target, name: "target", label: "🎯" },
        { icon: Bookmark, name: "bookmark", label: "🔖" },
        { icon: Flag, name: "flag", label: "🚩" },
        { icon: Crown, name: "crown", label: "👑" },
        { icon: Gem, name: "gem", label: "💎" },
        { icon: Sparkles, name: "sparkles", label: "✨" },
        { icon: Rocket, name: "rocket", label: "🚀" },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all duration-200 max-h-[80vh] overflow-y-auto ${isDarkMode ? "bg-gray-800 text-white border border-gray-700" : "bg-white text-gray-900 border border-gray-200"}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Chọn icon
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-6 gap-3">
                    {icons.map(({ icon: IconComponent, name, label }) => (
                        <button
                            key={name}
                            onClick={() => {
                                onSelectIcon(label);
                                onClose();
                            }}
                            className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 ${isDarkMode
                                ? "hover:bg-gray-700 border border-gray-600"
                                : "hover:bg-gray-100 border border-gray-200"
                                }`}
                            title={name}
                        >
                            <IconComponent className="h-6 w-6 mx-auto text-purple-600" />
                            <span className="text-xs mt-1 block">{label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Enhanced Modal with File Upload and URL Input
function MediaUploadModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    placeholder,
    initialValue = "",
    isDarkMode,
    type = "url"
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
    title: string;
    placeholder: string;
    initialValue?: string;
    isDarkMode: boolean;
    type?: "url" | "image";
}) {
    const [value, setValue] = useState(initialValue);
    const [isValid, setIsValid] = useState(true);
    const [showPreview, setShowPreview] = useState(true);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [linkPreview, setLinkPreview] = useState<{ title: string, domain: string } | null>(null);
    const [uploadMode, setUploadMode] = useState<'file'>('file');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        setValue(initialValue);
        setImageError(false);
        setImageLoaded(false);
        setLinkPreview(null);
        setSelectedFile(null);
        setFilePreview(null);
        setUploadMode('file');
    }, [initialValue]);

    // Handle file selection
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
            if (!validTypes.includes(file.type)) {
                setIsValid(false);
                return;
            }

            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                setIsValid(false);
                return;
            }

            setSelectedFile(file);
            setIsValid(true);

            const reader = new FileReader();
            reader.onload = (e) => {
                setFilePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileUpload = async (): Promise<string> => {
        if (!selectedFile) return '';
        setIsUploading(true);
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setIsUploading(false);
                resolve(e.target?.result as string);
            };
            reader.readAsDataURL(selectedFile);
        });
    };

    useEffect(() => {
        const validateAndPreview = async () => {
            if (type === "url") {
                try {
                    if (value && value.trim()) {
                        const url = new URL(value);
                        setIsValid(true);
                        const domain = url.hostname.replace('www.', '');
                        let title = domain;

                        if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
                            title = '📺 YouTube Video';
                        } else if (domain.includes('github.com')) {
                            title = '🐱 GitHub Repository';
                        } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
                            title = '🐦 Twitter/X Post';
                        } else {
                            title = `🌐 ${domain}`;
                        }

                        setLinkPreview({ title, domain });
                    } else {
                        setIsValid(true);
                        setLinkPreview(null);
                    }
                } catch {
                    setIsValid(false);
                    setLinkPreview(null);
                }
            } else if (type === "image") {
                if (!value || !value.trim()) {
                    setIsValid(true);
                    setImageError(false);
                    return;
                }

                const imageExtensions = /\.(jpeg|jpg|gif|png|webp|svg|bmp|ico)$/i;
                const isImageUrl = imageExtensions.test(value) ||
                    value.includes('imgur') ||
                    value.includes('unsplash') ||
                    value.includes('pixabay') ||
                    value.includes('pexels') ||
                    value.includes('cloudinary') ||
                    value.includes('amazonaws.com');

                setIsValid(isImageUrl);
                if (isImageUrl) {
                    setImageError(false);
                    setImageLoaded(false);
                }
            }
        };

        const timeoutId = setTimeout(validateAndPreview, 300);
        return () => clearTimeout(timeoutId);
    }, [value, type]);

    const handleConfirm = async () => {
        if (!isValid) return;

        if (type === "image" && selectedFile) {
            const fileUrl = await handleFileUpload();
            onConfirm(fileUrl);
        } else {
            onConfirm(value.trim());
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className={`rounded-2xl p-6 max-w-2xl w-full shadow-2xl transform transition-all duration-200 max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-gray-800 text-white border border-gray-700" : "bg-white text-gray-900 border border-gray-200"}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        {type === "image" ? (
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                <ImageIcon className="h-6 w-6 text-purple-600" />
                            </div>
                        ) : (
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <ExternalLink className="h-6 w-6 text-blue-600" />
                            </div>
                        )}
                        <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {title}
                        </h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>



                {/* Input Section */}
                <div className="space-y-6">
                    {type === "image" ? (
                        <div>
                            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                Chọn hình ảnh từ máy tính
                            </label>
                            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${selectedFile
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : isDarkMode
                                    ? "border-gray-600 hover:border-gray-500 bg-gray-700"
                                    : "border-gray-300 hover:border-gray-400 bg-gray-50"
                                }`}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer flex flex-col items-center space-y-3"
                                >
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${selectedFile ? 'bg-purple-500' : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                        <Upload className={`h-8 w-8 ${selectedFile ? 'text-white' : isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                            {selectedFile ? 'Thay đổi ảnh' : 'Nhấp để chọn ảnh'}
                                        </p>
                                        <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                                            hoặc kéo thả ảnh vào đây
                                        </p>
                                    </div>
                                </label>
                                {selectedFile && (
                                    <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                                        <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                                            📎 {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                )}
                            </div>
                            {!isValid && selectedFile && (
                                <p className="text-red-500 text-sm mt-2 flex items-center space-x-2">
                                    <X className="h-4 w-4" />
                                    <span>File không hợp lệ. Chỉ hỗ trợ ảnh dưới 10MB</span>
                                </p>
                            )}
                        </div>
                    ) : (
                        <div>
                            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                URL liên kết
                            </label>
                            <input
                                type="url"
                                placeholder={placeholder}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${!isValid
                                    ? 'border-red-500 focus:ring-red-500'
                                    : isDarkMode
                                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                    } shadow-sm`}
                                autoFocus
                            />
                            {!isValid && (
                                <p className="text-red-500 text-sm mt-2 flex items-center space-x-2">
                                    <X className="h-4 w-4" />
                                    <span>URL không hợp lệ</span>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Facebook-style Preview */}
                    {((type === "image" && filePreview) ||
                        (type === "url" && linkPreview)) && showPreview && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                        Xem trước:
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="rounded-full p-2"
                                    >
                                        <EyeOff className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Facebook-style media container */}
                                <div className={`border rounded-2xl overflow-hidden ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                                    {type === "image" ? (
                                        <div className="relative">
                                            <img
                                                src={filePreview!}
                                                alt="Preview"
                                                className="w-full h-auto max-h-96 object-cover"
                                            />
                                        </div>
                                    ) : linkPreview && (
                                        <div className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? "bg-gray-600" : "bg-gray-200"}`}>
                                                    <Globe className="h-6 w-6 text-purple-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                                        {linkPreview.title}
                                                    </p>
                                                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                        {linkPreview.domain}
                                                    </p>
                                                </div>
                                                <ExternalLink className="h-5 w-5 text-purple-600" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-8">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!isValid || isUploading}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl disabled:opacity-50 transition-all duration-200"
                    >
                        {isUploading ? (
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Đang xử lý...</span>
                            </div>
                        ) : (
                            value || selectedFile ? "Thêm" : "Xóa"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function TiptapEditor({ content, onChange, placeholder = "Bạn đang nghĩ gì?", isDarkMode = false }: TiptapEditorProps) {
    const [isMounted, setIsMounted] = useState(false)
    const [showImageModal, setShowImageModal] = useState(false)
    const [showLinkModal, setShowLinkModal] = useState(false)
    const [showIconModal, setShowIconModal] = useState(false)
    const [currentLinkUrl, setCurrentLinkUrl] = useState("")

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-2xl max-w-full h-auto shadow-lg my-4 border',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-purple-600 hover:text-purple-800 underline cursor-pointer transition-colors duration-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-1 py-0.5 rounded',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: `prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-6 ${isDarkMode
                    ? 'prose-invert text-white prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white prose-em:text-gray-200'
                    : 'text-gray-900 prose-headings:text-gray-900'
                    }`,
            },
        },
    })

    if (!isMounted || !editor) {
        return (
            <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className={`flex flex-wrap items-center gap-2 p-4 border-b ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex gap-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className={`h-10 w-10 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} animate-pulse`} />
                        ))}
                    </div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} p-6`}>
                    <div className={`h-48 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'} animate-pulse`}>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Đang tải editor...</span>
                    </div>
                </div>
            </div>
        )
    }

    const handleAddImage = (url: string) => {
        if (url) {
            editor?.chain().focus().setImage({ src: url }).run()
        }
    }

    const handleSetLink = (url: string) => {
        if (url === '') {
            editor?.chain().focus().extendMarkRange('link').unsetLink().run()
        } else if (url) {
            editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }
    }

    const handleSelectIcon = (icon: string) => {
        editor?.chain().focus().insertContent(icon).run()
    }

    const openLinkModal = () => {
        const previousUrl = editor?.getAttributes('link').href || ""
        setCurrentLinkUrl(previousUrl)
        setShowLinkModal(true)
    }

    return (
        <>
            <div className={`border rounded-2xl overflow-hidden shadow-lg ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                {/* Enhanced Toolbar */}
                <div className={`flex flex-wrap items-center gap-2 p-4 border-b ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                    {/* Text formatting group */}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`h-10 w-10 p-0 rounded-lg transition-all duration-200 ${editor.isActive('bold')
                                ? 'bg-purple-500 text-white shadow-md'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            title="Bold (Ctrl+B)"
                        >
                            <Bold className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`h-10 w-10 p-0 rounded-lg transition-all duration-200 ${editor.isActive('italic')
                                ? 'bg-purple-500 text-white shadow-md'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            title="Italic (Ctrl+I)"
                        >
                            <Italic className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            className={`h-10 w-10 p-0 rounded-lg transition-all duration-200 ${editor.isActive('strike')
                                ? 'bg-purple-500 text-white shadow-md'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            title="Strikethrough"
                        >
                            <Strikethrough className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className={`w-px h-8 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />

                    {/* Lists group */}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={`h-10 w-10 p-0 rounded-lg transition-all duration-200 ${editor.isActive('bulletList')
                                ? 'bg-purple-500 text-white shadow-md'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            title="Bullet List"
                        >
                            <List className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={`h-10 w-10 p-0 rounded-lg transition-all duration-200 ${editor.isActive('orderedList')
                                ? 'bg-purple-500 text-white shadow-md'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            title="Numbered List"
                        >
                            <ListOrdered className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            className={`h-10 w-10 p-0 rounded-lg transition-all duration-200 ${editor.isActive('blockquote')
                                ? 'bg-purple-500 text-white shadow-md'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            title="Quote"
                        >
                            <Quote className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className={`w-px h-8 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />

                    {/* Alignment group */}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                            className={`h-10 w-10 p-0 rounded-lg transition-all duration-200 ${editor.isActive({ textAlign: 'left' })
                                ? 'bg-purple-500 text-white shadow-md'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            title="Align Left"
                        >
                            <AlignLeft className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                            className={`h-10 w-10 p-0 rounded-lg transition-all duration-200 ${editor.isActive({ textAlign: 'center' })
                                ? 'bg-purple-500 text-white shadow-md'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            title="Align Center"
                        >
                            <AlignCenter className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                            className={`h-10 w-10 p-0 rounded-lg transition-all duration-200 ${editor.isActive({ textAlign: 'right' })
                                ? 'bg-purple-500 text-white shadow-md'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            title="Align Right"
                        >
                            <AlignRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className={`w-px h-8 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />

                    {/* Media group */}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowImageModal(true)}
                            className="h-10 w-10 p-0 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105"
                            title="Add Image"
                        >
                            <ImageIcon className="h-4 w-4 text-green-600" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={openLinkModal}
                            className={`h-10 w-10 p-0 rounded-lg transition-all duration-200 hover:scale-105 ${editor.isActive('link')
                                ? 'bg-purple-500 text-white shadow-md'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            title="Add Link"
                        >
                            <LinkIcon className="h-4 w-4 text-blue-600" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowIconModal(true)}
                            className="h-10 w-10 p-0 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105"
                            title="Add Icon"
                        >
                            <Smile className="h-4 w-4 text-yellow-600" />
                        </Button>
                    </div>

                    <div className={`w-px h-8 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />

                    {/* History group */}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={!editor.can().undo()}
                            className="h-10 w-10 p-0 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={!editor.can().redo()}
                            className="h-10 w-10 p-0 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Redo (Ctrl+Y)"
                        >
                            <Redo className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Editor Content with Facebook-style layout */}
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <EditorContent editor={editor} />
                </div>
            </div>

            {/* Image Modal */}
            <MediaUploadModal
                isOpen={showImageModal}
                onClose={() => setShowImageModal(false)}
                onConfirm={handleAddImage}
                title="Thêm hình ảnh"
                placeholder="https://example.com/image.jpg"
                isDarkMode={isDarkMode}
                type="image"
            />

            {/* Link Modal */}
            <MediaUploadModal
                isOpen={showLinkModal}
                onClose={() => setShowLinkModal(false)}
                onConfirm={handleSetLink}
                title="Thêm liên kết"
                placeholder="https://example.com"
                initialValue={currentLinkUrl}
                isDarkMode={isDarkMode}
                type="url"
            />

            {/* Icon Modal */}
            <IconPickerModal
                isOpen={showIconModal}
                onClose={() => setShowIconModal(false)}
                onSelectIcon={handleSelectIcon}
                isDarkMode={isDarkMode}
            />
        </>
    )
}
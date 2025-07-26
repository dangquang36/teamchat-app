// components/editor/TiptapEditor.tsx (Improved with Enhanced Previews)
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
    Globe
} from "lucide-react"

interface TiptapEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
    isDarkMode?: boolean
}

// Enhanced Modal with File Upload and URL Input
function ImageUploadModal({
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
    const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
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
        setUploadMode('url');
    }, [initialValue]);

    // Handle file selection
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
            if (!validTypes.includes(file.type)) {
                setIsValid(false);
                return;
            }

            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                setIsValid(false);
                return;
            }

            setSelectedFile(file);
            setIsValid(true);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setFilePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Convert file to base64 or upload to service
    const handleFileUpload = async (): Promise<string> => {
        if (!selectedFile) return '';

        setIsUploading(true);

        // For demo purposes, we'll convert to base64
        // In production, you should upload to a file service like Cloudinary, AWS S3, etc.
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
                // Validate URL
                try {
                    if (value && value.trim()) {
                        const url = new URL(value);
                        setIsValid(true);

                        // Generate link preview
                        const domain = url.hostname.replace('www.', '');
                        let title = domain;

                        // Simple title extraction for common domains
                        if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
                            title = '📺 YouTube Video';
                        } else if (domain.includes('github.com')) {
                            title = '🐱 GitHub Repository';
                        } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
                            title = '🐦 Twitter/X Post';
                        } else if (domain.includes('facebook.com')) {
                            title = '📘 Facebook Post';
                        } else if (domain.includes('instagram.com')) {
                            title = '📷 Instagram Post';
                        } else if (domain.includes('linkedin.com')) {
                            title = '💼 LinkedIn Post';
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
                // Validate image URL
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
                    value.includes('freepik') ||
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

        if (type === "image" && uploadMode === 'file' && selectedFile) {
            const fileUrl = await handleFileUpload();
            onConfirm(fileUrl);
        } else {
            onConfirm(value.trim());
        }
        onClose();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isValid && uploadMode === 'url') {
            handleConfirm();
        }
        if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
        setImageError(false);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoaded(false);
        setIsValid(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className={`rounded-2xl p-6 max-w-lg w-full shadow-2xl transform transition-all duration-200 max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-gray-800 text-white border border-gray-700" : "bg-white text-gray-900 border border-gray-200"}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        {type === "image" ? (
                            <ImageIcon className="h-5 w-5 text-purple-600" />
                        ) : (
                            <ExternalLink className="h-5 w-5 text-purple-600" />
                        )}
                        <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {title}
                        </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        {(type === "image" && value) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPreview(!showPreview)}
                                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                title={showPreview ? "Ẩn preview" : "Hiện preview"}
                            >
                                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Upload Mode Toggle for Images */}
                {type === "image" && (
                    <div className="mb-4">
                        <div className={`flex rounded-lg p-1 ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                            <button
                                type="button"
                                onClick={() => setUploadMode('file')}
                                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${uploadMode === 'file'
                                    ? 'bg-purple-600 text-white shadow-sm'
                                    : isDarkMode
                                        ? 'text-gray-300 hover:text-white hover:bg-gray-600'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                                    }`}
                            >
                                <Upload className="h-4 w-4" />
                                <span>Tải lên</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="space-y-4">
                    {uploadMode === 'url' ? (
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                {type === "image" ? "URL hình ảnh" : "URL liên kết"}
                            </label>
                            <input
                                type="url"
                                placeholder={placeholder}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${!isValid
                                    ? 'border-red-500 focus:ring-red-500'
                                    : isDarkMode
                                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                    }`}
                                autoFocus
                            />
                            {!isValid && (
                                <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                                    <X className="h-3 w-3" />
                                    <span>
                                        {type === "image" ? "URL hình ảnh không hợp lệ hoặc không thể tải" : "URL không hợp lệ"}
                                    </span>
                                </p>
                            )}
                        </div>
                    ) : (
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                Chọn hình ảnh từ máy tính
                            </label>
                            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${isDarkMode
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
                                    className="cursor-pointer flex flex-col items-center space-y-2"
                                >
                                    <Upload className={`h-12 w-12 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                                    <div>
                                        <p className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                            Nhấp để chọn ảnh
                                        </p>
                                        <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                                            hoặc kéo thả ảnh vào đây
                                        </p>
                                    </div>
                                </label>
                                {selectedFile && (
                                    <div className="mt-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <p className="text-sm text-purple-700 dark:text-purple-300">
                                            📎 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                        </p>
                                    </div>
                                )}
                            </div>
                            {!isValid && selectedFile && (
                                <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                                    <X className="h-3 w-3" />
                                    <span>File không hợp lệ. Chỉ hỗ trợ ảnh dưới 10MB</span>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Preview for image */}
                    {type === "image" && showPreview && (
                        <>
                            {/* URL Preview */}
                            {uploadMode === 'url' && value && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                            Xem trước hình ảnh:
                                        </p>
                                        {imageLoaded && (
                                            <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full">
                                                ✓ Đã tải thành công
                                            </span>
                                        )}
                                    </div>
                                    <div className={`border rounded-lg p-3 ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"} relative`}>
                                        {!imageError ? (
                                            <>
                                                <img
                                                    src={value}
                                                    alt="Preview"
                                                    className="max-w-full max-h-64 object-contain mx-auto rounded shadow-sm"
                                                    onLoad={handleImageLoad}
                                                    onError={handleImageError}
                                                />
                                                {!imageLoaded && !imageError && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="flex items-center space-x-2 text-gray-500">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                                                            <span className="text-sm">Đang tải...</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                                <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                                                <p className="text-sm">Không thể tải hình ảnh</p>
                                                <p className="text-xs mt-1">Vui lòng kiểm tra URL</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* File Preview */}
                            {uploadMode === 'file' && filePreview && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                            Xem trước hình ảnh:
                                        </p>
                                        <span className="text-xs text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
                                            📎 File đã chọn
                                        </span>
                                    </div>
                                    <div className={`border rounded-lg p-3 ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                                        <img
                                            src={filePreview}
                                            alt="File preview"
                                            className="max-w-full max-h-64 object-contain mx-auto rounded shadow-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Preview for link */}
                    {type === "url" && linkPreview && (
                        <div className="mt-4">
                            <p className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                Xem trước liên kết:
                            </p>
                            <div className={`border rounded-lg p-3 ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? "bg-gray-600" : "bg-gray-200"}`}>
                                            <Globe className="h-4 w-4 text-gray-500" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                            {linkPreview.title}
                                        </p>
                                        <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                                            {linkPreview.domain}
                                        </p>
                                        <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"} truncate`}>
                                            {value}
                                        </p>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-purple-600 flex-shrink-0 mt-1" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Helper text */}
                    <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {type === "image" ? (
                            <div className="space-y-1">
                                {uploadMode === 'url' ? (
                                    <>
                                        <p>💡 <strong>Định dạng hỗ trợ:</strong> .jpg, .png, .gif, .webp, .svg</p>
                                        <p>🌐 <strong>Nguồn tin cậy:</strong> Imgur, Unsplash, Pixabay, Pexels</p>
                                    </>
                                ) : (
                                    <>
                                        <p>📁 <strong>Định dạng hỗ trợ:</strong> JPG, PNG, GIF, WEBP, SVG</p>
                                        <p>📏 <strong>Kích thước tối đa:</strong> 10MB</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <p>🔗 <strong>Mẹo:</strong> Để trống để xóa liên kết hiện tại</p>
                                <p>✅ <strong>Hỗ trợ:</strong> HTTP, HTTPS và các liên kết mạng xã hội</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!isValid || isUploading}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {isUploading ? (
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Đang xử lý...</span>
                            </div>
                        ) : (
                            <>
                                {uploadMode === 'file' && selectedFile ? "Thêm ảnh" :
                                    value ? (type === "image" ? "Thêm ảnh" : "Thêm liên kết") : "Xóa"}
                            </>
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
                    class: 'rounded-lg max-w-full h-auto shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200',
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
                class: `prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 ${isDarkMode
                    ? 'prose-invert text-white prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white prose-em:text-gray-200'
                    : 'text-gray-900 prose-headings:text-gray-900'
                    }`,
            },
        },
    })

    // Loading state
    if (!isMounted || !editor) {
        return (
            <div className={`border rounded-xl overflow-hidden ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className={`flex flex-wrap items-center gap-1 p-3 border-b ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex gap-1">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className={`h-8 w-8 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} animate-pulse`} />
                        ))}
                    </div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} p-4`}>
                    <div className={`h-48 rounded flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'} animate-pulse`}>
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

    const openLinkModal = () => {
        const previousUrl = editor?.getAttributes('link').href || ""
        setCurrentLinkUrl(previousUrl)
        setShowLinkModal(true)
    }

    return (
        <>
            <div className={`border rounded-xl overflow-hidden shadow-sm ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                {/* Toolbar */}
                <div className={`flex flex-wrap items-center gap-1 p-3 border-b ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                    {/* Text formatting */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`h-8 w-8 p-0 rounded-md transition-all duration-200 ${editor.isActive('bold')
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
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
                        className={`h-8 w-8 p-0 rounded-md transition-all duration-200 ${editor.isActive('italic')
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
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
                        className={`h-8 w-8 p-0 rounded-md transition-all duration-200 ${editor.isActive('strike')
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        title="Strikethrough"
                    >
                        <Strikethrough className="h-4 w-4" />
                    </Button>

                    <div className={`w-px h-6 mx-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />

                    {/* Lists */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`h-8 w-8 p-0 rounded-md transition-all duration-200 ${editor.isActive('bulletList')
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
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
                        className={`h-8 w-8 p-0 rounded-md transition-all duration-200 ${editor.isActive('orderedList')
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
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
                        className={`h-8 w-8 p-0 rounded-md transition-all duration-200 ${editor.isActive('blockquote')
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        title="Quote"
                    >
                        <Quote className="h-4 w-4" />
                    </Button>

                    <div className={`w-px h-6 mx-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />

                    {/* Text alignment */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={`h-8 w-8 p-0 rounded-md transition-all duration-200 ${editor.isActive({ textAlign: 'left' })
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
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
                        className={`h-8 w-8 p-0 rounded-md transition-all duration-200 ${editor.isActive({ textAlign: 'center' })
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
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
                        className={`h-8 w-8 p-0 rounded-md transition-all duration-200 ${editor.isActive({ textAlign: 'right' })
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        title="Align Right"
                    >
                        <AlignRight className="h-4 w-4" />
                    </Button>

                    <div className={`w-px h-6 mx-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />

                    {/* Media */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowImageModal(true)}
                        className="h-8 w-8 p-0 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                        title="Add Image"
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={openLinkModal}
                        className={`h-8 w-8 p-0 rounded-md transition-all duration-200 ${editor.isActive('link')
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        title="Add Link"
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>

                    <div className={`w-px h-6 mx-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />

                    {/* Undo/Redo */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        className="h-8 w-8 p-0 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        className="h-8 w-8 p-0 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>

                {/* Editor Content */}
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                    <EditorContent editor={editor} />
                </div>
            </div>

            {/* Image Modal */}
            <ImageUploadModal
                isOpen={showImageModal}
                onClose={() => setShowImageModal(false)}
                onConfirm={handleAddImage}
                title="Thêm hình ảnh"
                placeholder="https://example.com/image.jpg"
                isDarkMode={isDarkMode}
                type="image"
            />

            {/* Link Modal */}
            <ImageUploadModal
                isOpen={showLinkModal}
                onClose={() => setShowLinkModal(false)}
                onConfirm={handleSetLink}
                title="Thêm liên kết"
                placeholder="https://example.com"
                initialValue={currentLinkUrl}
                isDarkMode={isDarkMode}
                type="url"
            />
        </>
    )
}
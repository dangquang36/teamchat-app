// components/editor/TiptapEditor.tsx (Improved with Custom Modals)
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
    Upload
} from "lucide-react"

interface TiptapEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
    isDarkMode?: boolean
}

// Custom Modal Component for URL Input
function URLInputModal({
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

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        if (type === "url") {
            // Validate URL
            try {
                if (value && value.trim()) {
                    new URL(value);
                    setIsValid(true);
                } else {
                    setIsValid(true); // Empty is valid for removal
                }
            } catch {
                setIsValid(false);
            }
        } else if (type === "image") {
            // Validate image URL
            const imageExtensions = /\.(jpeg|jpg|gif|png|webp|svg)$/i;
            const isImageUrl = imageExtensions.test(value) || value.includes('imgur') || value.includes('unsplash') || value.includes('pixabay');
            setIsValid(!value || isImageUrl);
        }
    }, [value, type]);

    const handleConfirm = () => {
        if (isValid) {
            onConfirm(value);
            onClose();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isValid) {
            handleConfirm();
        }
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all duration-200 ${isDarkMode ? "bg-gray-800 text-white border border-gray-700" : "bg-white text-gray-900 border border-gray-200"}`}>
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
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Input */}
                <div className="space-y-4">
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
                            <p className="text-red-500 text-sm mt-1">
                                {type === "image" ? "URL hình ảnh không hợp lệ" : "URL không hợp lệ"}
                            </p>
                        )}
                    </div>

                    {/* Preview for image */}
                    {type === "image" && value && isValid && (
                        <div className="mt-3">
                            <p className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                Xem trước:
                            </p>
                            <div className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-700">
                                <img
                                    src={value}
                                    alt="Preview"
                                    className="max-w-full h-32 object-contain mx-auto rounded"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        setIsValid(false);
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Helper text */}
                    <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {type === "image" ? (
                            <>
                                💡 Hỗ trợ: .jpg, .png, .gif, .webp hoặc từ Imgur, Unsplash
                            </>
                        ) : (
                            <>
                                💡 Để trống để xóa liên kết hiện tại
                            </>
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
                        disabled={!isValid}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {value ? (type === "image" ? "Thêm ảnh" : "Thêm link") : "Xóa"}
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
                    class: 'rounded-lg max-w-full h-auto shadow-md',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-purple-600 hover:text-purple-800 underline cursor-pointer',
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

    // Loading state nếu chưa mount hoặc editor chưa ready
    if (!isMounted || !editor) {
        return (
            <div className={`border rounded-xl overflow-hidden ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className={`flex flex-wrap items-center gap-1 p-3 border-b ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex gap-1">
                        {Array.from({ length: 8 }).map((_, i) => (
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
            <div className={`border rounded-xl overflow-hidden ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
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
        </>
    )
}
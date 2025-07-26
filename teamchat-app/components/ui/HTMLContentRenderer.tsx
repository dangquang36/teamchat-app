// components/ui/HTMLContentRenderer.tsx
import React from 'react'

interface HTMLContentRendererProps {
    content: string
    className?: string
    isDarkMode?: boolean
}

export function HTMLContentRenderer({ content, className = "", isDarkMode = false }: HTMLContentRendererProps) {
    return (
        <div
            className={`prose prose-sm sm:prose-base max-w-none ${isDarkMode
                    ? 'prose-invert prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white prose-em:text-gray-200 prose-blockquote:text-gray-300 prose-code:text-gray-200'
                    : 'prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-em:text-gray-700 prose-blockquote:text-gray-700 prose-code:text-gray-800'
                } ${className}`}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    )
}
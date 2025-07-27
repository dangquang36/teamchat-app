"use client";

import React from 'react';
import { PostsSection } from '@/components/modals/Pos/PostsSection';
import { ArrowLeft } from "lucide-react";

export default function PostsPage() {
    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="p-4 flex items-center border-b bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                <a
                    href="/dashboard/channels"
                    className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    aria-label="Quay lại"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </a>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Bài Đăng
                </h1>
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-hidden">
                <PostsSection isDarkMode={false} />
            </div>
        </div>
    );
}
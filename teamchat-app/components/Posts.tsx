import React from 'react';
import { PostsSection } from '@/components/PostsSection';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PostsPage() {
    return (
        <div className="flex flex-col h-screen">
            {/* Header - Link quay trở lại */}
            <div className="p-4 flex items-center border-b bg-white dark:bg-gray-800 dark:border-gray-700">
                <a
                    href="/dashboard/channels"
                    className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </a>
                <h1 className="text-xl font-bold">Bài Đăng</h1>
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto">
                <PostsSection isDarkMode={false} />
            </div>
        </div>
    );
}
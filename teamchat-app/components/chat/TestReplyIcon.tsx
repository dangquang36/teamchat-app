import React from 'react';
import { Reply, MoreHorizontal } from 'lucide-react';

export function TestReplyIcon() {
    return (
        <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Test Reply Icon</h3>

            {/* Test Message Actions */}
            <div className="relative group border border-gray-300 rounded-lg p-4 mb-4">
                <p>Test message content</p>

                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-x-full ml-2 z-10">
                    <button
                        className="p-1.5 rounded-full transition-colors duration-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 shadow-lg hover:scale-110"
                        title="Trả lời"
                    >
                        <Reply className="h-4 w-4" />
                    </button>

                    <button
                        className="p-1.5 rounded-full transition-colors duration-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 shadow-lg hover:scale-110"
                        title="Thêm tùy chọn"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Test với dark mode */}
            <div className="relative group border border-gray-600 rounded-lg p-4 mb-4 bg-gray-800">
                <p className="text-white">Test message content (dark mode)</p>

                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-x-full ml-2 z-10">
                    <button
                        className="p-1.5 rounded-full transition-colors duration-200 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white shadow-lg hover:scale-110"
                        title="Trả lời"
                    >
                        <Reply className="h-4 w-4" />
                    </button>

                    <button
                        className="p-1.5 rounded-full transition-colors duration-200 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white shadow-lg hover:scale-110"
                        title="Thêm tùy chọn"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <p className="text-sm text-gray-600">Hover vào các message để thấy icon reply</p>
        </div>
    );
} 
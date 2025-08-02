import React from 'react';
import { Reply } from 'lucide-react';

export function TestReplyButton() {
    const handleReply = () => {
        console.log('Reply button clicked!');
        alert('Reply button clicked!');
    };

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Test Reply Button</h3>

            {/* Test 1: Simple button */}
            <div className="border border-gray-300 rounded-lg p-4">
                <p className="mb-2">Test 1: Simple Reply Button</p>
                <button
                    onClick={handleReply}
                    className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    title="Trả lời"
                >
                    <Reply className="h-4 w-4" />
                </button>
            </div>

            {/* Test 2: Hover effect */}
            <div className="border border-gray-300 rounded-lg p-4 group">
                <p className="mb-2">Test 2: Hover to show reply button</p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={handleReply}
                        className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                        title="Trả lời"
                    >
                        <Reply className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Test 3: Dark mode */}
            <div className="border border-gray-600 rounded-lg p-4 bg-gray-800 text-white group">
                <p className="mb-2">Test 3: Dark mode reply button</p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={handleReply}
                        className="p-2 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                        title="Trả lời"
                    >
                        <Reply className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <p className="text-sm text-gray-600">Hover vào các box để thấy icon reply</p>
        </div>
    );
} 
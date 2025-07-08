import React from "react";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal } from "lucide-react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";

interface BookmarkSectionProps {
    isDarkMode?: boolean;
}

function BookmarkItem({
    title,
    size,
    url,
    type,
    icon,
    isDarkMode = false,
}: {
    title: string;
    size?: string;
    url?: string;
    type: string;
    icon: string;
    isDarkMode?: boolean;
}) {
    return (
        <div
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                }`}
        >
            <div className="flex items-center">
                <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg mr-3 ${isDarkMode ? "bg-gray-700" : "bg-blue-100"
                        }`}
                >
                    {icon}
                </div>
                <div>
                    <h4 className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {title}
                    </h4>
                    {size && <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{size}</p>}
                    {url && <p className="text-xs text-blue-500">{url}</p>}
                </div>
            </div>
            <Button variant="ghost" size="sm" className={isDarkMode ? "text-gray-500 hover:text-gray-300" : ""}>
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </Button>
        </div>
    );
}

export function BookmarkSection({ isDarkMode = false }: BookmarkSectionProps) {
    return (
        <div className="flex-1 flex">
            <div
                className={`w-80 border-r transition-colors ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}
            >
                <div className={`p-4 border-b transition-colors ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Đánh Dấu
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                }`}
                        />
                    </div>
                </div>

                <div className="overflow-y-auto p-4 space-y-3">
                    <BookmarkItem
                        title="design-phase-1-approved.pdf"
                        size="12.5 MB"
                        type="pdf"
                        icon="📄"
                        isDarkMode={isDarkMode}
                    />
                    <BookmarkItem
                        title="Bg Pattern"
                        url="https://bgpattern.com/"
                        type="link"
                        icon="🔗"
                        isDarkMode={isDarkMode}
                    />
                    <BookmarkItem
                        title="Image-001.jpg"
                        size="4.2 MB"
                        type="image"
                        icon="🖼️"
                        isDarkMode={isDarkMode}
                    />
                    <BookmarkItem
                        title="Images"
                        url="https://images123.com/"
                        type="link"
                        icon="🔗"
                        isDarkMode={isDarkMode}
                    />
                    <BookmarkItem
                        title="Bg Gradient"
                        url="https://bggradient.com/"
                        type="link"
                        icon="🔗"
                        isDarkMode={isDarkMode}
                    />
                    <BookmarkItem
                        title="Image-012.jpg"
                        size="3.1 MB"
                        type="image"
                        icon="🖼️"
                        isDarkMode={isDarkMode}
                    />
                    <BookmarkItem
                        title="analytics dashboard.zip"
                        size="6.7 MB"
                        type="zip"
                        icon="📦"
                        isDarkMode={isDarkMode}
                    />
                    <BookmarkItem
                        title="Image-031.jpg"
                        size="4.2 MB"
                        type="image"
                        icon="🖼️"
                        isDarkMode={isDarkMode}
                    />
                    <BookmarkItem
                        title="Changelog.txt"
                        size="6.7 MB"
                        type="txt"
                        icon="📝"
                        isDarkMode={isDarkMode}
                    />
                    <BookmarkItem
                        title="Widgets.zip"
                        size="6.7 MB"
                        type="zip"
                        icon="📦"
                        isDarkMode={isDarkMode}
                    />
                </div>
            </div>

            {/* Chat area for bookmarks */}
            <div className="flex-1 flex flex-col">
                <ChatHeader
                    user={{ name: "Bookmarks Chat", online: true, avatar: "/placeholder.svg" }}
                    onVideoCall={() => { }}
                    onAudioCall={() => { }}
                    onViewProfile={() => { }}
                    isDarkMode={isDarkMode}
                />
                <ChatMessages
                    messages={[]}
                    currentUser={{ id: "me", name: "Me", avatar: "/placeholder.svg" }}
                    isDarkMode={isDarkMode}
                />
                <ChatInput onSendMessage={() => { }} isDarkMode={isDarkMode} />
            </div>
        </div>
    );
}
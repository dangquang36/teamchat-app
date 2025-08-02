"use client";

import { useState } from "react";
import { GroupProvider } from "@/contexts/GroupContext";
import { MessagesSection } from "@/components/chat/messages/MessagesSection";
import { useTheme } from "@/contexts/ThemeContext";


export default function ChatPage() {
    const [showVideoCall, setShowVideoCall] = useState(false);
    const [showAudioCall, setShowAudioCall] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const { isDarkMode } = useTheme();

    return (
        <GroupProvider>
            <div className="flex h-full">
                <MessagesSection
                    onVideoCall={() => setShowVideoCall(true)}
                    onAudioCall={() => setShowAudioCall(true)}
                    isDarkMode={isDarkMode} // Truyền dark mode vào MessagesSection
                />
            </div>
        </GroupProvider>
    );
}
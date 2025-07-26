"use client";

import { useState, useEffect } from "react";
import { GroupProvider } from "@/contexts/GroupContext";
import { MessagesSection } from "@/components/chat/MessagesSection";


export default function ChatPage() {
    const [showVideoCall, setShowVideoCall] = useState(false);
    const [showAudioCall, setShowAudioCall] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Load dark mode preference
        const savedDarkMode = localStorage.getItem("darkMode");
        if (savedDarkMode) {
            setIsDarkMode(JSON.parse(savedDarkMode));
        }
    }, []);

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
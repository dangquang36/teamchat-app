"use client";

import { useState, useEffect } from "react";
import { GroupProvider } from "@/contexts/GroupContext";
import { MessagesSection } from "@/components/chat/MessagesSection";
import { VideoCallModal } from "@/components/modals/VideoCallModal";
import { AudioCallModal } from "@/components/modals/AudioCallModal";

export default function ChatPage() {
    const [showVideoCall, setShowVideoCall] = useState(false);
    const [showAudioCall, setShowAudioCall] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Load dark mode preference từ localStorage
        const loadDarkMode = () => {
            const savedDarkMode = localStorage.getItem("darkMode");
            if (savedDarkMode) {
                setIsDarkMode(JSON.parse(savedDarkMode));
            }
        };

        // Load initial dark mode
        loadDarkMode();

        // Listen for dark mode changes
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "darkMode") {
                setIsDarkMode(e.newValue ? JSON.parse(e.newValue) : false);
            }
        };

        // Listen for custom dark mode events
        const handleDarkModeChange = () => {
            loadDarkMode();
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("darkModeChange", handleDarkModeChange);

        // Periodic check for dark mode changes (fallback)
        const interval = setInterval(() => {
            loadDarkMode();
        }, 1000);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("darkModeChange", handleDarkModeChange);
            clearInterval(interval);
        };
    }, []);

    return (
        <GroupProvider>
            <div className="flex h-full">
                <MessagesSection
                    onVideoCall={() => setShowVideoCall(true)}
                    onAudioCall={() => setShowAudioCall(true)}
                    isDarkMode={isDarkMode}
                />

                {/* Modals */}
                {showVideoCall && <VideoCallModal onClose={() => setShowVideoCall(false)} />}
                {showAudioCall && <AudioCallModal onClose={() => setShowAudioCall(false)} />}
            </div>
        </GroupProvider>
    );
}
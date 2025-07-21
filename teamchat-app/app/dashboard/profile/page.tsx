"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileSection } from "@/components/sections/ProfileSection";

export default function ProfilePage() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const savedDarkMode = localStorage.getItem("darkMode");
        if (savedDarkMode) {
            setIsDarkMode(JSON.parse(savedDarkMode));
        }

        const token = localStorage.getItem("userToken");
        if (!token) {
            router.replace("/");
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("userToken");
        localStorage.removeItem("currentUser");
        router.replace("/");
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <ProfileSection
                    isDarkMode={isDarkMode}
                    onLogout={handleLogout}
                />
            </div>
        </div>
    );
}
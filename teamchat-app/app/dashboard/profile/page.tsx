"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileSection } from "@/components/sections/ProfileSection";
import { useTheme } from "@/contexts/ThemeContext";

export default function ProfilePage() {
    const { isDarkMode } = useTheme();
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("userToken");
        if (!token) {
            router.replace("/");
        }
    }, [router]);

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
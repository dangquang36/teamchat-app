"use client";

import { SettingsSection } from "@/components/sections/SettingsSection";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";

export default function SettingsPage() {
    const { isDarkMode } = useTheme();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("userToken");
        localStorage.removeItem("currentUser");
        router.push("/");
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <SettingsSection onLogout={handleLogout} isDarkMode={isDarkMode} />
            </div>
        </div>
    );
}
"use client";

import { SettingsSection } from "@/components/sections/SettingsSection";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const savedDarkMode = localStorage.getItem("darkMode");
        if (savedDarkMode) {
            setIsDarkMode(JSON.parse(savedDarkMode));
        }
    }, []);

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
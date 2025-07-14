"use client";

import { useState, useEffect } from "react";
import { ProfileSection } from "@/components/sections/ProfileSection";

export default function ProfilePage() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const savedDarkMode = localStorage.getItem("darkMode");
        if (savedDarkMode) {
            setIsDarkMode(JSON.parse(savedDarkMode));
        }
    }, []);

    return <ProfileSection isDarkMode={isDarkMode} onLogout={function (): void {
        throw new Error("Function not implemented.");
    }} />;
}
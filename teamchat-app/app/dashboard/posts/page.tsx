"use client";

import { useState, useEffect } from "react";
import { PostsSection } from "@/components/modals/PostsSection";

export default function PostsPage() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const savedDarkMode = localStorage.getItem("darkMode");
        if (savedDarkMode) {
            setIsDarkMode(JSON.parse(savedDarkMode));
        }
    }, []);

    return (
        <div className="h-screen overflow-y-auto direction-rtl">
            <div className="direction-ltr">
                <PostsSection isDarkMode={isDarkMode} />
            </div>
        </div>
    );
}
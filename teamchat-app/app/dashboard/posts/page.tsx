"use client";

import { useState, useEffect } from "react";
import { PostsSection } from "@/components/modals/Pos/PostsSection";
import { useTheme } from "@/contexts/ThemeContext";

export default function PostsPage() {
    const { isDarkMode } = useTheme();

    return (
        <div className="h-screen overflow-y-auto direction-rtl">
            <div className="direction-ltr">
                <PostsSection isDarkMode={isDarkMode} />
            </div>
        </div>
    );
}
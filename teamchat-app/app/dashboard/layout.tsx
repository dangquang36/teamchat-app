"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    MessageCircle,
    User,
    Settings,
    Shield,
    HelpCircle,
    Sun,
    Moon,
    Plus,
    Users,
    Newspaper,
    Hash // 1. Import biểu tượng Hash
} from "lucide-react";
import { SidebarIcon } from "@/components/common/SidebarIcon";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

function LayoutUI({ children }: { children: React.ReactNode }) {
    const [currentPath, setCurrentPath] = useState("");
    const router = useRouter();
    const { isDarkMode, toggleDarkMode } = useTheme();

    useEffect(() => {
        // Check authentication
        const userToken = localStorage.getItem("userToken");
        if (!userToken) {
            router.push("/login");
            return;
        }
        // Set current path
        setCurrentPath(window.location.pathname);
    }, [router]);


    const handleNavigation = (route: string) => {
        setCurrentPath(route);
        router.push(route);
    };

    const isActive = (path: string) => currentPath.startsWith(path);

    return (
        <div className={`flex h-screen overflow-hidden transition-colors ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
            {/* Left Sidebar */}
            <div
                className={`w-20 flex flex-col items-center py-6 space-y-6 transition-colors relative z-10 ${isDarkMode
                    ? "bg-gradient-to-b from-gray-800 to-gray-900"
                    : "bg-gradient-to-b from-indigo-500 to-purple-600"
                    }`}
            >
                {/* Logo */}
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg">
                    <div className="w-6 h-6 bg-white/40 rounded flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                </div>

                {/* Navigation Icons */}
                <nav className="flex flex-col space-y-4">
                    <SidebarIcon
                        icon={<User className="h-6 w-6" />}
                        active={isActive("/dashboard/profile")}
                        onClick={() => handleNavigation("/dashboard/profile")}
                        tooltip="Hồ Sơ"
                        badge=""
                    />
                    <SidebarIcon
                        icon={<MessageCircle className="h-6 w-6" />}
                        active={isActive("/dashboard/chat")}
                        onClick={() => handleNavigation("/dashboard/chat")}
                        tooltip="Tin Nhắn"
                    />
                    {/* 2. Thêm biểu tượng cho Kênh */}
                    <SidebarIcon
                        icon={<Users className="h-6 w-6" />}
                        active={isActive("/dashboard/channels")}
                        onClick={() => handleNavigation("/dashboard/channels")}
                        tooltip="Kênh"
                    />
                    <SidebarIcon
                        icon={<Newspaper className="h-6 w-6" />}
                        active={isActive("/dashboard/posts")}
                        onClick={() => handleNavigation("/dashboard/posts")}
                        tooltip="Bài Đăng"
                        badge=""
                    />
                    <SidebarIcon
                        icon={<HelpCircle className="h-6 w-6" />}
                        active={isActive("/dashboard/support")}
                        onClick={() => handleNavigation("/dashboard/support")}
                        tooltip="Hỗ Trợ"
                    />
                </nav>

                {/* Dark Mode Toggle */}
                <div className="mt-auto mb-4">
                    <button
                        onClick={toggleDarkMode}
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                        title={isDarkMode ? "Chế độ tối" : "Chế độ sáng"}
                    >
                        {isDarkMode ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
                    </button>
                </div>

                {/* User Avatar */}
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center relative">
                    <span className="text-white font-semibold text-sm">D</span>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider>
            <LayoutUI>{children}</LayoutUI>
        </ThemeProvider>
    );
}


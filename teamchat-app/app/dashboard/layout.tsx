"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, User, Sun, Moon, Users, Newspaper, Phone, Video } from "lucide-react";
import { SidebarIcon } from "@/components/common/SidebarIcon";
import { useTheme } from "@/contexts/ThemeContext";
import { useSocketContext } from "@/contexts/SocketContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Giao diện người dùng của Dashboard
function LayoutUI({ children }: { children: React.ReactNode }) {
    const [currentPath, setCurrentPath] = useState("");
    const router = useRouter();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const { isConnected, isInCall, callStatus } = useSocketContext();
    const currentUser = useCurrentUser();

    useEffect(() => {
        const userToken = localStorage.getItem("userToken");
        if (!userToken) {
            router.push("/login");
        } else if (typeof window !== 'undefined') {
            setCurrentPath(window.location.pathname);
        }
    }, [router]);

    const handleNavigation = (route: string) => {
        setCurrentPath(route);
        router.push(route);
    };

    const isActive = (path: string) => currentPath.startsWith(path);

    // Get connection status color
    const getConnectionColor = () => {
        if (isInCall) return "bg-blue-500"; // Blue when in call
        if (isConnected) return "bg-green-500"; // Green when connected
        return "bg-red-500"; // Red when disconnected
    };

    // Get call status badge
    const getCallStatusBadge = () => {
        if (isInCall) return "📞";
        if (callStatus === 'calling') return "📱";
        if (callStatus === 'ringing') return "🔔";
        return "";
    };



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

                {/* Connection Status Indicator */}
                <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${getConnectionColor()}`}></div>
                    {isInCall && (
                        <div className="text-white text-xs animate-pulse">
                            {callStatus}
                        </div>
                    )}
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
                        badge={getCallStatusBadge()}
                    />
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
                </nav>

                {/* Call Status Display */}
                {(isInCall || callStatus !== 'idle') && (
                    <div className="bg-white/10 rounded-lg p-2 text-center">
                        <div className="text-white text-xs">
                            {isInCall ? (
                                <>
                                    <Video className="h-4 w-4 mx-auto mb-1" />
                                    <span>In Call</span>
                                </>
                            ) : (
                                <>
                                    <Phone className="h-4 w-4 mx-auto mb-1" />
                                    <span className="capitalize">{callStatus}</span>
                                </>
                            )}
                        </div>
                    </div>
                )}

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

                {/* User Avatar with Connection Status */}
                <div className="relative">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                        {currentUser?.avatar ? (
                            <img
                                src={currentUser.avatar}
                                alt={currentUser.name || 'User'}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-white font-semibold text-sm">
                                {currentUser?.name?.charAt(0).toUpperCase() || 'D'}
                            </span>
                        )}
                    </div>

                    {/* Connection Status Dot */}
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getConnectionColor()}`}>
                        {isInCall && (
                            <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping"></div>
                        )}
                    </div>
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
    children
}: {
    children: React.ReactNode;
}) {
    return <LayoutUI>{children}</LayoutUI>;
}
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
    const [userAvatar, setUserAvatar] = useState<string | null>(null); // Thêm lại state để giữ ảnh
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

    // Lắng nghe thay đổi avatar từ localStorage hoặc từ sự kiện
    useEffect(() => {
        const loadUserData = () => {
            try {
                const userDataString = localStorage.getItem("currentUser");
                if (userDataString) {
                    const userData = JSON.parse(userDataString);
                    setUserAvatar(userData.avatar || null);
                }
            } catch (error) {
                console.error("Failed to parse user data from localStorage", error);
            }
        };

        // Load dữ liệu người dùng lần đầu
        loadUserData();

        // Lắng nghe sự kiện 'userDataUpdated' được phát từ ProfileSection
        window.addEventListener('userDataUpdated', loadUserData);

        // Dọn dẹp listener khi component bị hủy
        return () => {
            window.removeEventListener('userDataUpdated', loadUserData);
        };
    }, []);

    const handleNavigation = (route: string) => {
        setCurrentPath(route);
        router.push(route);
    };

    const isActive = (path: string) => currentPath.startsWith(path);

    const getConnectionColor = () => {
        if (isInCall) return "bg-blue-500";
        if (isConnected) return "bg-green-500";
        return "bg-red-500";
    };

    const getCallStatusBadge = () => {
        if (isInCall) return "📞";
        if (callStatus === 'calling') return "📱";
        if (callStatus === 'ringing') return "🔔";
        return "";
    };

    // ================= SỬA ĐỔI TẠI ĐÂY =================
    const renderAvatar = () => {
        // Ưu tiên hiển thị state userAvatar (là ảnh đã tải lên)
        if (userAvatar) {
            return (
                <img
                    src={userAvatar}
                    alt="Avatar"
                    className="w-full h-full object-cover rounded-full"
                />
            );
        }
        // Nếu không có ảnh, hiển thị chữ cái đầu
        const firstLetter = currentUser?.name?.charAt(0).toUpperCase() || 'U';
        return (
            <span className="text-white font-bold text-xl">
                {firstLetter}
            </span>
        );
    };
    // ================= KẾT THÚC SỬA ĐỔI =================

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
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                        {renderAvatar()}
                    </div>

                    {/* Connection Status Dot */}
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 ${isDarkMode ? 'border-gray-900' : 'border-indigo-500'} ${getConnectionColor()}`}>
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
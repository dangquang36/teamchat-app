import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { User, KeyRound, LogOut, Edit, Save, Camera, ArrowLeft, Laptop, Smartphone, Phone, MessageCircle, X, MoreHorizontal, Sun, Moon, CheckCircle } from "lucide-react";

interface ProfileSectionProps {
    onLogout: () => void;
    isDarkMode?: boolean;
    toggleDarkMode?: () => void;
}

interface MediaItem {
    id: string;
    type: "image" | "video" | "file";
    src: string;
    alt?: string;
    name?: string;
}

interface UserData {
    name: string;
    email: string;
    phone: string;
    dob: string;
    avatar?: string;
}

export function ProfileSection({ onLogout, isDarkMode = false, toggleDarkMode }: ProfileSectionProps) {
    const [view, setView] = useState<'profile' | 'settings' | 'security'>('profile');
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", dob: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [is2faEnabled, setIs2faEnabled] = useState(true);
    const [showToast, setShowToast] = useState<{ show: boolean, message: string }>({ show: false, message: "" }); // Updated to include message
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const mediaItems: MediaItem[] = [
        { id: "1", type: "image", src: "/placeholder.svg?height=80&width=80&text=1", alt: "Media 1" },
        { id: "2", type: "image", src: "/placeholder.svg?height=80&width=80&text=2", alt: "Media 2" },
        { id: "3", type: "video", src: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" },
        { id: "4", type: "file", src: "/placeholder.pdf", name: "Document.pdf" },
        { id: "5", type: "image", src: "/placeholder.svg?height=80&width=80&text=3", alt: "Media 3" },
        { id: "6", type: "video", src: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4" },
        { id: "7", type: "file", src: "/placeholder.docx", name: "Report.docx" },
        { id: "8", type: "image", src: "/placeholder.svg?height=80&width=80&text=4", alt: "Media 4" },
    ];

    useEffect(() => {
        try {
            const userDataString = localStorage.getItem("currentUser");
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                setCurrentUser(userData);
                setFormData({
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    dob: userData.dob || "2004-06-22",
                });
            } else {
                const fallbackUser = { name: "Admin User", email: "admin@example.com", phone: "0912345678", dob: "2004-06-22" };
                setCurrentUser(fallbackUser);
                setFormData(fallbackUser);
            }
        } catch (error) {
            console.error("Failed to parse user data from localStorage", error);
            const fallbackUser = { name: "Admin User", email: "admin@example.com", phone: "0912345678", dob: "2004-06-22" };
            setCurrentUser(fallbackUser);
            setFormData(fallbackUser);
        }
    }, []);

    useEffect(() => {
        if (showToast.show) {
            const timer = setTimeout(() => setShowToast({ show: false, message: "" }), 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!currentUser) return;
        const updatedUser: UserData = { ...currentUser, ...formData };
        setCurrentUser(updatedUser);
        setIsEditing(false);
        // localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        setShowToast({ show: true, message: "Cập nhật thông tin tài khoản thành công!" }); // Show toast instead of alert
    };

    const handleCancel = () => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || "",
                email: currentUser.email || "",
                phone: currentUser.phone || "",
                dob: currentUser.dob || "2004-06-22",
            });
        }
        setIsEditing(false);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && currentUser) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const updatedUser: UserData = { ...currentUser, avatar: reader.result as string };
                setCurrentUser(updatedUser);
                // localStorage.setItem("currentUser", JSON.stringify(updatedUser));
                setShowToast({ show: true, message: "Ảnh đại diện đã được thay đổi!" });
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePasswordUpdate = () => {
        setShowToast({ show: true, message: "Cập nhật mật khẩu thành công!" });
    };

    const renderMediaItem = (item: MediaItem) => {
        switch (item.type) {
            case "image":
                return (
                    <img
                        src={item.src}
                        alt={item.alt}
                        className="w-full h-full object-cover rounded-md transition-transform duration-200 hover:scale-105"
                    />
                );
            case "video":
                return (
                    <video
                        src={item.src}
                        className="w-full h-full object-cover rounded-md"
                        controls
                    />
                );
            case "file":
                return (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-center">
                        <span className="text-xl mb-1">📄</span>
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate w-full px-1">{item.name}</div>
                        <Button size="sm" variant="outline" className="mt-2 text-xs">
                            Tải xuống
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    const NavButton = ({ activeView, targetView, onClick, children }: {
        activeView: string;
        targetView: string;
        onClick: () => void;
        children: React.ReactNode;
    }) => (
        <Button
            variant={activeView === targetView ? "secondary" : "ghost"}
            onClick={onClick}
            className="w-full justify-start mb-2 px-4 py-2 rounded-lg text-left transition-colors duration-200
                       hover:bg-gray-100 dark:hover:bg-gray-700
                       data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900 dark:data-[state=active]:text-purple-300"
            data-state={activeView === targetView ? "active" : "inactive"}
        >
            {children}
        </Button>
    );

    if (!currentUser) {
        return (
            <div className={`flex items-center justify-center h-full ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                <div className="text-center p-8 rounded-lg shadow-lg bg-white dark:bg-gray-800">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p>Đang tải dữ liệu người dùng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
            <div className={`w-72 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r p-6 flex flex-col shadow-lg`}>
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">Thiết Lập</h2>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavButton
                        activeView={view}
                        targetView="profile"
                        onClick={() => setView('profile')}
                    >
                        <User className="w-5 h-5 mr-3" />
                        <span className="text-lg">Hồ Sơ</span>
                    </NavButton>

                    <NavButton
                        activeView={view}
                        targetView="settings"
                        onClick={() => setView('settings')}
                    >
                        <Edit className="w-5 h-5 mr-3" />
                        <span className="text-lg">Cài Đặt Tài Khoản</span>
                    </NavButton>

                    <NavButton
                        activeView={view}
                        targetView="security"
                        onClick={() => setView('security')}
                    >
                        <KeyRound className="w-5 h-5 mr-3" />
                        <span className="text-lg">Bảo Mật & Mật Khẩu</span>
                    </NavButton>
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
                    {toggleDarkMode && (
                        <Button
                            variant="ghost"
                            onClick={toggleDarkMode}
                            className="w-full justify-start mb-4"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
                            Chế độ {isDarkMode ? 'sáng' : 'tối'}
                        </Button>
                    )}
                    <Button
                        variant="destructive"
                        onClick={onLogout}
                        className="w-full text-lg py-3"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Đăng Xuất
                    </Button>
                </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                {view === 'profile' && (
                    <div className="max-w-5xl mx-auto animate-fade-in-up">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-4xl font-extrabold text-purple-700 dark:text-purple-300">Hồ Sơ Của Tôi</h1>
                            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-300">
                                <MoreHorizontal className="w-6 h-6" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-2xl p-8 mb-8 shadow-xl transition-all duration-300 hover:shadow-2xl`}>
                                    <div className="flex items-center mb-6">
                                        <div className="relative mr-6">
                                            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                                {currentUser.avatar ? (
                                                    <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    <div className="text-white text-4xl font-bold">
                                                        {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => avatarInputRef.current?.click()}
                                                className="absolute -bottom-1 right-0 w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:scale-110"
                                                title="Thay đổi ảnh đại diện"
                                            >
                                                <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                            </button>
                                            <input
                                                type="file"
                                                ref={avatarInputRef}
                                                onChange={handleAvatarChange}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold mb-1">
                                                {currentUser?.name || "Admin User"}
                                            </h2>
                                            <p className="text-purple-600 dark:text-purple-400 text-lg">
                                                Lập Trình Viên Frontend
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                            Hồ sơ chuyên nghiệp là phần giới thiệu trong CV của bạn, làm nổi bật
                                            những kỹ năng và trình độ phù hợp, thể hiện kinh nghiệm và mục tiêu nghề nghiệp.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                                            <User className="w-5 h-5 mr-4 text-purple-500 dark:text-purple-400" />
                                            <span className="text-lg">
                                                {currentUser?.name || "Chưa có tên"}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                                            <Phone className="w-5 h-5 mr-4 text-purple-500 dark:text-purple-400" />
                                            <span className="text-lg">
                                                {currentUser?.phone || "Chưa có số điện thoại"}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                                            <MessageCircle className="w-5 h-5 mr-4 text-purple-500 dark:text-purple-400" />
                                            <span className="text-lg">
                                                {currentUser?.email || "Chưa có email"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-2xl p-6 shadow-xl h-fit transition-all duration-300 hover:shadow-2xl`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                        PHƯƠNG TIỆN
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsMediaModalOpen(true)}
                                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
                                    >
                                        Xem tất cả
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    {mediaItems.slice(0, 3).map((item) => (
                                        <div key={item.id} className="aspect-video overflow-hidden rounded-lg shadow-sm">
                                            {renderMediaItem(item)}
                                        </div>
                                    ))}
                                    {mediaItems.length > 3 && (
                                        <button
                                            onClick={() => setIsMediaModalOpen(true)}
                                            className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center text-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                                        >
                                            +{mediaItems.length - 3}
                                            <span className="text-sm">Xem thêm</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'settings' && (
                    <div className="max-w-3xl mx-auto animate-fade-in-up">
                        <h1 className="text-4xl font-extrabold text-purple-700 dark:text-purple-300 mb-8">Cài Đặt Tài Khoản</h1>

                        <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-2xl p-8 mb-8 shadow-xl`}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="relative mr-5">
                                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                            {currentUser.avatar ? (
                                                <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                currentUser?.name?.charAt(0)?.toUpperCase() || "U"
                                            )}
                                        </div>
                                        <button
                                            onClick={() => avatarInputRef.current?.click()}
                                            className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:scale-110"
                                            title="Thay đổi ảnh đại diện"
                                        >
                                            <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                        </button>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-semibold">{currentUser.name}</h3>
                                        <p className="text-base text-gray-600 dark:text-gray-300">{currentUser.email}</p>
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    {!isEditing ? (
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            className="px-5 py-2 text-base"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Chỉnh Sửa
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                onClick={handleSave}
                                                className="px-5 py-2 text-base bg-green-500 hover:bg-green-600"
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                Lưu
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleCancel}
                                                className="px-5 py-2 text-base border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                Hủy
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-2xl p-8 shadow-xl`}>
                            <h3 className="text-2xl font-semibold mb-6">Thông Tin Cá Nhân</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Họ và Tên</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
                                                    ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-800'}
                                                    disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Ngày Sinh</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
                                                    ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-800'}
                                                    disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
                                                    ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-800'}
                                                    disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Số Điện Thoại</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
                                                    ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-800'}
                                                    disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'security' && (
                    <div className="max-w-3xl mx-auto animate-fade-in-up">
                        <div className="flex items-center mb-8">
                            <Button
                                variant="ghost"
                                onClick={() => setView('profile')}
                                className="mr-3 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-300"
                                size="icon"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </Button>
                            <h1 className="text-4xl font-extrabold text-purple-700 dark:text-purple-300">Bảo Mật và Mật Khẩu</h1>
                        </div>

                        <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-2xl p-8 mb-8 shadow-xl`}>
                            <h3 className="text-2xl font-semibold mb-6">Đổi Mật Khẩu</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Mật khẩu hiện tại</label>
                                    <input
                                        type="password"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
                                                    ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
                                                    ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Xác nhận mật khẩu mới</label>
                                    <input
                                        type="password"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
                                                    ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button
                                        onClick={handlePasswordUpdate}
                                        className="px-6 py-3 text-base"
                                    >
                                        Cập Nhật Mật Khẩu
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showToast.show && (
                    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
                        <div className={`${isDarkMode ? 'bg-green-900 border-green-700' : 'bg-green-100 border-green-300'} border rounded-lg p-4 shadow-lg max-w-sm flex items-start space-x-3`}>
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            <div>
                                <p className="font-semibold text-green-800 dark:text-green-200">{showToast.message}</p>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    {new Date().toLocaleString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowToast({ show: false, message: "" })}
                                className="text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {isMediaModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className={`${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} rounded-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative`}>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-purple-700 dark:text-purple-300">Tất Cả Phương Tiện</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMediaModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {mediaItems.map((item) => (
                                <div key={item.id} className="aspect-video overflow-hidden rounded-lg shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg">
                                    {renderMediaItem(item)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
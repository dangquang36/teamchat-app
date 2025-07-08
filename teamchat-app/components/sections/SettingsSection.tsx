import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Settings, ArrowRight, User, KeyRound, LogOut, Edit, Save, Camera, ArrowLeft, Laptop, Smartphone } from "lucide-react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";



interface SettingsSectionProps {
    onLogout: () => void;
    isDarkMode?: boolean;
}

export function SettingsSection({ onLogout, isDarkMode = false }: { onLogout: () => void; isDarkMode?: boolean }) {
    // === State Quản lý chung ===
    const [view, setView] = useState<'profile' | 'security'>('profile');
    const [currentUser, setCurrentUser] = useState<any>(null);

    // === State và Logic cho View Hồ sơ (Profile) ===
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", dob: "" });
    const [isEditing, setIsEditing] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const updatedUser = { ...currentUser, ...formData };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        setIsEditing(false);
        alert("Hồ sơ đã được cập nhật!");
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
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const updatedUser = { ...currentUser, avatar: reader.result };
                localStorage.setItem("currentUser", JSON.stringify(updatedUser));
                setCurrentUser(updatedUser);
                alert("Ảnh đại diện đã được thay đổi!");
            };
            reader.readAsDataURL(file);
        }
    };

    // === State cho View Bảo mật (Security) ===
    const [is2faEnabled, setIs2faEnabled] = useState(true);

    // === useEffects để tải và cập nhật dữ liệu ===
    useEffect(() => {
        try {
            const userDataString = localStorage.getItem("currentUser");
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                setCurrentUser(userData);
                // Đồng bộ form data khi user được tải
                setFormData({
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    dob: userData.dob || "2004-06-22",
                });
            } else {
                const fallbackUser = { name: "User", email: "user@example.com", phone: "", dob: "" };
                setCurrentUser(fallbackUser);
            }
        } catch (error) {
            console.error("Failed to parse user data from localStorage", error);
            setCurrentUser({ name: "User", email: "user@example.com", phone: "", dob: "" });
        }
    }, []);


    // Component phụ cho nút điều hướng (để cho gọn)
    const NavButton = ({ activeView, targetView, onClick, children }: any) => (
        <Button
            variant="ghost"
            onClick={onClick}
            className={`w-full justify-start text-base p-6 transition-colors ${activeView === targetView
                ? isDarkMode ? 'bg-purple-800/50 text-white' : 'bg-purple-100 text-purple-700'
                : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
        >
            {children}
        </Button>
    );

    // Hiển thị loading nếu chưa có dữ liệu user
    if (!currentUser) {
        return (
            <div className={`flex-1 flex h-full items-center justify-center ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
                Đang tải dữ liệu người dùng...
            </div>
        );
    }

    return (
        <div className={`flex h-full ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
            {/* Cột trái: Navigation Sidebar */}
            <div className={`w-80 border-r flex flex-col transition-colors ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className={`p-4 border-b transition-colors ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <h2 className={`text-xl font-semibold px-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Cài Đặt</h2>
                </div>

                <div className="flex-grow p-4 space-y-2">
                    <NavButton activeView={view} targetView="profile" onClick={() => setView('profile')}>
                        <User className="mr-3 h-5 w-5" />
                        Tài Khoản
                    </NavButton>
                    <NavButton activeView={view} targetView="security" onClick={() => setView('security')}>
                        <KeyRound className="mr-3 h-5 w-5" />
                        Bảo Mật & Mật Khẩu
                    </NavButton>
                </div>

                <div className={`p-4 mt-auto border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <Button
                        variant="destructive"
                        className="w-full justify-start text-base p-6"
                        onClick={onLogout}
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Đăng Xuất
                    </Button>
                </div>
            </div>

            {/* Cột phải: Content Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-6 sm:p-8">

                    {/* --- VIEW HỒ SƠ (PROFILE) --- */}
                    {view === 'profile' && (
                        <>
                            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Cài Đặt Tài Khoản</h2>

                            {/* Profile Card */}
                            <div className={`p-6 rounded-lg shadow-md mb-8 ${isDarkMode ? "bg-gray-700" : "bg-white"}`}>
                                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                                    <div className="relative">
                                        <img
                                            src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=random`}
                                            alt="Avatar"
                                            className="w-24 h-24 rounded-full object-cover border-4 border-purple-500"
                                        />
                                        <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
                                        <Button size="sm" className="absolute bottom-0 right-0 w-8 h-8 rounded-full p-0 bg-gray-600 hover:bg-gray-500" onClick={() => avatarInputRef.current?.click()}>
                                            <Camera className="w-4 h-4 text-white" />
                                        </Button>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{currentUser.name}</h3>
                                        <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>{currentUser.email}</p>
                                    </div>
                                    <div className="sm:ml-auto flex space-x-2 pt-4 sm:pt-0">
                                        {!isEditing ? (
                                            <Button onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2" />Chỉnh Sửa</Button>
                                        ) : (
                                            <>
                                                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700"><Save className="w-4 h-4 mr-2" />Lưu</Button>
                                                <Button variant="outline" onClick={handleCancel}>Hủy</Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information Form */}
                            <div className={`p-6 rounded-lg shadow-md mb-8 ${isDarkMode ? "bg-gray-700" : "bg-white"}`}>
                                <h4 className={`text-lg font-semibold mb-4 border-b pb-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>Thông Tin Cá Nhân</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Các trường input */}
                                    <div className="space-y-2">
                                        <label className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Họ và Tên</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} readOnly={!isEditing} className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${isDarkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-gray-50 border-gray-300 text-gray-900"} ${!isEditing && 'cursor-not-allowed'}`} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Ngày Sinh</label>
                                        <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} readOnly={!isEditing} className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${isDarkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-gray-50 border-gray-300 text-gray-900"} ${!isEditing && 'cursor-not-allowed'}`} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} readOnly={!isEditing} className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${isDarkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-gray-50 border-gray-300 text-gray-900"} ${!isEditing && 'cursor-not-allowed'}`} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Số Điện Thoại</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} readOnly={!isEditing} className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${isDarkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-gray-50 border-gray-300 text-gray-900"} ${!isEditing && 'cursor-not-allowed'}`} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* --- VIEW BẢO MẬT (SECURITY) --- */}
                    {view === 'security' && (
                        <>
                            <div className="flex items-center mb-6">
                                <Button variant="ghost" size="sm" onClick={() => setView('profile')} className="mr-2">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Bảo Mật và Mật Khẩu</h2>
                            </div>

                            {/* Change Password */}
                            <div className={`p-6 rounded-lg shadow-md mb-8 ${isDarkMode ? "bg-gray-700" : "bg-white"}`}>
                                <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>Đổi Mật Khẩu</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Mật khẩu hiện tại</label>
                                        <input type="password" placeholder="••••••••" className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${isDarkMode ? "bg-gray-600 border-gray-500" : "bg-gray-50 border-gray-300"}`} />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Mật khẩu mới</label>
                                        <input type="password" placeholder="••••••••" className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${isDarkMode ? "bg-gray-600 border-gray-500" : "bg-gray-50 border-gray-300"}`} />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Xác nhận mật khẩu mới</label>
                                        <input type="password" placeholder="••••••••" className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${isDarkMode ? "bg-gray-600 border-gray-500" : "bg-gray-50 border-gray-300"}`} />
                                    </div>
                                    <div className="text-right">
                                        <Button onClick={() => alert("Mật khẩu đã được cập nhật!")}>Cập Nhật Mật Khẩu</Button>
                                    </div>
                                </div>
                            </div>

                            {/* 2FA */}
                            <div className={`p-6 rounded-lg shadow-md mb-8 ${isDarkMode ? "bg-gray-700" : "bg-white"}`}>
                                <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>Xác thực hai yếu tố (2FA)</h3>
                                <div className="flex items-center justify-between">
                                    <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Kích hoạt 2FA để tăng cường bảo mật.</p>
                                    <button onClick={() => setIs2faEnabled(!is2faEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${is2faEnabled ? 'bg-purple-600' : 'bg-gray-400'}`}>
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${is2faEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Active Sessions */}
                            <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? "bg-gray-700" : "bg-white"}`}>
                                <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>Phiên Đăng Nhập</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Laptop className="w-6 h-6 mr-3 text-green-500" />
                                            <div>
                                                <p className="font-medium">Windows 11, Chrome - Hà Nội, Việt Nam</p>
                                                <p className={`text-sm ${isDarkMode ? "text-green-400" : "text-green-600"}`}>Phiên hiện tại</p>
                                            </div>
                                        </div>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Smartphone className={`w-6 h-6 mr-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                                            <div>
                                                <p className="font-medium">iPhone 14 Pro - TP. Hồ Chí Minh, Việt Nam</p>
                                                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>2 ngày trước</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Đăng xuất</Button>
                                    </li>
                                </ul>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}
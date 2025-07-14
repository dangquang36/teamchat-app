import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { User, KeyRound, LogOut, Edit, Save, Camera, ArrowLeft, Laptop, Smartphone } from "lucide-react";

// Component SettingsSection
// Quản lý cài đặt người dùng, bao gồm hồ sơ và bảo mật
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
}
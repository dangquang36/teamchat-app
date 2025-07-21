import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { User, KeyRound, LogOut, Edit, Save, Camera, ArrowLeft, MoreHorizontal, Sun, Moon, CheckCircle, X, Phone, MessageCircle, Smartphone, Globe, Shield, AlertCircle, Eye, EyeOff } from "lucide-react";

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

interface Device {
    id: string;
    deviceName: string;
    lastLogin: string;
    ipAddress: string;
}

interface ValidationErrors {
    name?: string;
    email?: string;
    phone?: string;
    dob?: string;
}

interface translations {
    [key: string]: {
        profile: string;
        settings: string;
        security: string;
        logout: string;
        myProfile: string;
        accountSettings: string;
        securityPassword: string;
        media: string;
        viewAll: string;
        personalInfo: string;
        name: string;
        dob: string;
        email: string;
        phone: string;
        edit: string;
        save: string;
        cancel: string;
        changePassword: string;
        currentPassword: string;
        newPassword: string;
        confirmNewPassword: string;
        updatePassword: string;
        profileUpdated: string;
        avatarUpdated: string;
        passwordUpdated: string;
        allMedia: string;
        download: string;
        more: string;
        deviceManagement: string;
        deviceName: string;
        lastLogin: string;
        ipAddress: string;
        logoutDevice: string;
        language: string;
        selectLanguage: string;
        twoFactorAuth: string;
        enable2FA: string;
        disable2FA: string;
        setup2FA: string;
        scanQRCode: string;
        twoFAEnabled: string;
        twoFADisabled: string;
        nameRequired: string;
        nameInvalid: string;
        emailRequired: string;
        emailInvalid: string;
        phoneRequired: string;
        phoneInvalid: string;
        validationFailed: string;
        currentPasswordRequired: string;
        newPasswordRequired: string;
        confirmPasswordRequired: string;
        passwordTooShort: string;
        passwordMismatch: string;
        passwordWeak: string;
    };
}

const translations: translations = {
    vi: {
        profile: "Hồ Sơ",
        settings: "Cài Đặt Tài Khoản",
        security: "Bảo Mật & Mật Khẩu",
        logout: "Đăng Xuất",
        myProfile: "Hồ Sơ Của Tôi",
        accountSettings: "Cài Đặt Tài Khoản",
        securityPassword: "Bảo Mật và Mật Khẩu",
        media: "Phương Tiện",
        viewAll: "Xem tất cả",
        personalInfo: "Thông Tin Cá Nhân",
        name: "Họ và Tên",
        dob: "Ngày Sinh",
        email: "Email",
        phone: "Số Điện Thoại",
        edit: "Chỉnh Sửa",
        save: "Lưu",
        cancel: "Hủy",
        changePassword: "Đổi Mật Khẩu",
        currentPassword: "Mật khẩu hiện tại",
        newPassword: "Mật khẩu mới",
        confirmNewPassword: "Xác nhận mật khẩu mới",
        updatePassword: "Cập Nhật Mật Khẩu",
        profileUpdated: "Cập nhật thông tin tài khoản thành công!",
        avatarUpdated: "Ảnh đại diện đã được thay đổi!",
        passwordUpdated: "Cập nhật mật khẩu thành công!",
        allMedia: "Tất Cả Phương Tiện",
        download: "Tải xuống",
        more: "Xem thêm",
        deviceManagement: "Quản Lý Thiết Bị",
        deviceName: "Tên Thiết Bị",
        lastLogin: "Lần Đăng Nhập Cuối",
        ipAddress: "Địa Chỉ IP",
        logoutDevice: "Đăng Xuất Thiết Bị",
        language: "Ngôn Ngữ",
        selectLanguage: "Chọn Ngôn Ngữ",
        twoFactorAuth: "Xác Thực Hai Yếu Tố",
        enable2FA: "Bật Xác Thực Hai Yếu Tố",
        disable2FA: "Tắt Xác Thực Hai Yếu Tố",
        setup2FA: "Thiết Lập Xác Thực Hai Yếu Tố",
        scanQRCode: "Quét mã QR bằng ứng dụng xác thực của bạn",
        twoFAEnabled: "Xác thực hai yếu tố đã được bật!",
        twoFADisabled: "Xác thực hai yếu tố đã được tắt!",
        nameRequired: "Họ và tên là bắt buộc",
        nameInvalid: "Họ và tên không được chứa số hoặc ký tự đặc biệt",
        emailRequired: "Email là bắt buộc",
        emailInvalid: "Định dạng email không hợp lệ",
        phoneRequired: "Số điện thoại là bắt buộc",
        phoneInvalid: "Số điện thoại không hợp lệ (phải có 10-11 chữ số)",
        validationFailed: "Vui lòng kiểm tra lại thông tin đã nhập!",
        currentPasswordRequired: "Vui lòng nhập mật khẩu hiện tại",
        newPasswordRequired: "Vui lòng nhập mật khẩu mới",
        confirmPasswordRequired: "Vui lòng xác nhận mật khẩu mới",
        passwordTooShort: "Mật khẩu phải có ít nhất 8 ký tự",
        passwordMismatch: "Mật khẩu xác nhận không khớp",
        passwordWeak: "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
    },
    en: {
        profile: "Profile",
        settings: "Account Settings",
        security: "Security & Password",
        logout: "Log Out",
        myProfile: "My Profile",
        accountSettings: "Account Settings",
        securityPassword: "Security and Password",
        media: "Media",
        viewAll: "View All",
        personalInfo: "Personal Information",
        name: "Full Name",
        dob: "Date of Birth",
        email: "Email",
        phone: "Phone Number",
        edit: "Edit",
        save: "Save",
        cancel: "Cancel",
        changePassword: "Change Password",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmNewPassword: "Confirm New Password",
        updatePassword: "Update Password",
        profileUpdated: "Profile updated successfully!",
        avatarUpdated: "Avatar updated successfully!",
        passwordUpdated: "Password updated successfully!",
        allMedia: "All Media",
        download: "Download",
        more: "View More",
        deviceManagement: "Device Management",
        deviceName: "Device Name",
        lastLogin: "Last Login",
        ipAddress: "IP Address",
        logoutDevice: "Log Out Device",
        language: "Language",
        selectLanguage: "Select Language",
        twoFactorAuth: "Two-Factor Authentication",
        enable2FA: "Enable Two-Factor Authentication",
        disable2FA: "Disable Two-Factor Authentication",
        setup2FA: "Set Up Two-Factor Authentication",
        scanQRCode: "Scan the QR code with your authenticator app",
        twoFAEnabled: "Two-factor authentication enabled!",
        twoFADisabled: "Two-factor authentication disabled!",
        nameRequired: "Full name is required",
        nameInvalid: "Full name cannot contain numbers or special characters",
        emailRequired: "Email is required",
        emailInvalid: "Invalid email format",
        phoneRequired: "Phone number is required",
        phoneInvalid: "Invalid phone number (must be 10-11 digits)",
        validationFailed: "Please check the entered information!",
        currentPasswordRequired: "Please enter current password",
        newPasswordRequired: "Please enter new password",
        confirmPasswordRequired: "Please confirm new password",
        passwordTooShort: "Password must be at least 8 characters long",
        passwordMismatch: "Password confirmation does not match",
        passwordWeak: "Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character",
    },
};

export function ProfileSection({ onLogout, isDarkMode = false, toggleDarkMode }: ProfileSectionProps) {
    const [view, setView] = useState<'profile' | 'settings' | 'security'>('profile');
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", dob: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [is2faEnabled, setIs2faEnabled] = useState(false);
    const [showToast, setShowToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: "", type: 'success' });
    const [language, setLanguage] = useState<'vi' | 'en'>('vi');
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    });
    const [passwordErrors, setPasswordErrors] = useState<{
        currentPassword?: string | null;
        newPassword?: string | null;
        confirmNewPassword?: string | null;
    }>({});
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [devices, setDevices] = useState<Device[]>([
        { id: "1", deviceName: "MacBook Pro", lastLogin: "2025-07-11 10:30", ipAddress: "192.168.1.1" },
        { id: "2", deviceName: "Windows Desktop", lastLogin: "2025-07-10 15:45", ipAddress: "192.168.1.2" },
    ]);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const t = translations[language];

    // Validation functions
    const validateName = (name: string): string | null => {
        if (!name.trim()) return t.nameRequired;
        const nameRegex = /^[a-zA-ZÀ-ỹ\s\-']+$/;
        if (!nameRegex.test(name)) return t.nameInvalid;
        return null;
    };

    const validateEmail = (email: string): string | null => {
        if (!email.trim()) return t.emailRequired;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return t.emailInvalid;
        return null;
    };

    const validatePhone = (phone: string): string | null => {
        if (!phone.trim()) return t.phoneRequired;
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10 || phoneDigits.length > 11) return t.phoneInvalid;
        return null;
    };

    const validateCurrentPassword = (password: string): string | null => {
        if (!password.trim()) return t.currentPasswordRequired;
        return null;
    };

    const validateNewPassword = (password: string): string | null => {
        if (!password.trim()) return t.newPasswordRequired;
        if (password.length < 8) return t.passwordTooShort;
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!strongPasswordRegex.test(password)) return t.passwordWeak;
        return null;
    };

    const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
        if (!confirmPassword.trim()) return t.confirmPasswordRequired;
        if (password !== confirmPassword) return t.passwordMismatch;
        return null;
    };

    const validatePasswordForm = (): boolean => {
        const errors: { currentPassword?: string | null; newPassword?: string | null; confirmNewPassword?: string | null } = {};
        const currentPasswordError = validateCurrentPassword(passwordData.currentPassword);
        const newPasswordError = validateNewPassword(passwordData.newPassword);
        const confirmPasswordError = validateConfirmPassword(passwordData.newPassword, passwordData.confirmNewPassword);

        if (currentPasswordError) errors.currentPassword = currentPasswordError;
        if (newPasswordError) errors.newPassword = newPasswordError;
        if (confirmPasswordError) errors.confirmNewPassword = confirmPasswordError;

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};
        const nameError = validateName(formData.name);
        const emailError = validateEmail(formData.email);
        const phoneError = validatePhone(formData.phone);

        if (nameError) errors.name = nameError;
        if (emailError) errors.email = emailError;
        if (phoneError) errors.phone = phoneError;

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

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
            const timer = setTimeout(() => setShowToast({ show: false, message: "", type: 'success' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        let error: string | null = null;
        if (name === 'name') error = validateName(value);
        else if (name === 'email') error = validateEmail(value);
        else if (name === 'phone') error = validatePhone(value);
        setValidationErrors(prev => ({ ...prev, [name]: error }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        let error: string | null = null;
        if (name === 'currentPassword') error = validateCurrentPassword(value);
        else if (name === 'newPassword') {
            error = validateNewPassword(value);
            if (passwordData.confirmNewPassword) {
                const confirmError = validateConfirmPassword(value, passwordData.confirmNewPassword);
                setPasswordErrors(prev => ({ ...prev, confirmNewPassword: confirmError }));
            }
        } else if (name === 'confirmNewPassword') error = validateConfirmPassword(passwordData.newPassword, value);
        setPasswordErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSave = () => {
        if (!currentUser) return;
        if (!validateForm()) {
            setShowToast({ show: true, message: t.validationFailed, type: 'error' });
            return;
        }
        const updatedUser: UserData = { ...currentUser, ...formData };
        setCurrentUser(updatedUser);
        setIsEditing(false);
        setShowToast({ show: true, message: t.profileUpdated, type: 'success' });
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
        setValidationErrors({});
        setIsEditing(false);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && currentUser) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const updatedUser: UserData = { ...currentUser, avatar: reader.result as string };
                setCurrentUser(updatedUser);
                setShowToast({ show: true, message: t.avatarUpdated, type: 'success' });
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePasswordUpdate = () => {
        if (!validatePasswordForm()) {
            setShowToast({ show: true, message: t.validationFailed, type: 'error' });
            return;
        }
        setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
        setPasswordErrors({});
        setShowToast({ show: true, message: t.passwordUpdated, type: 'success' });
    };

    const handleDeviceLogout = (deviceId: string) => {
        setDevices(devices.filter(device => device.id !== deviceId));
        setShowToast({ show: true, message: t.logoutDevice, type: 'success' });
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as 'vi' | 'en');
    };

    const handle2FAChange = () => {
        setIs2faEnabled(!is2faEnabled);
        setShowToast({ show: true, message: is2faEnabled ? t.twoFADisabled : t.twoFAEnabled, type: 'success' });
    };

    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(!showNewPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const renderMediaItem = (item: MediaItem) => {
        switch (item.type) {
            case "image":
                return (
                    <img
                        src={item.src}
                        alt={item.alt}
                        className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
                    />
                );
            case "video":
                return (
                    <video
                        src={item.src}
                        className="w-full h-full object-cover rounded-lg shadow-md"
                        controls
                    />
                );
            case "file":
                return (
                    <div className={`w-full h-full flex flex-col items-center justify-center rounded-lg shadow-md p-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-100"} transition-colors duration-200`}>
                        <span className="text-2xl mb-2">📄</span>
                        <div className={`text-sm font-medium truncate w-full text-center ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{item.name}</div>
                        <Button size="sm" variant="outline" className={`mt-2 ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-600" : "border-gray-300 text-gray-600 hover:bg-gray-200"}`}>
                            {t.download}
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
            variant={activeView === targetView ? "default" : "ghost"}
            onClick={onClick}
            className={`w-full justify-start py-3 px-4 rounded-full text-lg font-medium transition-all duration-300 ${activeView === targetView
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                : isDarkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
        >
            {children}
        </Button>
    );

    const ErrorMessage = ({ error }: { error?: string | null }) => {
        if (!error) return null;
        return (
            <div className="flex items-center mt-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
            </div>
        );
    };

    if (!currentUser) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-700"}`}>
                <div className={`p-8 rounded-2xl shadow-xl ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 mx-auto mb-4"></div>
                    <p>{t.selectLanguage === 'vi' ? 'Đang tải dữ liệu người dùng...' : 'Loading user data...'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex ${isDarkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-800"} transition-colors duration-300`}>
            {/* Sidebar */}
            <div className={`w-80 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-r p-6 flex flex-col shadow-lg`}>
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">TeamChat</h2>
                </div>

                <nav className="flex-1 space-y-3">
                    <NavButton activeView={view} targetView="profile" onClick={() => setView('profile')}>
                        <User className="w-5 h-5 mr-3" />
                        {t.profile}
                    </NavButton>
                    <NavButton activeView={view} targetView="settings" onClick={() => setView('settings')}>
                        <Edit className="w-5 h-5 mr-3" />
                        {t.settings}
                    </NavButton>
                    <NavButton activeView={view} targetView="security" onClick={() => setView('security')}>
                        <KeyRound className="w-5 h-5 mr-3" />
                        {t.security}
                    </NavButton>
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
                    {toggleDarkMode && (
                        <Button
                            variant="ghost"
                            onClick={toggleDarkMode}
                            className={`w-full justify-start py-3 px-4 rounded-full text-lg font-medium ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"}`}
                        >
                            {isDarkMode ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
                            {t.language === 'vi' ? `Chế độ ${isDarkMode ? 'sáng' : 'tối'}` : `${isDarkMode ? 'Light' : 'Dark'} Mode`}
                        </Button>
                    )}
                    <Button
                        variant="destructive"
                        onClick={onLogout}
                        className="w-full py-3 rounded-full text-lg font-medium mt-3"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        {t.logout}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                {view === 'profile' && (
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">{t.myProfile}</h1>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className={`rounded-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border`}>
                                    <div className="flex items-center mb-6">
                                        <div className="relative mr-6">
                                            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                                                {currentUser.avatar ? (
                                                    <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    <div className="text-white text-4xl font-bold">{currentUser.name.charAt(0).toUpperCase()}</div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => avatarInputRef.current?.click()}
                                                className="absolute -bottom-1 right-0 w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-600 transition-transform duration-200 hover:scale-110"
                                                title={t.language === 'vi' ? "Thay đổi ảnh đại diện" : "Change avatar"}
                                            >
                                                <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                            </button>
                                            <input
                                                type="file"
                                                ref={avatarInputRef}
                                                onChange={handleAvatarChange}
                                                accept="image/*"
                                                className="hidden"
                                                aria-label="Upload avatar"
                                            />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold">{currentUser.name}</h2>
                                            <p className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                                                {t.language === 'vi' ? 'Lập Trình Viên Frontend' : 'Frontend Developer'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <p className={`text-base leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                            {t.language === 'vi'
                                                ? 'Hồ sơ chuyên nghiệp là phần giới thiệu trong CV của bạn, làm nổi bật những kỹ năng và trình độ phù hợp, thể hiện kinh nghiệm và mục tiêu nghề nghiệp.'
                                                : 'A professional profile is the introduction in your CV, highlighting relevant skills and qualifications, showcasing experience and career goals.'}
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className={`flex items-center ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                            <User className="w-5 h-5 mr-4 text-purple-500" />
                                            <span className="text-lg">{currentUser.name}</span>
                                        </div>
                                        <div className={`flex items-center ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                            <Phone className="w-5 h-5 mr-4 text-purple-500" />
                                            <span className="text-lg">{currentUser.phone}</span>
                                        </div>
                                        <div className={`flex items-center ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                            <MessageCircle className="w-5 h-5 mr-4 text-purple-500" />
                                            <span className="text-lg">{currentUser.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.media}</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsMediaModalOpen(true)}
                                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
                                    >
                                        {t.viewAll}
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {mediaItems.slice(0, 3).map((item) => (
                                        <div key={item.id} className="aspect-video overflow-hidden rounded-lg shadow-sm">
                                            {renderMediaItem(item)}
                                        </div>
                                    ))}
                                    {mediaItems.length > 3 && (
                                        <button
                                            onClick={() => setIsMediaModalOpen(true)}
                                            className={`aspect-video rounded-lg flex flex-col items-center justify-center text-xl font-semibold transition-all duration-200 ${isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
                                        >
                                            +{mediaItems.length - 3}
                                            <span className="text-sm">{t.more}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'settings' && (
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-8">{t.accountSettings}</h1>
                        <div className={`rounded-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border`}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="relative mr-5">
                                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                                            {currentUser.avatar ? (
                                                <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                <div className="text-white text-3xl font-bold">{currentUser.name.charAt(0).toUpperCase()}</div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => avatarInputRef.current?.click()}
                                            className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-600 transition-transform duration-200 hover:scale-110"
                                            title={t.language === 'vi' ? "Thay đổi ảnh đại diện" : "Change avatar"}
                                        >
                                            <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                        </button>
                                        <input
                                            type="file"
                                            ref={avatarInputRef}
                                            onChange={handleAvatarChange}
                                            accept="image/*"
                                            className="hidden"
                                            aria-label="Upload avatar"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-semibold">{currentUser.name}</h3>
                                        <p className={`text-base ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{currentUser.email}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    {!isEditing ? (
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            className="px-5 py-2 text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            {t.edit}
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                onClick={handleSave}
                                                className="px-5 py-2 text-base bg-green-500 hover:bg-green-600 text-white rounded-full"
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                {t.save}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleCancel}
                                                className={`px-5 py-2 text-base rounded-full ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
                                            >
                                                {t.cancel}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t.name}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${isDarkMode
                                            ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                                            : "bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500"
                                            } ${validationErrors.name ? "border-red-500 focus:ring-red-500" : ""} disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400`}
                                        aria-invalid={!!validationErrors.name}
                                        aria-describedby={validationErrors.name ? "name-error" : undefined}
                                    />
                                    <ErrorMessage error={validationErrors.name} />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t.dob}</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${isDarkMode
                                            ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                                            : "bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500"
                                            } disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t.email}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${isDarkMode
                                            ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                                            : "bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500"
                                            } ${validationErrors.email ? "border-red-500 focus:ring-red-500" : ""} disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400`}
                                        aria-invalid={!!validationErrors.email}
                                        aria-describedby={validationErrors.email ? "email-error" : undefined}
                                    />
                                    <ErrorMessage error={validationErrors.email} />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t.phone}</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${isDarkMode
                                            ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                                            : "bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500"
                                            } ${validationErrors.phone ? "border-red-500 focus:ring-red-500" : ""} disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400`}
                                        aria-invalid={!!validationErrors.phone}
                                        aria-describedby={validationErrors.phone ? "phone-error" : undefined}
                                    />
                                    <ErrorMessage error={validationErrors.phone} />
                                </div>
                            </div>
                        </div>
                        <div className={`rounded-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border mt-8`}>
                            <h3 className="text-2xl font-semibold mb-6">{t.deviceManagement}</h3>
                            <div className="space-y-4">
                                {devices.map((device) => (
                                    <div key={device.id} className={`flex items-center justify-between p-4 border rounded-lg ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}>
                                        <div>
                                            <p className="font-medium">{t.deviceName}: {device.deviceName}</p>
                                            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{t.lastLogin}: {device.lastLogin}</p>
                                            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{t.ipAddress}: {device.ipAddress}</p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeviceLogout(device.id)}
                                            className="rounded-full"
                                        >
                                            {t.logoutDevice}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {view === 'security' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center mb-8">
                            <Button
                                variant="ghost"
                                onClick={() => setView('profile')}
                                className="mr-3 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-300"
                                size="icon"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </Button>
                            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">{t.securityPassword}</h1>
                        </div>
                        <div className={`rounded-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border`}>
                            <h3 className="text-2xl font-semibold mb-6">{t.changePassword}</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t.currentPassword}</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${isDarkMode
                                            ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                                            : "bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500"
                                            } ${passwordErrors.currentPassword ? "border-red-500 focus:ring-red-500" : ""}`}
                                        aria-invalid={!!passwordErrors.currentPassword}
                                        aria-describedby={passwordErrors.currentPassword ? "currentPassword-error" : undefined}
                                    />
                                    <ErrorMessage error={passwordErrors.currentPassword} />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t.newPassword}</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                                                : "bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500"
                                                } ${passwordErrors.newPassword ? "border-red-500 focus:ring-red-500" : ""}`}
                                            aria-invalid={!!passwordErrors.newPassword}
                                            aria-describedby={passwordErrors.newPassword ? "newPassword-error" : undefined}
                                        />
                                        <button
                                            type="button"
                                            onClick={toggleNewPasswordVisibility}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            title={showNewPassword ? t.language === 'vi' ? "Ẩn mật khẩu" : "Hide password" : t.language === 'vi' ? "Hiện mật khẩu" : "Show password"}
                                        >
                                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <ErrorMessage error={passwordErrors.newPassword} />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{t.confirmNewPassword}</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmNewPassword"
                                            value={passwordData.confirmNewPassword}
                                            onChange={handlePasswordChange}
                                            className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                                                : "bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500"
                                                } ${passwordErrors.confirmNewPassword ? "border-red-500 focus:ring-red-500" : ""}`}
                                            aria-invalid={!!passwordErrors.confirmNewPassword}
                                            aria-describedby={passwordErrors.confirmNewPassword ? "confirmNewPassword-error" : undefined}
                                        />
                                        <button
                                            type="button"
                                            onClick={toggleConfirmPasswordVisibility}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            title={showConfirmPassword ? t.language === 'vi' ? "Ẩn mật khẩu" : "Hide password" : t.language === 'vi' ? "Hiện mật khẩu" : "Show password"}
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <ErrorMessage error={passwordErrors.confirmNewPassword} />
                                </div>
                                <div className="pt-2">
                                    <Button
                                        onClick={handlePasswordUpdate}
                                        className="px-6 py-3 text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full"
                                    >
                                        {t.updatePassword}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className={`rounded-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border mt-8`}>
                            <h3 className="text-2xl font-semibold mb-6">{t.twoFactorAuth}</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Shield className="w-5 h-5 mr-4 text-purple-500" />
                                        <span className="text-lg">{t.twoFactorAuth}</span>
                                    </div>
                                    <Button
                                        onClick={handle2FAChange}
                                        className={`px-5 py-2 text-base rounded-full ${is2faEnabled ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
                                    >
                                        {is2faEnabled ? t.disable2FA : t.enable2FA}
                                    </Button>
                                </div>
                                {is2faEnabled && (
                                    <div>
                                        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-4`}>{t.scanQRCode}</p>
                                        <div className="flex justify-center">
                                            <img
                                                src="/placeholder.svg?height=150&width=150&text=QR"
                                                alt="2FA QR Code"
                                                className="w-32 h activo-32 rounded-lg shadow-md"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {showToast.show && (
                    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
                        <div className={`border rounded-lg p-4 shadow-lg max-w-sm flex items-start space-x-3 ${showToast.type === 'error'
                            ? isDarkMode ? "bg-red-900 border-red-700" : "bg-red-100 border-red-300"
                            : isDarkMode ? "bg-green-900 border-green-700" : "bg-green-100 border-green-300"}`}>
                            {showToast.type === 'error' ? (
                                <AlertCircle className="w-6 h-6 text-red-500" />
                            ) : (
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            )}
                            <div>
                                <p className={`font-semibold ${showToast.type === 'error' ? "text-red-800 dark:text-red-200" : "text-green-800 dark:text-green-200"}`}>{showToast.message}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowToast({ show: false, message: "", type: 'success' })}
                                className={showToast.type === 'error' ? "text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-100" : "text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100"}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {isMediaModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className={`rounded-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">{t.allMedia}</h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsMediaModalOpen(false)}
                                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                {mediaItems.map((item) => (
                                    <div key={item.id} className="aspect-video overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:scale-105">
                                        {renderMediaItem(item)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
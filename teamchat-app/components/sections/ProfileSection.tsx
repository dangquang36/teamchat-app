import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { User, KeyRound, LogOut, Edit, Save, Camera, ArrowLeft, MoreHorizontal, Sun, Moon, CheckCircle, X, Phone, MessageCircle, Shield, AlertTriangle, AlertCircle, Info } from "lucide-react";

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

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
}

const translations = {
    vi: {
        profile: "Hồ Sơ",
        settings: "Cài Đặt Tài Khoản",
        security: "Bảo Mật & Mật Khẩu",
        logout: "Đăng Xuất",
        myProfile: "Hồ Sơ Của Tôi",
        accountSettings: "Cài Đặt Tài Khoản",
        securityPassword: "Bảo Mật và Mật Khẩu",
        media: "PHƯƠNG TIỆN",
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
        profileUpdated: "Cập nhật thông tin thành công!",
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
        twoFactorAuth: "Xác Thực Hai Yếu Tố",
        enable2FA: "Bật Xác Thực Hai Yếu Tố",
        disable2FA: "Tắt Xác Thực Hai Yếu Tố",
        scanQRCode: "Quét mã QR bằng ứng dụng xác thực của bạn",
        twoFAEnabled: "Xác thực hai yếu tố đã được bật!",
        twoFADisabled: "Xác thực hai yếu tố đã được tắt!",
        nameErrorNumbers: "Họ và tên không được chứa số",
        nameErrorEmpty: "Họ và tên không được để trống",
        nameErrorLength: "Họ và tên phải có ít nhất 2 ký tự",
        dobErrorFuture: "Ngày sinh không thể là ngày trong tương lai",
        dobErrorAge: "Bạn phải trên 18 tuổi",
        dobErrorInvalid: "Ngày sinh không hợp lệ",
        emailErrorFormat: "Định dạng email không hợp lệ",
        emailErrorEmpty: "Email không được để trống",
        phoneErrorFormat: "Số điện thoại không đúng định dạng Việt Nam",
        phoneErrorEmpty: "Số điện thoại không được để trống",
        validationFailed: "Kiểm tra dữ liệu thất bại",
        formHasErrors: "Biểu mẫu có lỗi",
        pleaseFix: "Vui lòng sửa các lỗi trước khi tiếp tục",
        passwordMismatch: "Mật khẩu xác nhận không khớp",
        passwordTooShort: "Mật khẩu phải có ít nhất 8 ký tự",
        passwordWeak: "Mật khẩu quá yếu. Cần có chữ hoa, chữ thường, số và ký tự đặc biệt",
        currentPasswordRequired: "Vui lòng nhập mật khẩu hiện tại",
        networkError: "Lỗi kết nối mạng",
        uploadError: "Lỗi tải lên",
        fileTooLarge: "Tệp quá lớn. Kích thước tối đa là 5MB",
        invalidFileType: "Loại tệp không được hỗ trợ",
        requiredField: "Trường bắt buộc",
        updateFailed: "Cập nhật thất bại",
        somethingWentWrong: "Có lỗi xảy ra. Vui lòng thử lại",
    },
    en: {
        profile: "Profile",
        settings: "Account Settings",
        security: "Security & Password",
        logout: "Log Out",
        myProfile: "My Profile",
        accountSettings: "Account Settings",
        securityPassword: "Security and Password",
        media: "MEDIA",
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
        twoFactorAuth: "Two-Factor Authentication",
        enable2FA: "Enable Two-Factor Authentication",
        disable2FA: "Disable Two-Factor Authentication",
        scanQRCode: "Scan the QR code with your authenticator app",
        twoFAEnabled: "Two-factor authentication enabled!",
        twoFADisabled: "Two-factor authentication disabled!",
        nameErrorNumbers: "Name must not contain numbers",
        nameErrorEmpty: "Name cannot be empty",
        nameErrorLength: "Name must be at least 2 characters",
        dobErrorFuture: "Date of birth cannot be in the future",
        dobErrorAge: "You must be over 18 years old",
        dobErrorInvalid: "Invalid date of birth",
        emailErrorFormat: "Invalid email format",
        emailErrorEmpty: "Email cannot be empty",
        phoneErrorFormat: "Invalid Vietnamese phone number format",
        phoneErrorEmpty: "Phone number cannot be empty",
        validationFailed: "Validation failed",
        formHasErrors: "Form has errors",
        pleaseFix: "Please fix the errors before continuing",
        passwordMismatch: "Password confirmation does not match",
        passwordTooShort: "Password must be at least 8 characters",
        passwordWeak: "Password too weak. Must contain uppercase, lowercase, numbers and special characters",
        currentPasswordRequired: "Please enter current password",
        networkError: "Network connection error",
        uploadError: "Upload error",
        fileTooLarge: "File too large. Maximum size is 5MB",
        invalidFileType: "Unsupported file type",
        requiredField: "Required field",
        updateFailed: "Update failed",
        somethingWentWrong: "Something went wrong. Please try again",
    },
};

export function ProfileSection({ onLogout, isDarkMode = false, toggleDarkMode }: ProfileSectionProps) {
    const [view, setView] = useState<'profile' | 'settings' | 'security'>('profile');
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", dob: "" });
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    });
    const [isEditing, setIsEditing] = useState(false);
    const [is2faEnabled, setIs2faEnabled] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [language, setLanguage] = useState<'vi' | 'en'>('vi');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [devices, setDevices] = useState<Device[]>([
        { id: "1", deviceName: "MacBook Pro", lastLogin: "2025-07-11 10:30", ipAddress: "192.168.1.1" },
        { id: "2", deviceName: "Windows Desktop", lastLogin: "2025-07-10 15:45", ipAddress: "192.168.1.2" },
    ]);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const notificationIdRef = useRef(0);

    const t = translations[language];

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

    // Notification management
    const addNotification = (notification: Omit<Notification, 'id'>) => {
        const id = (++notificationIdRef.current).toString();
        const newNotification = { ...notification, id };
        setNotifications(prev => [...prev, newNotification]);

        const duration = notification.duration || 5000;
        setTimeout(() => {
            removeNotification(id);
        }, duration);
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            Object.values(validationTimeoutRef.current).forEach(timeout => {
                clearTimeout(timeout);
            });
        };
    }, []);

    // Optimized validation with memoization
    const validateInputMemo = React.useCallback((name: string, value: string): string => {
        if (!value.trim()) {
            switch (name) {
                case "name": return t.nameErrorEmpty;
                case "email": return t.emailErrorEmpty;
                case "phone": return t.phoneErrorEmpty;
                default: return t.requiredField;
            }
        }

        switch (name) {
            case "name":
                if (value.length < 2) return t.nameErrorLength;
                if (/\d/.test(value)) return t.nameErrorNumbers;
                return "";
            case "dob":
                const dobDate = new Date(value);
                const today = new Date("2025-07-12");

                if (isNaN(dobDate.getTime())) return t.dobErrorInvalid;
                if (dobDate > today) return t.dobErrorFuture;

                let age = today.getFullYear() - dobDate.getFullYear();
                const monthDiff = today.getMonth() - dobDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
                    age--;
                }
                if (age < 18) return t.dobErrorAge;
                return "";
            case "email":
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t.emailErrorFormat;
                return "";
            case "phone":
                if (!/^(?:\+84|0)(3|5|7|8|9)\d{8}$/.test(value)) return t.phoneErrorFormat;
                return "";
            default:
                return "";
        }
    }, [t]);

    // Use the memoized validation function
    const validateInput = validateInputMemo;

    const validatePassword = (password: string): string[] => {
        const errors: string[] = [];
        if (password.length < 8) errors.push(t.passwordTooShort);
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
            errors.push(t.passwordWeak);
        }
        return errors;
    };

    // Debounced validation refs
    const validationTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

    // FIXED: Optimized real-time validation with debouncing - Prevents cursor loss
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Cập nhật formData ngay lập tức để giữ cursor position
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear existing timeout
        if (validationTimeoutRef.current[name]) {
            clearTimeout(validationTimeoutRef.current[name]);
        }

        // Chỉ validate sau khi người dùng dừng gõ để tránh re-render liên tục
        validationTimeoutRef.current[name] = setTimeout(() => {
            const error = validateInput(name, value);
            setErrors(prev => {
                // Chỉ update nếu error thực sự thay đổi
                if (prev[name] === error) return prev;

                const newErrors = { ...prev };
                if (error) {
                    newErrors[name] = error;
                } else {
                    delete newErrors[name];
                }
                return newErrors;
            });
        }, 500); // Tăng debounce time lên 500ms
    };

    // FIXED: Password change handler - Prevents cursor loss
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Cập nhật password data ngay lập tức
        setPasswordData(prev => ({ ...prev, [name]: value }));

        // Clear existing timeout
        if (validationTimeoutRef.current[name]) {
            clearTimeout(validationTimeoutRef.current[name]);
        }

        // Debounce password validation
        validationTimeoutRef.current[name] = setTimeout(() => {
            if (name === 'newPassword') {
                const passwordErrors = validatePassword(value);
                const errorMsg = passwordErrors.join(', ');
                setErrors(prev => {
                    if (prev.newPassword === errorMsg) return prev;
                    return { ...prev, newPassword: errorMsg };
                });
            }

            if (name === 'confirmNewPassword') {
                const confirmError = passwordData.newPassword !== value ? t.passwordMismatch : "";
                setErrors(prev => {
                    if (prev.confirmNewPassword === confirmError) return prev;
                    return { ...prev, confirmNewPassword: confirmError };
                });
            }
        }, 500);
    };

    // Form submission
    const handleSave = async () => {
        if (!currentUser) return;

        setIsLoading(true);

        try {
            const newErrors: { [key: string]: string } = {};
            newErrors.name = validateInput("name", formData.name);
            newErrors.dob = validateInput("dob", formData.dob);
            newErrors.email = validateInput("email", formData.email);
            newErrors.phone = validateInput("phone", formData.phone);

            setErrors(newErrors);

            const hasErrors = Object.values(newErrors).some(error => error);
            if (hasErrors) {
                addNotification({
                    type: 'error',
                    title: t.formHasErrors,
                    message: t.pleaseFix,
                    duration: 6000
                });
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            if (Math.random() < 0.1) {
                throw new Error('Network error');
            }

            const updatedUser: UserData = { ...currentUser, ...formData };
            setCurrentUser(updatedUser);
            setIsEditing(false);

            addNotification({
                type: 'success',
                title: t.profileUpdated,
                message: 'Thông tin của bạn đã được cập nhật thành công.',
                duration: 4000
            });

        } catch (error) {
            addNotification({
                type: 'error',
                title: t.updateFailed,
                message: t.somethingWentWrong,
                duration: 6000
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordUpdate = async () => {
        setIsLoading(true);

        try {
            const newErrors: { [key: string]: string } = {};

            if (!passwordData.currentPassword) {
                newErrors.currentPassword = t.currentPasswordRequired;
            }

            const passwordErrors = validatePassword(passwordData.newPassword);
            if (passwordErrors.length > 0) {
                newErrors.newPassword = passwordErrors.join(', ');
            }

            if (passwordData.newPassword !== passwordData.confirmNewPassword) {
                newErrors.confirmNewPassword = t.passwordMismatch;
            }

            setErrors(prev => ({ ...prev, ...newErrors }));

            if (Object.values(newErrors).some(error => error)) {
                addNotification({
                    type: 'error',
                    title: t.validationFailed,
                    message: t.pleaseFix,
                    duration: 6000
                });
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
            setErrors(prev => {
                const { currentPassword, newPassword, confirmNewPassword, ...rest } = prev;
                return rest;
            });

            addNotification({
                type: 'success',
                title: t.passwordUpdated,
                message: 'Mật khẩu của bạn đã được thay đổi thành công.',
                duration: 4000
            });

        } catch (error) {
            addNotification({
                type: 'error',
                title: t.updateFailed,
                message: t.networkError,
                duration: 6000
            });
        } finally {
            setIsLoading(false);
        }
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
        setErrors({});
        setIsEditing(false);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && currentUser) {
            const file = e.target.files[0];

            if (file.size > 5 * 1024 * 1024) {
                addNotification({
                    type: 'error',
                    title: t.uploadError,
                    message: t.fileTooLarge,
                    duration: 5000
                });
                return;
            }

            if (!file.type.startsWith('image/')) {
                addNotification({
                    type: 'error',
                    title: t.uploadError,
                    message: t.invalidFileType,
                    duration: 5000
                });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const updatedUser: UserData = { ...currentUser, avatar: reader.result as string };
                setCurrentUser(updatedUser);
                addNotification({
                    type: 'success',
                    title: t.avatarUpdated,
                    message: 'Ảnh đại diện đã được thay đổi thành công.',
                    duration: 3000
                });
            };
            reader.onerror = () => {
                addNotification({
                    type: 'error',
                    title: t.uploadError,
                    message: t.somethingWentWrong,
                    duration: 5000
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeviceLogout = (deviceId: string) => {
        setDevices(devices.filter(device => device.id !== deviceId));
        addNotification({
            type: 'info',
            title: t.logoutDevice,
            message: 'Thiết bị đã được đăng xuất thành công.',
            duration: 3000
        });
    };

    const handle2FAChange = () => {
        setIs2faEnabled(!is2faEnabled);
        addNotification({
            type: 'success',
            title: is2faEnabled ? t.twoFADisabled : t.twoFAEnabled,
            message: is2faEnabled ? 'Xác thực hai yếu tố đã được tắt.' : 'Xác thực hai yếu tố đã được bật.',
            duration: 4000
        });
    };

    // Notification component
    const NotificationItem = ({ notification }: { notification: Notification }) => {
        const getIcon = () => {
            switch (notification.type) {
                case 'success': return <CheckCircle className="w-5 h-5" />;
                case 'error': return <AlertCircle className="w-5 h-5" />;
                case 'warning': return <AlertTriangle className="w-5 h-5" />;
                case 'info': return <Info className="w-5 h-5" />;
            }
        };

        const getColorClasses = () => {
            switch (notification.type) {
                case 'success':
                    return `bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200`;
                case 'error':
                    return `bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200`;
                case 'warning':
                    return `bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200`;
                case 'info':
                    return `bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200`;
            }
        };

        const getIconColor = () => {
            switch (notification.type) {
                case 'success': return 'text-green-500';
                case 'error': return 'text-red-500';
                case 'warning': return 'text-yellow-500';
                case 'info': return 'text-blue-500';
            }
        };

        return (
            <div className={`${getColorClasses()} border rounded-lg p-4 shadow-lg max-w-sm flex items-start space-x-3 animate-slide-in-right`}>
                <div className={getIconColor()}>
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm mb-1">{notification.title}</p>
                    <p className="text-sm opacity-90">{notification.message}</p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNotification(notification.id)}
                    className="text-current hover:bg-white hover:bg-opacity-20 flex-shrink-0 w-6 h-6"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        );
    };

    // Optimized Form field wrapper with better performance
    const FormField = React.memo(({
        label,
        name,
        type = "text",
        value,
        onChange,
        readOnly = false,
        required = false,
        error = ""
    }: {
        label: string;
        name: string;
        type?: string;
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        readOnly?: boolean;
        required?: boolean;
        error?: string;
    }) => (
        <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${isDarkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
                    } ${!readOnly ? '' : 'cursor-not-allowed bg-opacity-50'} ${error ? 'border-red-500 focus:ring-red-300' : 'focus:border-purple-400'}`}
                placeholder={readOnly ? "" : `Nhập ${label.toLowerCase()}...`}
            />
            {error && (
                <div className="flex items-center space-x-2 mt-1 animate-slide-down">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-500">{error}</p>
                </div>
            )}
        </div>
    ));

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
            console.error("Failed to parse user data", error);
            const fallbackUser = { name: "Admin User", email: "admin@example.com", phone: "0912345678", dob: "2004-06-22" };
            setCurrentUser(fallbackUser);
            setFormData(fallbackUser);
            addNotification({
                type: 'warning',
                title: 'Cảnh báo',
                message: 'Không thể tải dữ liệu người dùng. Sử dụng dữ liệu mặc định.',
                duration: 5000
            });
        }
    }, []);

    if (!currentUser) {
        return (
            <div className={`flex items-center justify-center h-full ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                <div className="text-center p-8 rounded-lg shadow-lg bg-white dark:bg-gray-800">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p>{language === 'vi' ? 'Đang tải dữ liệu người dùng...' : 'Loading user data...'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
            {/* Notification Container */}
            <div className="fixed top-4 right-4 z-50 space-y-3">
                {notifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                ))}
            </div>

            <div className={`w-72 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r p-6 flex flex-col shadow-lg`}>
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">{language === 'vi' ? 'Thiết Lập' : 'Settings'}</h2>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavButton
                        activeView={view}
                        targetView="profile"
                        onClick={() => setView('profile')}
                    >
                        <User className="w-5 h-5 mr-3" />
                        <span className="text-lg">{t.profile}</span>
                    </NavButton>

                    <NavButton
                        activeView={view}
                        targetView="settings"
                        onClick={() => setView('settings')}
                    >
                        <Edit className="w-5 h-5 mr-3" />
                        <span className="text-lg">{t.settings}</span>
                    </NavButton>

                    <NavButton
                        activeView={view}
                        targetView="security"
                        onClick={() => setView('security')}
                    >
                        <KeyRound className="w-5 h-5 mr-3" />
                        <span className="text-lg">{t.security}</span>
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
                            {language === 'vi' ? `Chế độ ${isDarkMode ? 'sáng' : 'tối'}` : `${isDarkMode ? 'Light' : 'Dark'} Mode`}
                        </Button>
                    )}
                    <Button
                        variant="destructive"
                        onClick={onLogout}
                        className="w-full text-lg py-3"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        {t.logout}
                    </Button>
                </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                {view === 'profile' && (
                    <div className="max-w-5xl mx-auto animate-fade-in-up">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-4xl font-extrabold text-purple-700 dark:text-purple-300">{t.myProfile}</h1>
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
                                                title={language === 'vi' ? "Thay đổi ảnh đại diện" : "Change avatar"}
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
                                                {language === 'vi' ? 'Lập Trình Viên Frontend' : 'Frontend Developer'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {language === 'vi'
                                                ? 'Hồ sơ chuyên nghiệp là phần giới thiệu trong CV của bạn, làm nổi bật những kỹ năng và trình độ phù hợp, thể hiện kinh nghiệm và mục tiêu nghề nghiệp.'
                                                : 'A professional profile is the introduction in your CV, highlighting relevant skills and qualifications, showcasing experience and career goals.'}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                                            <User className="w-5 h-5 mr-4 text-purple-500 dark:text-purple-400" />
                                            <span className="text-lg">
                                                {currentUser?.name || t.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                                            <Phone className="w-5 h-5 mr-4 text-purple-500 dark:text-purple-400" />
                                            <span className="text-lg">
                                                {currentUser?.phone || t.phone}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                                            <MessageCircle className="w-5 h-5 mr-4 text-purple-500 dark:text-purple-400" />
                                            <span className="text-lg">
                                                {currentUser?.email || t.email}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-2xl p-6 shadow-xl h-fit transition-all duration-300 hover:shadow-2xl`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                        {t.media}
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsMediaModalOpen(true)}
                                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
                                    >
                                        {t.viewAll}
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
                                            <span className="text-sm">{t.more}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {view === 'settings' && (
                    <div className="max-w-3xl mx-auto animate-fade-in-up">
                        <h1 className="text-4xl font-extrabold text-purple-700 dark:text-purple-300 mb-8">{t.accountSettings}</h1>
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
                                            title={language === 'vi' ? "Thay đổi ảnh đại diện" : "Change avatar"}
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
                                            {t.edit}
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                onClick={handleSave}
                                                disabled={isLoading}
                                                className="px-5 py-2 text-base bg-green-500 hover:bg-green-600 disabled:opacity-50"
                                            >
                                                {isLoading ? (
                                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                                ) : (
                                                    <Save className="w-4 h-4 mr-2" />
                                                )}
                                                {t.save}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleCancel}
                                                disabled={isLoading}
                                                className="px-5 py-2 text-base border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                                            >
                                                {t.cancel}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={`p-6 rounded-lg shadow-md mb-8 ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
                            <h4 className={`text-lg font-semibold mb-4 border-b pb-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>{t.personalInfo}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    label={t.name}
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    readOnly={!isEditing}
                                    required
                                    error={errors.name}
                                />
                                <FormField
                                    label={t.dob}
                                    name="dob"
                                    type="date"
                                    value={formData.dob}
                                    onChange={handleInputChange}
                                    readOnly={!isEditing}
                                    required
                                    error={errors.dob}
                                />
                                <FormField
                                    label={t.email}
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    readOnly={!isEditing}
                                    required
                                    error={errors.email}
                                />
                                <FormField
                                    label={t.phone}
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    readOnly={!isEditing}
                                    required
                                    error={errors.phone}
                                />
                            </div>
                        </div>

                        <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-2xl p-8 mb-8 shadow-xl`}>
                            <h3 className="text-2xl font-semibold mb-6">{t.deviceManagement}</h3>
                            <div className="space-y-4">
                                {devices.map((device) => (
                                    <div key={device.id} className={`flex items-center justify-between p-4 border rounded-lg ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                        <div>
                                            <p className="font-medium">{t.deviceName}: {device.deviceName}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{t.lastLogin}: {device.lastLogin}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{t.ipAddress}: {device.ipAddress}</p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeviceLogout(device.id)}
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
                            <h1 className="text-4xl font-extrabold text-purple-700 dark:text-purple-300">{t.securityPassword}</h1>
                        </div>

                        <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-2xl p-8 mb-8 shadow-xl`}>
                            <h3 className="text-2xl font-semibold mb-6">{t.changePassword}</h3>

                            <div className="space-y-6">
                                <FormField
                                    label={t.currentPassword}
                                    name="currentPassword"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    error={errors.currentPassword}
                                />
                                <FormField
                                    label={t.newPassword}
                                    name="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    error={errors.newPassword}
                                />
                                <FormField
                                    label={t.confirmNewPassword}
                                    name="confirmNewPassword"
                                    type="password"
                                    value={passwordData.confirmNewPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    error={errors.confirmNewPassword}
                                />

                                <div className="pt-2">
                                    <Button
                                        onClick={handlePasswordUpdate}
                                        disabled={isLoading}
                                        className="px-6 py-3 text-base"
                                    >
                                        {isLoading ? (
                                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                        ) : null}
                                        {t.updatePassword}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-2xl p-8 shadow-xl`}>
                            <h3 className="text-2xl font-semibold mb-6">{t.twoFactorAuth}</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Shield className="w-5 h-5 mr-4 text-purple-500 dark:text-purple-400" />
                                        <span className="text-lg">{t.twoFactorAuth}</span>
                                    </div>
                                    <Button
                                        onClick={handle2FAChange}
                                        className={`px-5 py-2 text-base ${is2faEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                                    >
                                        {is2faEnabled ? t.disable2FA : t.enable2FA}
                                    </Button>
                                </div>
                                {is2faEnabled && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t.scanQRCode}</p>
                                        <div className="flex justify-center">
                                            <img
                                                src="/placeholder.svg?height=150&width=150&text=QR"
                                                alt="2FA QR Code"
                                                className="w-32 h-32"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isMediaModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className={`${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} rounded-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative`}>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-purple-700 dark:text-purple-300">{t.allMedia}</h2>
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
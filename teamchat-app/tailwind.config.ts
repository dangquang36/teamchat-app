import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"*.{js,ts,jsx,tsx,mdx}"
	],
	theme: {
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};
export default config;
export const translations: translations = {
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
		twoFactorAuth: "Xác Thực Hai Yếu Tố",
		enable2FA: "Bật Xác Thực Hai Yếu Tố",
		disable2FA: "Tắt Xác Thực Hai Yếu Tố",
		setup2FA: "Thiết Lập Xác Thực Hai Yếu Tố",
		scanQRCode: "Quét mã QR bằng ứng dụng xác thực của bạn",
		twoFAEnabled: "Xác thực hai yếu tố đã được bật!",
		twoFADisabled: "Xác thực hai yếu tố đã được tắt!",
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
		language: "Language",
		selectLanguage: "Select Language",
		twoFactorAuth: "Two-Factor Authentication",
		enable2FA: "Enable Two-Factor Authentication",
		disable2FA: "Disable Two-Factor Authentication",
		setup2FA: "Set Up Two-Factor Authentication",
		scanQRCode: "Scan the QR code with your authenticator app",
		twoFAEnabled: "Two-factor authentication enabled!",
		twoFADisabled: "Two-factor authentication disabled!",
	},
};

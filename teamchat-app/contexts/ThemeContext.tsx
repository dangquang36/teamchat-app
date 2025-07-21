'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface ThemeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isDarkMode, setIsDarkMode] = useState(true);

    // ✅ PHẦN QUAN TRỌNG NHẤT
    // useEffect này sẽ chạy mỗi khi trạng thái isDarkMode thay đổi
    useEffect(() => {
        const root = window.document.documentElement;

        // Xóa class cũ để tránh bị trùng lặp
        root.classList.remove(isDarkMode ? 'light' : 'dark');

        // Thêm class mới tương ứng
        root.classList.add(isDarkMode ? 'dark' : 'light');

        // Lưu lựa chọn của người dùng vào localStorage để ghi nhớ
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    // useEffect này chỉ chạy một lần khi tải lại trang để đọc trạng thái đã lưu
    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode !== null) {
            setIsDarkMode(JSON.parse(savedMode));
        }
    }, []);

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
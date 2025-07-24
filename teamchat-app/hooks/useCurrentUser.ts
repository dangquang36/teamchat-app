
import { useState, useEffect } from 'react';
import type { UserProfile } from '@/app/types'; // Đảm bảo đường dẫn này đúng

export const useCurrentUser = () => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        // Chỉ chạy ở phía client
        if (typeof window !== 'undefined') {
            const userJson = localStorage.getItem('currentUser');
            if (userJson) {
                try {
                    setCurrentUser(JSON.parse(userJson));
                } catch (error) {
                    console.error("Failed to parse current user from localStorage", error);
                    setCurrentUser(null);
                }
            }
        }
    }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần sau khi component mount

    return currentUser;
};
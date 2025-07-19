// File: contexts/GroupContext.tsx

'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

// 1. Định nghĩa "hình dạng" của một kênh/nhóm
export interface Group {
    membersList: { id: string; name: string; avatar: string; role: string; }[];
    createdBy: string;
    createdAt: string;
    type: "public" | "private";
    banner: undefined;
    icon: undefined;
    description: string;
    id: string;
    name: string;
    members: number;
}

// 2. Định nghĩa những gì Context sẽ cung cấp
interface GroupContextType {
    groups: Group[];
    addGroup: (groupData: { name: string }) => void;
}

// 3. Tạo Context
const GroupContext = createContext<GroupContextType | undefined>(undefined);

// 4. Tạo Provider (Nhà cung cấp) - Component này sẽ bao bọc ứng dụng của chúng ta
export const GroupProvider = ({ children }: { children: ReactNode }) => {
    // Dữ liệu ban đầu, giống trong hình của bạn
    const [groups, setGroups] = useState<Group[]>([
        {
            id: 'landing-design', name: 'Landing Design', members: 23,
            description: ''
        }
    ]);

    // Hàm để thêm một nhóm mới vào danh sách
    const addGroup = (groupData: { name: string }) => {
        console.log("2. GroupContext đã nhận được yêu cầu thêm kênh:", groupData.name); // <-- THÊM DÒNG NÀY
        const newGroup: Group = {
            id: `channel-${Date.now()}`,
            name: groupData.name,
            members: 1,
            description: ''
        };
        setGroups(prevGroups => [...prevGroups, newGroup]);
    }

    const value = { groups, addGroup };

    return (
        <GroupContext.Provider value={value}>
            {children}
        </GroupContext.Provider>
    );
};

// 5. Tạo một Hook tùy chỉnh để dễ dàng sử dụng Context
export const useGroups = () => {
    const context = useContext(GroupContext);
    if (context === undefined) {
        throw new Error('useGroups must be used within a GroupProvider');
    }
    return context;
};
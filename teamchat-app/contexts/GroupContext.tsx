'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

// 1. Định nghĩa "hình dạng" của một kênh/nhóm
export interface Group {
    id: string;
    name: string;
    description: string;
    members: number;
    membersList: { id: string; username: string; role: "leader" | "member" }[];
    createdBy: string;
    createdAt: string;
    type: "public" | "private";
    avatar?: string;
}

// ✅ 2. Cập nhật kiểu dữ liệu cho hàm addGroup
interface GroupContextType {
    groups: Group[];
    addGroup: (groupData: Omit<Group, 'membersList' | 'createdBy' | 'createdAt'>) => void;
    deleteGroup: (groupId: string) => void;
}

// 3. Tạo Context
const GroupContext = createContext<GroupContextType | undefined>(undefined);

// 4. Tạo Provider (Nhà cung cấp)
export const GroupProvider = ({ children }: { children: ReactNode }) => {
    // ✅ Cung cấp đủ các trường cho dữ liệu ban đầu
    const [groups, setGroups] = useState<Group[]>([

    ]);

    // ✅ Cập nhật hàm addGroup để tạo object Group hoàn chỉnh
    const addGroup = (groupData: Omit<Group, 'membersList' | 'createdBy' | 'createdAt'>) => {
        console.log("GroupContext đã nhận yêu cầu thêm kênh:", groupData.name);

        const newGroup: Group = {
            ...groupData,
            // Thêm các trường mặc định cho một nhóm mới
            membersList: [{ id: "currentUser", username: "Bạn", role: "leader" }], // Người tạo là leader
            createdBy: "currentUser", // Thay bằng ID người dùng hiện tại
            createdAt: new Date().toISOString()
        };

        setGroups(prevGroups => [...prevGroups, newGroup]);
    }

    const deleteGroup = (groupId: string) => {
        setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
    };

    const value = { groups, addGroup, deleteGroup };

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
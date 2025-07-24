
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useChat } from '@/hooks/useChat';

// Định nghĩa kiểu dữ liệu cho giá trị trả về của hook useChat
type ChatContextType = ReturnType<typeof useChat>;

// Tạo Context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Tạo Provider
export const ChatProvider = ({ children }: { children: ReactNode }) => {
    // isDarkMode có thể được lấy từ một context khác nếu cần, ở đây tạm set là true
    const chatState = useChat(true);

    return (
        <ChatContext.Provider value={chatState}>
            {children}
        </ChatContext.Provider>
    );
};

// Tạo custom hook để dễ dàng sử dụng context
export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};
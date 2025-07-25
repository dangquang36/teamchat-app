'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useChat } from '@/hooks/useChat';
import { useTheme } from './ThemeContext';

type ChatContextType = ReturnType<typeof useChat>;

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { isDarkMode } = useTheme();
    const chatState = useChat(isDarkMode);

    return (
        <ChatContext.Provider value={chatState}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};
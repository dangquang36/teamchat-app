// src/app/channels/layout.tsx
'use client';

import { GroupProvider } from "@/contexts/GroupContext";

export default function ChannelsLayout({ children }: { children: React.ReactNode }) {
    return (
        <GroupProvider>
            {children}
        </GroupProvider>
    );
}

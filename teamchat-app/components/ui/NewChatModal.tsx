// File: components/ui/NewChatModal.tsx
'use client';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

const dummyUsers = [
    { id: 'victoria', name: 'Victoria Lane', avatar: '/placeholder.svg?text=VL' },
    { id: 'ella', name: 'Ella McDaniel', avatar: '/placeholder.svg?text=EM' },
    { id: 'james', name: 'James Pinard', avatar: '/placeholder.svg?text=JP' },
    { id: 'ronald', name: 'Ronald Downey', avatar: '/placeholder.svg?text=RD' },
    { id: 'nicholas', name: 'Nicholas Staten', avatar: '/placeholder.svg?text=NS' },
    { id: 'kathryn', name: 'Kathryn Swarey', avatar: '/placeholder.svg?text=KS' },
    { id: 'robert', name: 'Robert Lebdonne', avatar: '/placeholder.svg?text=RL' },
];
export type User = typeof dummyUsers[0];

interface NewChatModalProps {
    onClose: () => void;
    onSelectUser: (user: User) => void;
}

export function NewChatModal({ onClose, onSelectUser }: NewChatModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(dummyUsers);

    useEffect(() => {
        setFilteredUsers(
            dummyUsers.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm]);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-lg font-semibold dark:text-white">Bắt đầu cuộc trò chuyện mới</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}><X className="h-5 w-5" /></Button>
                </header>
                <div className="p-4 border-b dark:border-gray-700">
                    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Tìm kiếm người dùng..." className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                </div>
                <main className="flex-1 overflow-y-auto p-2">
                    {filteredUsers.map(user => (
                        <li key={user.id} className="list-none">
                            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                <div className="flex items-center gap-3"><img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" /><span className="font-medium dark:text-white">{user.name}</span></div>
                                <Button size="sm" onClick={() => onSelectUser(user)}>Nhắn tin</Button>
                            </div>
                        </li>
                    ))}
                </main>
            </div>
        </div>
    );
}
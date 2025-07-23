import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Search, UserPlus, Check } from 'lucide-react';
import type { DirectMessage } from '@/app/types';

// --- SỬA ĐỔI: Cập nhật cơ sở dữ liệu người dùng giả lập ---
const allUsersDatabase: Omit<DirectMessage, 'message'>[] = [
    { id: 'minh.khoi', name: 'Trần Minh Khôi', email: 'minh.khoi@example.com', avatar: '/placeholder.svg?text=MK', online: true, coverPhotoUrl: '', phone: '', birthday: '', socialProfiles: {} as any, mutualGroups: 2 },
    { id: 'an.nguyen', name: 'Nguyễn Văn An', email: 'an.nguyen@example.com', avatar: '/placeholder.svg?text=AN', online: false, coverPhotoUrl: '', phone: '', birthday: '', socialProfiles: {} as any, mutualGroups: 4 },
    { id: 'phuong.thao', name: 'Lê Thị Phương Thảo', email: 'phuong.thao@example.com', avatar: '/placeholder.svg?text=PT', online: true, coverPhotoUrl: '', phone: '', birthday: '', socialProfiles: {} as any, mutualGroups: 1 },
    { id: 'john.doe', name: 'John Doe', email: 'john.doe@example.com', avatar: '/placeholder.svg?text=JD', online: true, coverPhotoUrl: '', phone: '', birthday: '', socialProfiles: {} as any, mutualGroups: 0 },
    { id: 'jane.smith', name: 'Jane Smith', email: 'jane.smith@example.com', avatar: '/placeholder.svg?text=JS', online: false, coverPhotoUrl: '', phone: '', birthday: '', socialProfiles: {} as any, mutualGroups: 3 },
];

interface AddContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddContact: (user: Omit<DirectMessage, 'message'>) => void;
    existingContacts: DirectMessage[];
    isDarkMode?: boolean;
}

export function AddContactModal({ isOpen, onClose, onAddContact, existingContacts, isDarkMode }: AddContactModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Omit<DirectMessage, 'message'>[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const timer = setTimeout(() => {
            const results = allUsersDatabase.filter(user =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSearchResults(results);
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset state khi modal đóng
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setSearchResults([]);
            setIsLoading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const existingContactIds = new Set(existingContacts.map(c => c.id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity">
            <div className={`rounded-xl shadow-2xl w-full max-w-md flex flex-col transform transition-all ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white'}`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h2 className="text-lg font-semibold">Tìm và thêm bạn bè</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="p-4">
                    <div className="relative">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                            type="text"
                            placeholder="Nhập tên hoặc email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}
                        />
                    </div>
                </div>

                {/* Search Results */}
                <div className="flex-1 px-4 pb-4 min-h-[300px] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="space-y-2">
                            {searchResults.map(user => {
                                const isAlreadyAdded = existingContactIds.has(user.id);
                                return (
                                    <div key={user.id} className={`flex items-center justify-between p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                        <div className="flex items-center">
                                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            disabled={isAlreadyAdded}
                                            onClick={() => onAddContact(user)}
                                            className={isAlreadyAdded ? `bg-green-600 hover:bg-green-600 cursor-not-allowed` : `bg-purple-500 hover:bg-purple-600`}
                                        >
                                            {isAlreadyAdded ? <Check className="h-4 w-4 mr-1" /> : <UserPlus className="h-4 w-4 mr-1" />}
                                            {isAlreadyAdded ? 'Đã là bạn' : 'Thêm'}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center text-sm text-gray-500 pt-10">
                            {searchQuery ? 'Không tìm thấy người dùng nào.' : 'Bắt đầu tìm kiếm để thêm bạn mới.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
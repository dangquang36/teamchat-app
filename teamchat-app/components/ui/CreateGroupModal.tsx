// File: components/ui/CreateGroupModal.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGroups } from '@/contexts/GroupContext';

interface CreateGroupModalProps {
    onClose: () => void;
}

export function CreateGroupModal({ onClose }: CreateGroupModalProps) {
    const [groupName, setGroupName] = useState("");
    const { addGroup } = useGroups();

    const handleCreateGroup = () => {
        if (groupName.trim()) {
            addGroup({ name: groupName });
            onClose();
        } else {
            alert("Vui lòng nhập tên kênh!");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Tạo Nhóm mới</h2>
                <div>
                    <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tên nhóm</label>
                    <input
                        id="groupName"
                        type="text"
                        placeholder="ví dụ: team-marketing"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200">Hủy</button>
                    <Button onClick={handleCreateGroup}>Tạo nhóm</Button>
                </div>
            </div>
        </div>
    );
}
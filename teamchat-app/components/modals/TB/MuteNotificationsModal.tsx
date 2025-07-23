import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface MuteNotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (duration: string) => void;
    isDarkMode?: boolean;
}

const MUTE_OPTIONS = [
    { id: '1_hour', label: 'Trong 1 giờ' },
    { id: '4_hours', label: 'Trong 4 giờ' },
    { id: 'until_8_am', label: 'Cho đến 8:00 AM' },
    { id: 'until_reopened', label: 'Cho đến khi được mở lại' },
];

export function MuteNotificationsModal({ isOpen, onClose, onConfirm, isDarkMode = false }: MuteNotificationsModalProps) {
    const [selectedOption, setSelectedOption] = useState(MUTE_OPTIONS[0].id);

    if (!isOpen) {
        return null;
    }

    const handleConfirm = () => {
        onConfirm(selectedOption);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-lg shadow-xl w-full max-w-sm flex flex-col ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white'}`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h2 className="text-lg font-semibold">Xác nhận</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <p>Bạn có chắc muốn tắt thông báo hội thoại này:</p>
                    <div className="space-y-3">
                        {MUTE_OPTIONS.map((option) => (
                            <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="mute-option"
                                    value={option.id}
                                    checked={selectedOption === option.id}
                                    onChange={() => setSelectedOption(option.id)}
                                    className="h-4 w-4 accent-blue-600 dark:accent-blue-500"
                                />
                                <span>{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className={`flex items-center justify-end p-4 border-t space-x-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <Button variant="ghost" onClick={onClose} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}>
                        Hủy
                    </Button>
                    <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Đồng ý
                    </Button>
                </div>
            </div>
        </div>
    );
}
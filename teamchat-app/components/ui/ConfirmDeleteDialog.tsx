import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ConfirmDeleteProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    contactName: string;
}

export const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({ isOpen, onClose, onConfirm, contactName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 text-white w-96">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Xác nhận xóa liên lạc</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <p className="mb-6">Bạn có chắc chắn muốn xóa liên lạc "{contactName}" không? Hành động này không thể hoàn tác.</p>
                <div className="flex justify-end gap-4">
                    <Button
                        onClick={onClose}
                        className="bg-gray-600 text-white hover:bg-gray-500 px-4 py-2 rounded"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="bg-red-600 text-white hover:bg-red-500 px-4 py-2 rounded"
                    >
                        Xác nhận
                    </Button>
                </div>
            </div>
        </div>
    );
};
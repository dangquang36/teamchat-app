"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useChannels } from '@/contexts/ChannelContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface CreateChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateChannelModal({ isOpen, onClose }: CreateChannelModalProps) {
    const [channelName, setChannelName] = useState("");
    const [channelDescription, setChannelDescription] = useState("");
    const [channelImage, setChannelImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { addChannel } = useChannels();
    const currentUser = useCurrentUser();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({
                    title: "Lỗi",
                    description: "Kích thước ảnh không được vượt quá 5MB",
                    variant: "destructive"
                });
                return;
            }

            setChannelImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!channelName.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập tên kênh",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Add channel to context and get the channel ID
            const channelId = addChannel({
                name: channelName,
                description: channelDescription,
                image: imagePreview || undefined
            }, currentUser ? {
                id: currentUser.id,
                name: currentUser.name,
                avatar: currentUser.avatar
            } : undefined);

            toast({
                title: "Thành công!",
                description: `Kênh "${channelName}" đã được tạo thành công`,
            });

            // Navigate to the new channel using the returned channel ID
            router.push(`/dashboard/kenh/${channelId}`);

            // Reset form
            setChannelName("");
            setChannelDescription("");
            setChannelImage(null);
            setImagePreview("");
            onClose();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể tạo kênh. Vui lòng thử lại.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Tạo kênh chat mới
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Ảnh kênh (tùy chọn)
                        </label>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-1">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Thêm ảnh</p>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Tải lên ảnh cho kênh (JPG, PNG, tối đa 5MB)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tên kênh
                        </label>
                        <input
                            type="text"
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value)}
                            placeholder="Nhập tên kênh..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Mô tả (tùy chọn)
                        </label>
                        <textarea
                            value={channelDescription}
                            onChange={(e) => setChannelDescription(e.target.value)}
                            placeholder="Mô tả về kênh chat này..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang tạo...
                                </div>
                            ) : (
                                "Tạo kênh"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
} 
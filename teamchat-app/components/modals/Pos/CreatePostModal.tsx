import React from "react";
import { Button } from "@/components/ui/button";

interface CreatePostModalProps {
    onClose: () => void;
}

export function CreatePostModal({ onClose }: CreatePostModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Tạo Bài Viết</h3>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        ✕
                    </Button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">D</span>
                        </div>
                        <div>
                            <h4 className="font-medium">Dushane Daniel</h4>
                            <p className="text-sm text-gray-500">Công khai</p>
                        </div>
                    </div>

                    <textarea
                        placeholder="Bạn đang nghĩ gì?"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows={4}
                    />

                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" className="flex items-center space-x-2">
                            <span>📷</span>
                            <span>Ảnh</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center space-x-2">
                            <span>📹</span>
                            <span>Video</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center space-x-2">
                            <span>📎</span>
                            <span>Tệp</span>
                        </Button>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button className="bg-purple-500 hover:bg-purple-600">Đăng</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
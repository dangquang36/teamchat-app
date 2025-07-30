"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Link, Users, Clock, AlertCircle } from "lucide-react";

interface JoinMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onJoinRoom: (roomId: string) => void;
}

export function JoinMeetingModal({ isOpen, onClose, onJoinRoom }: JoinMeetingModalProps) {
    const [roomId, setRoomId] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!roomId.trim()) {
            setError("Vui lòng nhập ID cuộc họp");
            return;
        }

        setIsJoining(true);
        setError("");

        try {
            const cleanRoomId = roomId.trim();

            // Kiểm tra xem phòng có tồn tại và active không
            const response = await fetch('/api/livekit/check-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomName: cleanRoomId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Không thể kiểm tra phòng họp');
            }

            const roomData = await response.json();

            // Kiểm tra xem phòng có tồn tại và có người tham gia không
            if (!roomData.exists) {
                setError(`Phòng họp "${cleanRoomId}" không tồn tại. Vui lòng kiểm tra lại ID hoặc liên hệ người tạo cuộc họp.`);
                return;
            }

            // Nếu phòng tồn tại nhưng chưa có ai tham gia
            if (roomData.roomInfo && roomData.roomInfo.participantCount === 0) {
                setError(`Phòng họp "${cleanRoomId}" chưa có ai tham gia. Vui lòng đợi người tạo cuộc họp bắt đầu trước.`);
                return;
            }

            // Nếu tất cả điều kiện đều OK, tham gia phòng
            onJoinRoom(cleanRoomId);
            onClose();
            setRoomId("");

        } catch (err) {
            console.error('Error joining room:', err);
            setError(err instanceof Error ? err.message : 'Không thể tham gia cuộc họp');
        } finally {
            setIsJoining(false);
        }
    };

    const handleClose = () => {
        if (!isJoining) {
            setRoomId("");
            setError("");
            onClose();
        }
    };

    const handleRoomIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRoomId(e.target.value);
        if (error) setError("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Link className="h-5 w-5 text-blue-500" />
                        Tham gia cuộc họp
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="roomId">ID hoặc tên phòng cuộc họp</Label>
                        <Input
                            id="roomId"
                            type="text"
                            placeholder="Ví dụ: hop-team-meeting-abc123"
                            value={roomId}
                            onChange={handleRoomIdChange}
                            disabled={isJoining}
                            className={error ? "border-red-500 focus:border-red-500" : ""}
                        />
                        {error && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Info section */}
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                            Lưu ý khi tham gia
                        </h4>
                        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>Phòng họp phải được tạo bởi người khác trước</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>ID phòng phải chính xác 100%</span>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isJoining}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isJoining || !roomId.trim()}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            {isJoining ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Đang kiểm tra...
                                </>
                            ) : (
                                <>
                                    <Link className="h-4 w-4 mr-2" />
                                    Tham gia ngay
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                {/* Additional help */}
                <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        💡 <strong>Mẹo:</strong> Chỉ có thể tham gia vào phòng đã được tạo và đang hoạt động. Hãy chắc chắn bạn có ID chính xác từ người tổ chức.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
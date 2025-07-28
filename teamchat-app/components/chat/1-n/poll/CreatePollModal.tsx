'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Poll } from './PollMessage';

interface CreatePollModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreatePoll: (poll: Omit<Poll, "id" | "createdAt" | "totalVoters">) => void;
    isDarkMode: boolean;
    currentUser: {
        id: string;
        name: string;
    };
}

export function CreatePollModal({
    isOpen,
    onClose,
    onCreatePoll,
    isDarkMode,
    currentUser,
}: CreatePollModalProps) {
    const [question, setQuestion] = useState("");
    const [description, setDescription] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [allowMultiple, setAllowMultiple] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [showResults, setShowResults] = useState<"always" | "after_vote" | "after_end">("after_vote");
    const [hasEndTime, setHasEndTime] = useState(false);
    const [endTime, setEndTime] = useState("");

    if (!isOpen) return null;

    const addOption = () => {
        if (options.length < 10) {
            setOptions([...options, ""]);
        }
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (question.trim() && options.every((opt) => opt.trim())) {
            const pollEndTime = hasEndTime && endTime ? new Date(endTime) : undefined;

            onCreatePoll({
                question: question.trim(),
                description: description.trim() || undefined,
                options: options.map((opt) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    text: opt.trim(),
                    votes: [],
                })),
                allowMultiple,
                isAnonymous,
                showResults,
                createdBy: currentUser.id,
                createdByName: currentUser.name,
                endTime: pollEndTime,
                isActive: true,
            });

            // Reset form
            setQuestion("");
            setDescription("");
            setOptions(["", ""]);
            setAllowMultiple(false);
            setIsAnonymous(false);
            setShowResults("after_vote");
            setHasEndTime(false);
            setEndTime("");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`w-full max-w-md mx-4 rounded-lg max-h-[90vh] overflow-hidden ${isDarkMode ? "bg-gray-800" : "bg-white"
                }`}>
                <div className={`p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <div className="flex justify-between items-center">
                        <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            Tạo cuộc bình chọn
                        </h3>
                        <Button onClick={onClose} variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="p-4 space-y-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-700"
                                }`}>
                                Câu hỏi bình chọn *
                            </label>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Nhập câu hỏi bình chọn..."
                                className={`w-full p-3 rounded-lg border ${isDarkMode
                                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                        : "bg-white border-gray-300 text-gray-900"
                                    }`}
                                required
                                maxLength={200}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-700"
                                }`}>
                                Mô tả (tùy chọn)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Thêm mô tả cho cuộc bình chọn..."
                                rows={2}
                                className={`w-full p-3 rounded-lg border resize-none ${isDarkMode
                                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                        : "bg-white border-gray-300 text-gray-900"
                                    }`}
                                maxLength={500}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-700"
                                }`}>
                                Tùy chọn *
                            </label>
                            <div className="space-y-2">
                                {options.map((option, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => updateOption(index, e.target.value)}
                                            placeholder={`Tùy chọn ${index + 1}`}
                                            className={`flex-1 p-2 rounded-lg border ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                                    : "bg-white border-gray-300 text-gray-900"
                                                }`}
                                            required
                                            maxLength={100}
                                        />
                                        {options.length > 2 && (
                                            <Button
                                                type="button"
                                                onClick={() => removeOption(index)}
                                                variant="ghost"
                                                size="sm"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {options.length < 10 && (
                                    <Button
                                        type="button"
                                        onClick={addOption}
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thêm tùy chọn
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                Cài đặt
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="allowMultiple"
                                        checked={allowMultiple}
                                        onChange={(e) => setAllowMultiple(e.target.checked)}
                                        className="rounded"
                                    />
                                    <label htmlFor="allowMultiple" className={`text-sm ${isDarkMode ? "text-white" : "text-gray-700"
                                        }`}>
                                        Cho phép chọn nhiều tùy chọn
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isAnonymous"
                                        checked={isAnonymous}
                                        onChange={(e) => setIsAnonymous(e.target.checked)}
                                        className="rounded"
                                    />
                                    <label htmlFor="isAnonymous" className={`text-sm ${isDarkMode ? "text-white" : "text-gray-700"
                                        }`}>
                                        Bình chọn ẩn danh
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="hasEndTime"
                                        checked={hasEndTime}
                                        onChange={(e) => setHasEndTime(e.target.checked)}
                                        className="rounded"
                                    />
                                    <label htmlFor="hasEndTime" className={`text-sm ${isDarkMode ? "text-white" : "text-gray-700"
                                        }`}>
                                        Đặt thời gian kết thúc
                                    </label>
                                </div>
                                {hasEndTime && (
                                    <input
                                        type="datetime-local"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        min={new Date().toISOString().slice(0, 16)}
                                        className={`w-full p-2 rounded-lg border ${isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-white border-gray-300 text-gray-900"
                                            }`}
                                    />
                                )}
                            </div>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-700"
                                }`}>
                                Hiển thị kết quả
                            </label>
                            <select
                                value={showResults}
                                onChange={(e) => setShowResults(e.target.value as any)}
                                className={`w-full p-2 rounded-lg border ${isDarkMode
                                        ? "bg-gray-700 border-gray-600 text-white"
                                        : "bg-white border-gray-300 text-gray-900"
                                    }`}
                            >
                                <option value="always">Luôn hiển thị</option>
                                <option value="after_vote">Sau khi bình chọn</option>
                                <option value="after_end">Sau khi kết thúc</option>
                            </select>
                        </div>
                    </div>

                    <div className={`p-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"} flex gap-2`}>
                        <Button type="button" onClick={onClose} variant="outline" className="flex-1">
                            Hủy
                        </Button>
                        <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600">
                            Tạo bình chọn
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
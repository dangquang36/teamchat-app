import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, BarChart2 } from "lucide-react";

interface PollCreatorProps {
    onClose: () => void;
    onCreatePoll: (pollData: { question: string; options: string[] }) => void;
    isDarkMode?: boolean;
}

export function PollCreator({ onClose, onCreatePoll, isDarkMode = false }: PollCreatorProps) {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState<string[]>(["", ""]);

    const handleAddOption = () => {
        setOptions([...options, ""]);
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleRemoveOption = (index: number) => {
        if (options.length <= 2) return; // Luôn giữ ít nhất 2 lựa chọn
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    };

    const handleSubmit = () => {
        // Validate inputs
        if (!question.trim()) {
            alert("Vui lòng nhập câu hỏi bình chọn");
            return;
        }

        const validOptions = options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
            alert("Vui lòng nhập ít nhất 2 lựa chọn");
            return;
        }

        onCreatePoll({
            question: question.trim(),
            options: validOptions
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 poll-creator-modal">
            <div
                className={`w-full max-w-md rounded-lg shadow-lg ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                    }`}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium flex items-center">
                        <BarChart2 className="h-5 w-5 mr-2 text-purple-500" />
                        Tạo bình chọn
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="rounded-full p-1 h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-4">
                    <div className="mb-4">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Nhập câu hỏi bình chọn..."
                            className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 poll-input ${isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                }`}
                        />
                    </div>

                    <div className="space-y-3 mb-4">
                        {options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2 poll-option-input">
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    placeholder={`Tùy chọn ${index + 1}`}
                                    className={`flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDarkMode
                                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                        }`}
                                />
                                {options.length > 2 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveOption(index)}
                                        className="rounded-full p-1 h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleAddOption}
                        className={`w-full flex items-center justify-center gap-2 py-2 mb-4 poll-add-option ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        <Plus className="h-4 w-4" />
                        Thêm tùy chọn
                    </Button>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className={isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : ""}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="bg-purple-500 hover:bg-purple-600 text-white"
                        >
                            Tạo bình chọn
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
import React from 'react';

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect }) => {
    return (
        <div className="absolute bottom-full mb-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full shadow-lg p-1 flex gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
                <button
                    key={emoji}
                    onClick={() => onSelect(emoji)}
                    className="text-xl p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};
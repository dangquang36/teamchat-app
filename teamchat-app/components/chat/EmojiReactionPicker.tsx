"use client";

import React, { useState, useCallback } from 'react';
import { Heart, Smile, ThumbsUp, ThumbsDown, Angry } from 'lucide-react';

interface EmojiReactionPickerProps {
    onReactionSelect: (emoji: string) => void;
    isDarkMode?: boolean;
    isVisible: boolean;
    position?: 'top' | 'bottom';
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    isMyMessage?: boolean;
}

// Danh sách emoji phổ biến như Zalo
const QUICK_EMOJIS = [
    { emoji: '👍', icon: ThumbsUp, name: 'Thích' },
    { emoji: '❤️', icon: Heart, name: 'Yêu thích' },
    { emoji: '😄', icon: Smile, name: 'Haha' },
    { emoji: '😮', icon: null, name: 'Wow' },
    { emoji: '😢', icon: null, name: 'Buồn' },
    { emoji: '😡', icon: Angry, name: 'Phẫn nộ' },
];

interface EmojiReactionButtonProps {
    onEmojiPickerToggle: () => void;
    isPickerVisible: boolean;
    onReactionSelect: (emoji: string) => void;
    isDarkMode?: boolean;
    isMyMessage?: boolean;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

export function EmojiReactionButton({
    onEmojiPickerToggle,
    isPickerVisible,
    onReactionSelect,
    isDarkMode = false,
    isMyMessage = false,
    onMouseEnter,
    onMouseLeave
}: EmojiReactionButtonProps) {
    return (
        <div
            className="relative"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Icon Like cố định với hiệu ứng cải thiện */}
            <button
                onClick={onEmojiPickerToggle}
                className={`emoji-button group relative p-1.5 rounded-full emoji-transition emoji-hover-effect hover:scale-110 active:scale-95 transform hover:shadow-lg ${isDarkMode
                    ? 'bg-gray-700/80 text-gray-400 hover:bg-gray-600 hover:text-white shadow-gray-500/20'
                    : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 shadow-gray-500/20'
                    }`}
                title="Thả cảm xúc"
                aria-label="Mở emoji picker để thả cảm xúc"
            >
                {/* Ripple effect */}
                <span className="absolute inset-0 rounded-full bg-current opacity-0 group-hover:opacity-10 group-active:opacity-20 emoji-transition"></span>

                {/* Icon with enhanced animations */}
                <ThumbsUp className="relative h-4 w-4 group-hover:emoji-bounce group-active:emoji-pulse" />

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-5 emoji-transition"></div>

                {/* Click ripple effect */}
                <span className="absolute inset-0 rounded-full bg-current opacity-0 group-active:emoji-ripple pointer-events-none"></span>
            </button>

            {/* Emoji Picker với hiệu ứng cải thiện */}
            {isPickerVisible && (
                <div
                    className={`absolute bottom-full mb-2 ${isMyMessage ? 'right-0' : 'left-0'} z-50 flex items-center gap-1.5 px-4 py-3 rounded-full shadow-2xl border backdrop-blur-md animate-in fade-in zoom-in duration-300 ease-out emoji-fade-in ${isDarkMode
                        ? 'bg-gray-800/95 border-gray-600/50 shadow-gray-900/50'
                        : 'bg-white/95 border-gray-200/50 shadow-gray-900/20'
                        }`}
                >
                    {QUICK_EMOJIS.map((item, index) => (
                        <button
                            key={item.name}
                            onClick={() => onReactionSelect(item.emoji)}
                            className={`emoji-button group relative p-2.5 rounded-full emoji-transition emoji-hover-effect hover:scale-125 active:scale-95 hover:bg-opacity-20 transform hover:shadow-lg ${isDarkMode
                                ? 'hover:bg-white/20 text-gray-300 hover:text-white'
                                : 'hover:bg-gray-900/10 text-gray-600 hover:text-gray-800'
                                }`}
                            title={item.name}
                            aria-label={`React với ${item.emoji} (${item.name})`}
                            style={{
                                animationDelay: `${index * 50}ms`
                            }}
                        >
                            {/* Ripple effect */}
                            <span className="absolute inset-0 rounded-full bg-current opacity-0 group-hover:opacity-10 group-active:opacity-20 emoji-transition"></span>

                            {/* Emoji with enhanced animations */}
                            <span className="relative text-xl group-hover:emoji-bounce group-active:emoji-pulse">
                                {item.emoji}
                            </span>

                            {/* Hover glow effect */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-5 emoji-transition"></div>

                            {/* Click ripple effect */}
                            <span className="absolute inset-0 rounded-full bg-current opacity-0 group-active:emoji-ripple pointer-events-none"></span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export function EmojiReactionPicker({
    onReactionSelect,
    isDarkMode = false,
    isVisible,
    position = 'top',
    onMouseEnter,
    onMouseLeave,
    isMyMessage = false
}: EmojiReactionPickerProps) {
    if (!isVisible) return null;

    const positionClasses = position === 'top'
        ? 'bottom-full mb-2'
        : 'top-full mt-2';

    return (
        <div
            className={`absolute ${positionClasses} ${isMyMessage ? 'right-0' : 'left-0'} z-50 flex items-center gap-1.5 px-4 py-3 rounded-full shadow-2xl border backdrop-blur-md animate-in fade-in zoom-in duration-300 ease-out emoji-fade-in ${isDarkMode
                ? 'bg-gray-800/95 border-gray-600/50 shadow-gray-900/50'
                : 'bg-white/95 border-gray-200/50 shadow-gray-900/20'
                }`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {QUICK_EMOJIS.map((item, index) => (
                <button
                    key={item.name}
                    onClick={() => onReactionSelect(item.emoji)}
                    className={`emoji-button group relative p-2.5 rounded-full emoji-transition emoji-hover-effect hover:scale-125 active:scale-95 hover:bg-opacity-20 transform hover:shadow-lg ${isDarkMode
                        ? 'hover:bg-white/20 text-gray-300 hover:text-white'
                        : 'hover:bg-gray-900/10 text-gray-600 hover:text-gray-800'
                        }`}
                    title={item.name}
                    aria-label={`React với ${item.emoji} (${item.name})`}
                    style={{
                        animationDelay: `${index * 50}ms`
                    }}
                >
                    {/* Ripple effect */}
                    <span className="absolute inset-0 rounded-full bg-current opacity-0 group-hover:opacity-10 group-active:opacity-20 emoji-transition"></span>

                    {/* Emoji with enhanced animations */}
                    <span className="relative text-xl group-hover:emoji-bounce group-active:emoji-pulse">
                        {item.emoji}
                    </span>

                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-5 emoji-transition"></div>

                    {/* Click ripple effect */}
                    <span className="absolute inset-0 rounded-full bg-current opacity-0 group-active:emoji-ripple pointer-events-none"></span>
                </button>
            ))}
        </div>
    );
}

interface EmojiReactionsDisplayProps {
    reactions: Array<{ emoji: string; user: string; }>;
    currentUserId: string;
    onReactionClick?: (emoji: string) => void;
    isDarkMode?: boolean;
}

export function EmojiReactionsDisplay({
    reactions,
    currentUserId,
    onReactionClick,
    isDarkMode = false
}: EmojiReactionsDisplayProps) {
    const [clickedEmoji, setClickedEmoji] = useState<string | null>(null);

    if (!reactions || reactions.length === 0) return null;

    // Nhóm reactions theo emoji
    const groupedReactions = reactions.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
            acc[reaction.emoji] = [];
        }
        acc[reaction.emoji].push(reaction.user);
        return acc;
    }, {} as Record<string, string[]>);

    const handleEmojiClick = useCallback((emoji: string) => {
        setClickedEmoji(emoji);
        onReactionClick?.(emoji);

        // Reset animation state after animation completes
        setTimeout(() => {
            setClickedEmoji(null);
        }, 600);
    }, [onReactionClick]);

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(groupedReactions).map(([emoji, users]) => {
                const hasCurrentUser = users.includes(currentUserId);
                const count = users.length;
                const isClicked = clickedEmoji === emoji;

                return (
                    <button
                        key={emoji}
                        onClick={() => handleEmojiClick(emoji)}
                        className={`emoji-button group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium emoji-transition emoji-hover-effect hover:scale-105 active:scale-95 transform hover:shadow-md ${hasCurrentUser
                            ? isDarkMode
                                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/50 hover:bg-blue-600/30 hover:border-blue-400'
                                : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                            : isDarkMode
                                ? 'bg-gray-700/60 text-gray-300 border border-gray-600/60 hover:bg-gray-600/60 hover:border-gray-500'
                                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                            } ${isClicked ? 'emoji-scale-in' : ''}`}
                        title={`${users.length} người đã react với ${emoji}`}
                        aria-label={`React với ${emoji} (${users.length} người đã react)`}
                    >
                        {/* Ripple effect */}
                        <span className="absolute inset-0 rounded-full bg-current opacity-0 group-hover:opacity-10 group-active:opacity-20 emoji-transition"></span>

                        {/* Emoji with enhanced animations */}
                        <span className={`relative text-sm group-hover:emoji-bounce group-active:emoji-pulse ${isClicked ? 'emoji-bounce' : ''}`}>
                            {emoji}
                        </span>

                        {/* Count with fade-in animation - Always show count */}
                        <span className={`relative text-xs font-medium leading-none group-hover:emoji-pulse ${isClicked ? 'emoji-pulse' : ''}`}>
                            {count}
                        </span>

                        {/* Hover glow effect */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-5 emoji-transition"></div>

                        {/* Click ripple effect */}
                        <span className={`absolute inset-0 rounded-full bg-current opacity-0 group-active:emoji-ripple pointer-events-none ${isClicked ? 'emoji-ripple' : ''}`}></span>
                    </button>
                );
            })}
        </div>
    );
}
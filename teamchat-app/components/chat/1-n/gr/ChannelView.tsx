"use client";

import { useState } from "react";
import { ChannelInput } from "./ChannelInput";
import { ChannelHeader } from "@/components/chat/1-n/gr/ChannelHeader";
import { MessageList } from "@/components/chat/messages/MessageList";
import { CreatePollModal } from "@/components/chat/1-n/poll/CreatePollModal";
import { PollResultsModal } from "@/components/chat/1-n/poll/PollResultsModal";
import { UserProfileModal } from "@/components/UserProfileModal";
import { Poll } from "@/components/chat/1-n/poll/PollMessage";
import { Message, UserProfile } from "@/components/chat/messages/MessageItem";

// Mock data
const otherUser: UserProfile = {
    id: "user-123",
    name: "Victoria Lane",
    avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
};

const currentUser: UserProfile = {
    id: "user-current",
    name: "Bạn",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
};

interface ChannelViewProps {
    channel: {
        id: string;
        name: string;
        members: number;
    };
    isDarkMode?: boolean;
    onToggleDetails: () => void;
}

export function ChannelView({ channel, isDarkMode = false, onToggleDetails }: ChannelViewProps) {
    // States
    const [isCallingVideo, setIsCallingVideo] = useState(false);
    const [audioCallMode, setAudioCallMode] = useState<"none" | "outgoing" | "incoming">("none");
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [viewedUser, setViewedUser] = useState<UserProfile | null>(null);
    const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
    const [pollResultsModal, setPollResultsModal] = useState<{ isOpen: boolean; poll: Poll | null }>({
        isOpen: false,
        poll: null,
    });
    const [messages, setMessages] = useState<Message[]>([]);

    // Handlers
    const generateAutoReply = (userMessage: string): string => {
        return `Đã nhận được tin nhắn: "${userMessage}". Bạn khỏe không?`;
    };

    const handleCreatePoll = (pollData: Omit<Poll, "id" | "createdAt" | "totalVoters">) => {
        const poll: Poll = {
            ...pollData,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            totalVoters: 0,
        };

        const pollMessage: Message = {
            id: Date.now(),
            sender: currentUser,
            poll: poll,
            timestamp: new Date(),
        };

        setMessages((prevMessages) => [...prevMessages, pollMessage]);
    };

    const handleVote = (pollId: string, optionId: string) => {
        setMessages((prevMessages) =>
            prevMessages.map((message) => {
                if (message.poll?.id === pollId) {
                    const poll = message.poll;
                    let updatedOptions = [...poll.options];
                    let totalVoters = poll.totalVoters;

                    const targetOption = updatedOptions.find((opt) => opt.id === optionId);
                    const hasVotedThisOption = targetOption?.votes.some((vote) => vote.userId === currentUser.id);
                    const hasVotedAnyOption = updatedOptions.some((opt) =>
                        opt.votes.some((vote) => vote.userId === currentUser.id)
                    );

                    if (hasVotedThisOption) {
                        updatedOptions = updatedOptions.map((option) => {
                            if (option.id === optionId) {
                                return {
                                    ...option,
                                    votes: option.votes.filter((vote) => vote.userId !== currentUser.id),
                                };
                            }
                            return option;
                        });
                        if (!hasVotedAnyOption) {
                            totalVoters = Math.max(0, totalVoters - 1);
                        }
                    } else {
                        if (!poll.allowMultiple && hasVotedAnyOption) {
                            updatedOptions = updatedOptions.map((option) => ({
                                ...option,
                                votes: option.votes.filter((vote) => vote.userId !== currentUser.id),
                            }));
                        } else if (!hasVotedAnyOption) {
                            totalVoters += 1;
                        }

                        updatedOptions = updatedOptions.map((option) => {
                            if (option.id === optionId) {
                                return {
                                    ...option,
                                    votes: [
                                        ...option.votes,
                                        {
                                            userId: currentUser.id,
                                            userName: currentUser.name,
                                            userAvatar: currentUser.avatarUrl,
                                            votedAt: new Date(),
                                        },
                                    ],
                                };
                            }
                            return option;
                        });
                    }

                    return {
                        ...message,
                        poll: {
                            ...poll,
                            options: updatedOptions,
                            totalVoters,
                        },
                    };
                }
                return message;
            })
        );
    };

    const handleViewResults = (poll: Poll) => {
        setPollResultsModal({ isOpen: true, poll });
    };

    const handleSendMessage = (data: { text: string; files: File[] }) => {
        const { text, files } = data;
        if (!text.trim() && files.length === 0) return;

        const newMessage: Message = {
            id: Date.now(),
            sender: currentUser,
            text: text,
            files: files.map((file) => ({ name: file.name, size: file.size })),
            timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        if (text.trim()) {
            setTimeout(() => {
                const autoReply: Message = {
                    id: Date.now() + 1,
                    sender: otherUser,
                    text: generateAutoReply(text),
                    timestamp: new Date(),
                };
                setMessages((prevMessages) => [...prevMessages, autoReply]);
            }, 1000);
        }
    };

    const handleViewProfile = (user: UserProfile) => {
        setViewedUser(user);
        setProfileModalOpen(true);
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            <ChannelHeader
                channel={channel}
                isDarkMode={isDarkMode}
                onToggleDetails={onToggleDetails}
                onAudioCall={() => setAudioCallMode("outgoing")}
                onVideoCall={() => setIsCallingVideo(true)}
            />

            <MessageList
                messages={messages}
                currentUserId={currentUser.id}
                channelName={channel.name}
                isDarkMode={isDarkMode}
                onViewProfile={handleViewProfile}
                onVote={handleVote}
                onViewResults={handleViewResults}
            />

            <ChannelInput
                channelName={channel.name}
                onSendMessage={handleSendMessage}
                isDarkMode={isDarkMode}
                isChannel={true}
                onCreatePoll={() => setIsCreatePollModalOpen(true)}
            />

            {/* Modals */}
            {isProfileModalOpen && viewedUser && (
                <UserProfileModal
                    user={viewedUser}
                    onClose={() => setProfileModalOpen(false)}
                    isDarkMode={isDarkMode}
                />
            )}

            <CreatePollModal
                isOpen={isCreatePollModalOpen}
                onClose={() => setIsCreatePollModalOpen(false)}
                onCreatePoll={handleCreatePoll}
                isDarkMode={isDarkMode}
                currentUser={currentUser}
            />

            {pollResultsModal.poll && (
                <PollResultsModal
                    poll={pollResultsModal.poll}
                    isOpen={pollResultsModal.isOpen}
                    onClose={() => setPollResultsModal({ isOpen: false, poll: null })}
                    isDarkMode={isDarkMode}
                />
            )}
        </div>
    );
}
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useChannels } from '@/contexts/ChannelContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Search, UserPlus, X, Loader2 } from 'lucide-react';
import { UserService } from '@/services/userService';

interface User {
    id: string;
    name: string;
    username: string;
    avatar?: string;
}

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    channelId: string;
    channelName: string;
}

export function InviteMemberModal({ isOpen, onClose, channelId, channelName }: InviteMemberModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [invitingUsers, setInvitingUsers] = useState<Set<string>>(new Set());
    const { toast } = useToast();
    const { inviteMemberToChannel } = useChannels();
    const currentUser = useCurrentUser();

    // Test MockAPI when component mounts
    useEffect(() => {
        if (isOpen) {
            console.log('InviteMemberModal opened, testing MockAPI...');
            UserService.testConnection()
                .then(result => {
                    if (result.success) {
                        console.log('MockAPI test successful:', result.data);
                    } else {
                        console.error('MockAPI test failed:', result.error);
                    }
                })
                .catch(error => {
                    console.error('MockAPI test error:', error);
                });
        }
    }, [isOpen]);

    // Search users using UserService
    const searchUsers = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            console.log('Searching users with query:', query);

            const result = await UserService.searchUsers(query, currentUser?.id);

            if (result.success) {
                console.log('Search results:', result.data);
                setSearchResults(result.data);
            } else {
                console.error('User search failed:', result.error);
                toast({
                    title: "Lỗi",
                    description: result.error || "Không thể tìm kiếm người dùng",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error searching users:', error);
            toast({
                title: "Lỗi",
                description: "Không thể tìm kiếm người dùng",
                variant: "destructive"
            });
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchUsers(searchQuery);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleInviteUser = async (user: User) => {
        if (!currentUser) {
            console.error('Current user is null');
            toast({
                title: "Lỗi",
                description: "Không thể xác định người dùng hiện tại",
                variant: "destructive"
            });
            return;
        }

        console.log('Inviting user:', {
            user,
            currentUser,
            channelId,
            channelName
        });

        setInvitingUsers(prev => new Set(prev).add(user.id));

        try {
            const result = await inviteMemberToChannel(
                channelId,
                user.id,
                user.name,
                currentUser.id,
                currentUser.name,
                currentUser.avatar
            );

            console.log('Invite result:', result);

            if (result.success) {
                toast({
                    title: "Thành công!",
                    description: `Đã mời ${user.name} vào kênh "${channelName}"`,
                });
                // Remove from search results
                setSearchResults(prev => prev.filter(u => u.id !== user.id));
            } else {
                toast({
                    title: "Lỗi",
                    description: result.error || "Không thể mời người dùng",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error inviting user:', error);
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi mời người dùng",
                variant: "destructive"
            });
        } finally {
            setInvitingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(user.id);
                return newSet;
            });
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Mời thành viên
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Kênh: {channelName}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Search Input */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Tìm kiếm người dùng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Search Results */}
                <div className="max-h-96 overflow-y-auto">
                    {isSearching ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600 dark:text-gray-400">Đang tìm kiếm...</span>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="p-4 space-y-3">
                            {searchResults.map((user) => (
                                <Card key={user.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                                                        {getInitials(user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        @{user.username}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => handleInviteUser(user)}
                                                disabled={invitingUsers.has(user.id)}
                                                className="flex items-center space-x-2"
                                            >
                                                {invitingUsers.has(user.id) ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        <span>Đang mời...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="h-4 w-4" />
                                                        <span>Mời</span>
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : searchQuery ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                Không tìm thấy người dùng nào
                            </p>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                Nhập tên người dùng để tìm kiếm
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <Button onClick={onClose} className="w-full">
                        Đóng
                    </Button>
                </div>
            </div>
        </div>
    );
} 
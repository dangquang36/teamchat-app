'use client';

import { useState, useRef } from 'react';
// Removed framer-motion - using CSS transitions only
import {
    X,
    Camera,
    Edit3,
    FileText,
    Users,
    UserMinus,
    MessageSquare,
    Settings,
    Image as ImageIcon,
    Save,
    Crown,
    ShieldCheck,
    MoreVertical,
    Trash2,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChannelSettingsMenuProps {
    isOpen: boolean;
    onClose: () => void;
    channel: {
        id: string;
        name: string;
        description?: string;
        image?: string;
        members: Array<{
            id: string;
            name: string;
            avatar?: string;
            role: 'owner' | 'admin' | 'member';
            status: 'online' | 'offline' | 'away';
        }>;
    };
    currentUser: {
        id: string;
        name: string;
        avatar?: string;
    };
    onUpdateChannel: (updates: Partial<{ name: string; description: string; image: string }>) => void;
    onRemoveMember: (memberId: string) => void;
    onNavigateToPosts: () => void;
}

export function ChannelSettingsMenu({
    isOpen,
    onClose,
    channel,
    currentUser,
    onUpdateChannel,
    onRemoveMember,
    onNavigateToPosts
}: ChannelSettingsMenuProps) {
    const [activeTab, setActiveTab] = useState<'general' | 'members'>('general');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: channel.name,
        description: channel.description || '',
        image: channel.image || ''
    });
    const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleSave = () => {
        onUpdateChannel(editForm);
        setIsEditing(false);
        toast({
            title: "Đã cập nhật kênh",
            description: "Thông tin kênh đã được cập nhật thành công"
        });
    };

    const handleCancel = () => {
        setEditForm({
            name: channel.name,
            description: channel.description || '',
            image: channel.image || ''
        });
        setIsEditing(false);
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setEditForm(prev => ({
                    ...prev,
                    image: e.target?.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveMember = (memberId: string) => {
        onRemoveMember(memberId);
        setMemberToRemove(null);
        toast({
            title: "Đã xóa thành viên",
            description: "Thành viên đã được xóa khỏi kênh"
        });
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner':
                return <Crown className="w-4 h-4 text-yellow-500" />;
            case 'admin':
                return <ShieldCheck className="w-4 h-4 text-blue-500" />;
            default:
                return null;
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'owner':
                return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 text-xs">Chủ kênh</Badge>;
            case 'admin':
                return <Badge variant="secondary" className="bg-blue-500/20 text-blue-600 text-xs">Quản trị</Badge>;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online':
                return 'bg-green-500';
            case 'away':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-400';
        }
    };

    const canManageMembers = channel.members.find(m => m.id === currentUser.id)?.role === 'owner' ||
        channel.members.find(m => m.id === currentUser.id)?.role === 'admin';

    return (
        <>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
                        onClick={onClose}
                    />

                    {/* Settings Panel */}
                    <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden animate-in slide-in-from-right duration-300">
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                                        <Settings className="w-5 h-5 mr-2" />
                                        Cài đặt kênh
                                    </h2>
                                    <Button variant="ghost" size="icon" onClick={onClose}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                {/* Channel Info */}
                                <div className="flex items-center space-x-3">
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src={editForm.image} alt={channel.name} />
                                        <AvatarFallback className="bg-blue-600 text-white">
                                            {channel.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">{channel.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {channel.members.length} thành viên
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Tab Navigation */}
                            <div className="border-b border-gray-200 dark:border-gray-700">
                                <nav className="flex">
                                    <button
                                        onClick={() => setActiveTab('general')}
                                        className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        <Settings className="w-4 h-4 inline mr-2" />
                                        Tổng quan
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('members')}
                                        className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'members'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        <Users className="w-4 h-4 inline mr-2" />
                                        Thành viên
                                    </button>
                                </nav>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto">
                                {activeTab === 'general' && (
                                    <div
                                        key="general"
                                        className="p-6 space-y-6 animate-in slide-in-from-bottom-1 duration-200"
                                    >
                                        {/* Channel Image */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg flex items-center">
                                                    <Camera className="w-4 h-4 mr-2" />
                                                    Ảnh kênh
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center space-x-4">
                                                    <Avatar className="w-16 h-16">
                                                        <AvatarImage src={editForm.image} alt={channel.name} />
                                                        <AvatarFallback className="bg-blue-600 text-white text-lg">
                                                            {editForm.name.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                            className="hidden"
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            disabled={!isEditing}
                                                            className="w-full"
                                                        >
                                                            <ImageIcon className="w-4 h-4 mr-2" />
                                                            Thay đổi ảnh
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Channel Name */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg flex items-center">
                                                    <Edit3 className="w-4 h-4 mr-2" />
                                                    Tên kênh
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <Input
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                    disabled={!isEditing}
                                                    placeholder="Nhập tên kênh..."
                                                    className="w-full"
                                                />
                                            </CardContent>
                                        </Card>

                                        {/* Channel Description */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg flex items-center">
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    Mô tả kênh
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <Textarea
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                                    disabled={!isEditing}
                                                    placeholder="Nhập mô tả kênh..."
                                                    rows={3}
                                                    className="w-full resize-none"
                                                />
                                            </CardContent>
                                        </Card>

                                        {/* Action Buttons */}
                                        <div className="space-y-3">
                                            {!isEditing ? (
                                                <Button
                                                    onClick={() => setIsEditing(true)}
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    <Edit3 className="w-4 h-4 mr-2" />
                                                    Chỉnh sửa thông tin
                                                </Button>
                                            ) : (
                                                <div className="flex space-x-2">
                                                    <Button
                                                        onClick={handleSave}
                                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Lưu
                                                    </Button>
                                                    <Button
                                                        onClick={handleCancel}
                                                        variant="outline"
                                                        className="flex-1"
                                                    >
                                                        Hủy
                                                    </Button>
                                                </div>
                                            )}

                                            <Button
                                                onClick={onNavigateToPosts}
                                                variant="outline"
                                                className="w-full border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20"
                                            >
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                Chuyển đến Bài đăng
                                                <ExternalLink className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'members' && (
                                    <div
                                        key="members"
                                        className="p-6 animate-in slide-in-from-bottom-1 duration-200"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    Thành viên ({channel.members.length})
                                                </h3>
                                            </div>

                                            <div className="space-y-3">
                                                {channel.members.map((member) => (
                                                    <div
                                                        key={member.id}
                                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors animate-in zoom-in duration-200"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="relative">
                                                                <Avatar className="w-10 h-10">
                                                                    <AvatarImage src={member.avatar} alt={member.name} />
                                                                    <AvatarFallback className="bg-blue-600 text-white">
                                                                        {member.name.charAt(0).toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(member.status)}`} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2">
                                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                                        {member.name}
                                                                    </p>
                                                                    {getRoleIcon(member.role)}
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {member.status === 'online' ? 'Đang hoạt động' :
                                                                            member.status === 'away' ? 'Vắng mặt' : 'Ngoại tuyến'}
                                                                    </p>
                                                                    {getRoleBadge(member.role)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {canManageMembers && member.id !== currentUser.id && member.role !== 'owner' && (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                        <MoreVertical className="w-4 h-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        onClick={() => setMemberToRemove(member.id)}
                                                                        className="text-red-600 dark:text-red-400"
                                                                    >
                                                                        <UserMinus className="w-4 h-4 mr-2" />
                                                                        Xóa khỏi kênh
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                    {/* Remove Member Confirmation Dialog */}
                    <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa thành viên</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bạn có chắc chắn muốn xóa thành viên này khỏi kênh? Họ sẽ không thể truy cập kênh này nữa.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => memberToRemove && handleRemoveMember(memberToRemove)}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Xóa thành viên
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )}
        </>
    );
}
'use client';

import { Users, X, Mic, MicOff, Video, VideoOff, Crown, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LocalParticipant, RemoteParticipant, Track } from 'livekit-client';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface ParticipantsListProps {
    localParticipant: LocalParticipant | null;
    remoteParticipants: RemoteParticipant[];
    currentUser: any;
    onClose: () => void;
}

export default function ParticipantsList({
    localParticipant,
    remoteParticipants,
    currentUser,
    onClose
}: ParticipantsListProps) {
    const totalParticipants = 1 + remoteParticipants.length;

    const getParticipantInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const ParticipantItem = ({
        participant,
        name,
        isLocal = false
    }: {
        participant: LocalParticipant | RemoteParticipant;
        name: string;
        isLocal?: boolean;
    }) => {
        const isMicEnabled = isLocal
            ? (participant as LocalParticipant).isMicrophoneEnabled
            : !participant.getTrackPublication(Track.Source.Microphone)?.isMuted;

        const isCameraEnabled = isLocal
            ? (participant as LocalParticipant).isCameraEnabled
            : !participant.getTrackPublication(Track.Source.Camera)?.isMuted;

        return (
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-700/50 rounded-lg transition-colors">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={isLocal ? currentUser?.avatar : undefined} />
                    <AvatarFallback className="bg-blue-500 text-white text-sm">
                        {getParticipantInitials(name)}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <p className="text-white font-medium truncate">
                            {name}
                        </p>
                        {isLocal && <Crown className="h-4 w-4 text-yellow-500" />}
                        {isLocal && (
                            <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400">
                                Bạn
                            </Badge>
                        )}
                    </div>
                    <p className="text-gray-400 text-sm">
                        {isLocal ? 'Chủ phòng' : 'Thành viên'}
                    </p>
                </div>

                <div className="flex items-center space-x-1">
                    {/* Microphone Status */}
                    <div className={`p-1.5 rounded ${isMicEnabled ? 'bg-green-500' : 'bg-red-500'}`}>
                        {isMicEnabled ? (
                            <Mic className="h-3 w-3 text-white" />
                        ) : (
                            <MicOff className="h-3 w-3 text-white" />
                        )}
                    </div>

                    {/* Camera Status */}
                    <div className={`p-1.5 rounded ${isCameraEnabled ? 'bg-green-500' : 'bg-red-500'}`}>
                        {isCameraEnabled ? (
                            <Video className="h-3 w-3 text-white" />
                        ) : (
                            <VideoOff className="h-3 w-3 text-white" />
                        )}
                    </div>

                    {/* More Options */}
                    {!isLocal && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-auto text-gray-400 hover:text-white"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    Ghim video
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    Tắt tiếng
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                    Mời rời phòng
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    <h3 className="text-white font-semibold">Người tham gia</h3>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                        {totalParticipants}
                    </Badge>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-gray-400 hover:text-white p-1"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Participants List */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                    {/* Local Participant */}
                    {localParticipant && (
                        <ParticipantItem
                            participant={localParticipant}
                            name={currentUser?.name || 'Bạn'}
                            isLocal={true}
                        />
                    )}

                    {/* Remote Participants */}
                    {remoteParticipants.map((participant) => (
                        <ParticipantItem
                            key={participant.identity}
                            participant={participant}
                            name={participant.name || 'Người dùng'}
                            isLocal={false}
                        />
                    ))}

                    {/* Empty State */}
                    {remoteParticipants.length === 0 && (
                        <div className="text-center text-gray-400 py-8">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Chỉ có bạn trong phòng</p>
                            <p className="text-sm">Mời người khác tham gia!</p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Actions */}
            <div className="p-4 border-t border-slate-700 space-y-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Mời người tham gia
                </Button>
                <Button variant="outline" className="w-full border-slate-600 text-gray-300 hover:bg-slate-700">
                    Sao chép liên kết
                </Button>
            </div>
        </div>
    );
}
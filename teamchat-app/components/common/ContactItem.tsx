import React from 'react';
import { Video, Phone } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';

interface ContactItemProps {
    contact: {
        id: string;
        name: string;
        username: string;
        avatar: string;
        message?: string;
        online?: boolean;
    };
    onClick?: () => void;
    isDarkMode?: boolean;
    showCallButtons?: boolean;
}

const ContactItem: React.FC<ContactItemProps> = ({
    contact,
    onClick,
    isDarkMode = false,
    showCallButtons = false
}) => {
    const { initiateCall, callStatus } = useSocket();

    const handleVideoCall = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering contact click
        console.log('Initiating video call to:', contact.name, contact.id);
        initiateCall(contact.id, contact.name);
    };

    const handleAudioCall = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering contact click
        console.log('Initiating audio call to:', contact.name, contact.id);
        initiateCall(contact.id, contact.name);
    };

    const isCallDisabled = callStatus !== 'idle';

    return (
        <div
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors group ${isDarkMode
                ? "hover:bg-gray-700"
                : "hover:bg-gray-100"
                }`}
            onClick={onClick}
        >
            {/* Avatar */}
            <div className="relative">
                <img
                    src={contact.avatar || `https://i.pravatar.cc/150?u=${contact.username}`}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full object-cover"
                />
                {/* Online status */}
                {contact.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                )}
            </div>

            {/* Contact Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-medium truncate ${isDarkMode ? "text-white" : "text-gray-900"
                        }`}>
                        {contact.name}
                    </h3>
                    <span className={`text-xs ${contact.online
                        ? "text-green-500"
                        : (isDarkMode ? "text-gray-400" : "text-gray-500")
                        }`}>
                        {contact.online ? "Online" : "Offline"}
                    </span>
                </div>
                <p className={`text-sm truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                    {contact.message || `@${contact.username}`}
                </p>
            </div>

            {/* Call Buttons - Show on hover or when showCallButtons is true */}
            {showCallButtons && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {/* Audio Call Button */}
                    <button
                        onClick={handleAudioCall}
                        disabled={isCallDisabled}
                        className={`p-2 rounded-full transition-colors ${isCallDisabled
                            ? "bg-gray-300 cursor-not-allowed opacity-50"
                            : (isDarkMode
                                ? "bg-gray-600 hover:bg-gray-500 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            )
                            }`}
                        title="Gọi thoại"
                    >
                        <Phone className="w-4 h-4" />
                    </button>

                    {/* Video Call Button */}
                    <button
                        onClick={handleVideoCall}
                        disabled={isCallDisabled}
                        className={`p-2 rounded-full transition-colors ${isCallDisabled
                            ? "bg-gray-300 cursor-not-allowed opacity-50"
                            : "bg-green-500 hover:bg-green-600 text-white"
                            }`}
                        title="Gọi video"
                    >
                        <Video className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ContactItem;
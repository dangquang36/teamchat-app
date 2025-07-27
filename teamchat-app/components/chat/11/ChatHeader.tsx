import React from "react";
import { Button } from "@/components/ui/button";
import { Phone, Video, Info, ChevronDown } from "lucide-react";
import { DirectMessage } from "@/app/types";
import { motion } from "framer-motion";

export interface ChatHeaderProps {
    user: DirectMessage;
    onAudioCall: () => void;
    onVideoCall: () => void;
    onViewProfile: () => void;
    isDetailsOpen: boolean;
    onToggleDetails: () => void;
    isDarkMode?: boolean;
    callStatus?: 'idle' | 'calling' | 'ringing' | 'connected' | 'rejected' | 'ended' | 'connecting' | 'timeout' | 'busy' | 'unavailable';
    isInCall?: boolean;
}

export function ChatHeader({
    user,
    onAudioCall,
    onVideoCall,
    onViewProfile,
    isDetailsOpen,
    onToggleDetails,
    isDarkMode = false,
    callStatus = 'idle',
    isInCall = false,
}: ChatHeaderProps) {

    // Kiểm tra xem có thể thực hiện cuộc gọi không
    const canMakeCall = callStatus === 'idle' && !isInCall;

    return (
        <motion.div
            layout
            className={`flex items-center justify-between p-4 border-b transition-all duration-300 backdrop-blur-sm ${isDarkMode
                ? "bg-gray-800/95 border-gray-700/50"
                : "bg-white/95 border-gray-200"
                }`}
        >
            {/* User Info Section */}
            <motion.button
                className="flex items-center text-left group"
                onClick={onViewProfile}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <div className="relative mr-4">
                    <motion.img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full border-2 border-transparent group-hover:border-blue-500/30 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                    />
                    {user.online && (
                        <motion.div
                            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                            <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
                        </motion.div>
                    )}
                </div>
                <div>
                    <h3 className={`font-bold text-lg group-hover:text-blue-500 transition-colors duration-200 ${isDarkMode ? "text-white" : "text-gray-900"
                        }`}>
                        {user.name}
                    </h3>
                    <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${user.online ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                        <p className={`text-sm font-medium ${user.online
                            ? 'text-green-500'
                            : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                            {user.online ? "Đang hoạt động" : "Ngoại tuyến"}
                        </p>
                    </div>
                </div>
            </motion.button>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
                {/* Audio Call Button */}
                <motion.div
                    whileHover={canMakeCall ? { scale: 1.1 } : {}}
                    whileTap={canMakeCall ? { scale: 0.9 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onAudioCall}
                        disabled={!canMakeCall}
                        className={`relative rounded-full h-10 w-10 transition-all duration-300 group border ${!canMakeCall
                            ? 'opacity-50 cursor-not-allowed border-transparent'
                            : isDarkMode
                                ? "text-gray-300 hover:text-white hover:bg-green-600/20 hover:border-green-500/30 border-transparent"
                                : "text-gray-600 hover:text-green-600 hover:bg-green-50 hover:border-green-200 border-transparent"
                            }`}
                        title={canMakeCall ? "Gọi thoại" : "Không thể gọi"}
                    >
                        <Phone className={`h-5 w-5 transition-transform duration-200 ${canMakeCall ? 'group-hover:scale-110' : ''}`} />
                        {canMakeCall && (
                            <div className="absolute inset-0 rounded-full bg-green-500/10 scale-0 group-hover:scale-100 transition-transform duration-300" />
                        )}

                        {/* Audio call indicator */}
                        {callStatus === 'calling' || (isInCall && callStatus === 'connected') ? (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse">
                                <div className="w-full h-full bg-orange-400 rounded-full animate-ping" />
                            </div>
                        ) : null}
                    </Button>
                </motion.div>

                {/* Video Call Button */}
                <motion.div
                    whileHover={canMakeCall ? { scale: 1.1 } : {}}
                    whileTap={canMakeCall ? { scale: 0.9 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onVideoCall}
                        disabled={!canMakeCall}
                        className={`relative rounded-full h-10 w-10 transition-all duration-300 group border ${!canMakeCall
                            ? 'opacity-50 cursor-not-allowed border-transparent'
                            : isDarkMode
                                ? "text-gray-300 hover:text-white hover:bg-blue-600/20 hover:border-blue-500/30 border-transparent"
                                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 border-transparent"
                            }`}
                        title={canMakeCall ? "Gọi video" : "Không thể gọi"}
                    >
                        <Video className={`h-5 w-5 transition-transform duration-200 ${canMakeCall ? 'group-hover:scale-110' : ''}`} />
                        {canMakeCall && (
                            <div className="absolute inset-0 rounded-full bg-blue-500/10 scale-0 group-hover:scale-100 transition-transform duration-300" />
                        )}

                        {/* Video call indicator */}
                        {callStatus === 'calling' || (isInCall && callStatus === 'connected') ? (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse">
                                <div className="w-full h-full bg-blue-400 rounded-full animate-ping" />
                            </div>
                        ) : null}
                    </Button>
                </motion.div>

                {/* Details Toggle Button */}
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleDetails}
                        className={`relative rounded-full h-10 w-10 transition-all duration-300 group border ${isDetailsOpen
                            ? (isDarkMode
                                ? 'bg-purple-600/20 text-purple-300 border-purple-500/30 shadow-lg shadow-purple-500/20'
                                : 'bg-purple-100 text-purple-600 border-purple-200 shadow-lg shadow-purple-500/20')
                            : (isDarkMode
                                ? "text-gray-300 hover:text-purple-300 hover:bg-purple-600/20 hover:border-purple-500/30 border-transparent"
                                : "text-gray-600 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-200 border-transparent"
                            )
                            }`}
                        title="Thông tin chi tiết"
                    >
                        <motion.div
                            animate={{ rotate: isDetailsOpen ? 180 : 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <Info className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                        </motion.div>

                        {/* Active indicator */}
                        {isDetailsOpen && (
                            <motion.div
                                className="absolute inset-0 rounded-full bg-purple-500/20"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            />
                        )}

                        {/* Ripple effect */}
                        <div className="absolute inset-0 rounded-full bg-purple-500/10 scale-0 group-hover:scale-100 transition-transform duration-300" />
                    </Button>
                </motion.div>

                {/* Arrow indicator for details panel */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                        opacity: isDetailsOpen ? 1 : 0,
                        x: isDetailsOpen ? 0 : -10
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-center"
                >
                    <motion.div
                        animate={{ rotate: isDetailsOpen ? 90 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <ChevronDown className={`h-4 w-4 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'
                            }`} />
                    </motion.div>
                </motion.div>
            </div>

            {/* Call Status Banner */}
            {(callStatus !== 'idle' || isInCall) && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-full left-0 right-0 z-10 px-4 py-2 text-center text-sm font-medium"
                    style={{
                        background: callStatus === 'connected' || isInCall
                            ? (isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)')
                            : callStatus === 'calling' || callStatus === 'connecting'
                                ? (isDarkMode ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.1)')
                                : callStatus === 'ringing'
                                    ? (isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)')
                                    : (isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
                        color: callStatus === 'connected' || isInCall
                            ? '#22c55e'
                            : callStatus === 'calling' || callStatus === 'connecting'
                                ? '#f59e0b'
                                : callStatus === 'ringing'
                                    ? '#3b82f6'
                                    : '#ef4444'
                    }}
                >
                    <div className="flex items-center justify-center gap-2">
                        <motion.div
                            className="w-2 h-2 rounded-full"
                            style={{
                                backgroundColor: callStatus === 'connected' || isInCall
                                    ? '#22c55e'
                                    : callStatus === 'calling' || callStatus === 'connecting'
                                        ? '#f59e0b'
                                        : callStatus === 'ringing'
                                            ? '#3b82f6'
                                            : '#ef4444'
                            }}
                            animate={{
                                scale: callStatus === 'ringing' ? [1, 1.2, 1] : 1,
                                opacity: isInCall ? [1, 0.5, 1] : 1
                            }}
                            transition={{
                                duration: callStatus === 'ringing' ? 1 : 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        <span>
                            {isInCall ? 'Đang trong cuộc gọi' :
                                callStatus === 'calling' ? 'Đang gọi...' :
                                    callStatus === 'ringing' ? 'Có cuộc gọi đến' :
                                        callStatus === 'connected' ? 'Đã kết nối' :
                                            callStatus === 'rejected' ? 'Cuộc gọi bị từ chối' :
                                                callStatus === 'timeout' ? 'Hết thời gian chờ' :
                                                    'Cuộc gọi đã kết thúc'}
                        </span>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
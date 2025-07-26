import React from 'react';
import { CallData } from '@/hooks/useCall';

interface IncomingCallModalProps {
    incomingCall: CallData | null;
    onAccept: () => void;
    onReject: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
    incomingCall,
    onAccept,
    onReject
}) => {
    if (!incomingCall) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl animate-pulse-ring">
                <div className="text-center">
                    <div className="mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center animate-bounce">
                            <span className="text-white text-2xl font-bold">
                                {incomingCall.callerName?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {incomingCall.callerName || 'Unknown Caller'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                            Cuộc gọi video đến...
                        </p>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={onReject}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center group"
                        >
                            <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                <path className="opacity-60" d="M2 2L18 18" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            Từ chối
                        </button>
                        <button
                            onClick={onAccept}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center group"
                        >
                            <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                            Trả lời
                        </button>
                    </div>
                </div>
            </div>

            {/* Ring animation styles */}
            <style jsx>{`
                @keyframes pulse-ring {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                .animate-pulse-ring {
                    animation: pulse-ring 2s infinite;
                }
            `}</style>
        </div>
    );
};

export default IncomingCallModal;
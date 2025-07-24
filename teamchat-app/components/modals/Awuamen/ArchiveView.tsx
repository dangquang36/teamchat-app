"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import type { Message } from '@/app/types';

type Attachment = NonNullable<Message['attachments']>[0] & { createdAt: string | Date };

interface ArchiveViewProps {
    initialTab: 'media' | 'files';
    mediaFiles: Attachment[];
    otherFiles: Attachment[];
    onClose: () => void;
    isDarkMode?: boolean;
}

const groupAttachmentsByDate = (files: Attachment[]) => {
    const groups = files.reduce((acc, file) => {
        const date = new Date(file.createdAt);
        const dateString = date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });

        if (!acc[dateString]) {
            acc[dateString] = [];
        }
        acc[dateString].push(file);
        return acc;
    }, {} as Record<string, Attachment[]>);

    return Object.entries(groups);
};

const formatFileSize = (bytes: number = 0, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function ArchiveView({ initialTab, mediaFiles, otherFiles, onClose, isDarkMode = false }: ArchiveViewProps) {
    const [activeTab, setActiveTab] = useState<'media' | 'files'>(initialTab);

    const groupedMedia = useMemo(() => groupAttachmentsByDate(mediaFiles), [mediaFiles]);
    const groupedFiles = useMemo(() => groupAttachmentsByDate(otherFiles), [otherFiles]);

    const renderMediaGrid = (files: Attachment[]) => (
        <div className="grid grid-cols-3 gap-1">
            {files.map((file, index) => (
                <a href={file.url} target="_blank" rel="noopener noreferrer" key={index} className="relative aspect-square group">
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover bg-gray-200 dark:bg-gray-700" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </a>
            ))}
        </div>
    );

    const renderFilesList = (files: Attachment[]) => (
        <div className="space-y-2">
            {files.map((file, index) => (
                <a
                    key={index}
                    href={file.url}
                    download={file.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <FileText className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                </a>
            ))}
        </div>
    );

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`w-80 flex-shrink-0 border-l flex flex-col h-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        >
            <div className={`p-2.5 border-b flex items-center justify-between flex-shrink-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-600'}`}>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h3 className="font-semibold text-lg">Kho lưu trữ</h3>
                <Button variant="ghost" className="text-sm text-transparent">Chọn</Button>
            </div>

            <div className={`p-2 border-b flex-shrink-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-600'}`}>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant={activeTab === 'media' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('media')}>Ảnh</Button>
                    <Button variant={activeTab === 'files' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('files')}>Files</Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-4">
                {activeTab === 'media' && (
                    groupedMedia.length > 0
                        ? groupedMedia.map(([date, files]) => (
                            <div key={date}>
                                <h4 className="font-semibold text-sm p-2">{date}</h4>
                                {renderMediaGrid(files)}
                            </div>
                        ))
                        : <p className="text-center text-sm text-gray-500 mt-10">Không có ảnh hoặc video nào.</p>
                )}
                {activeTab === 'files' && (
                    groupedFiles.length > 0
                        ? groupedFiles.map(([date, files]) => (
                            <div key={date}>
                                <h4 className="font-semibold text-sm p-2">{date}</h4>
                                {renderFilesList(files)}
                            </div>
                        ))
                        : <p className="text-center text-sm text-gray-500 mt-10">Không có tệp nào.</p>
                )}
            </div>
        </motion.div>
    );
}
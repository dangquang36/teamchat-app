'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
}

export function ConfirmationDialog({ isOpen, onClose, onConfirm, title, description }: ConfirmationDialogProps) {
    const { isDarkMode } = useTheme();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={isDarkMode ? "bg-gray-900 text-white border-gray-700" : "bg-white text-black"}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription className="pt-2">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <DialogClose asChild>
                        <Button variant="ghost" onClick={onClose}>Hủy</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={onConfirm}>
                        Xác nhận
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
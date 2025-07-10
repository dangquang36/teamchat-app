import React from "react";
import { SidebarIconProps } from "@/app/types"; // Adjust the import path as needed

export function SidebarIcon({
    icon,
    active,
    onClick,
    tooltip,
    badge,
}: SidebarIconProps) {
    return (
        <button
            onClick={onClick}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors relative group ${active
                ? "bg-white/30 text-white"
                : "text-white/70 hover:bg-white/20 hover:text-white"
                }`}
            title={tooltip}
        >
            {icon}
            {badge && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{badge}</span>
                </div>
            )}
        </button>
    );
}
import React from "react";
import { FeatureCardProps } from "@/app/types"; // Adjust the import path as needed

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center hover:bg-white/20 transition-colors">
            <div className="flex justify-center mb-4 text-white">{icon}</div>
            <h3 className="text-xl font-semibold mb-4">{title}</h3>
            <p className="opacity-90">{description}</p>
        </div>
    );
}
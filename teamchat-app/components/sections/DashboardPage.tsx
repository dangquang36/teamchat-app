import React, { useState } from "react";
import { ProfileSection } from "./ProfileSection"; // Adjust path as needed
import { SettingsSection } from "./SettingsSection"; // Adjust path as needed
import { useTheme } from "@/contexts/ThemeContext";

export function DashboardPage() {
    const [activeSection, setActiveSection] = useState<'profile' | 'settings'>('profile');
    const { isDarkMode, toggleDarkMode } = useTheme();

    const handleLogout = () => {
        // Implement your logout logic here (e.g., clear tokens, redirect)
        console.log("User logged out!");
        // Example: Redirect to login page
        // window.location.href = '/login';
    };

    return (
        <div className="flex h-screen w-full">
            {/* You can add a common navigation sidebar here if you want */}
            {/* For simplicity, we'll just render the active section */}


            {activeSection === 'settings' && (
                <SettingsSection onLogout={handleLogout} isDarkMode={isDarkMode} />
            )}

            {/* A simple way to switch for demonstration, you'd typically have a proper navigation */}
            <div className="absolute top-4 right-4 flex space-x-2">
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    onClick={() => setActiveSection('profile')}
                >
                    View Profile
                </button>
                <button
                    className="px-4 py-2 bg-green-500 text-white rounded-md"
                    onClick={() => setActiveSection('settings')}
                >
                    View Settings
                </button>
                <button
                    className="px-4 py-2 bg-gray-700 text-white rounded-md"
                    onClick={toggleDarkMode}
                >
                    Toggle Dark Mode ({isDarkMode ? 'On' : 'Off'})
                </button>
            </div>
        </div>
    );
}
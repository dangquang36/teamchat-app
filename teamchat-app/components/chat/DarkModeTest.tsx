import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function DarkModeTest() {
    const { isDarkMode, toggleDarkMode } = useTheme();

    return (
        <div className={`p-6 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Dark Mode Test</h1>
                    <button
                        onClick={toggleDarkMode}
                        className={`p-3 rounded-lg transition-all duration-200 hover:scale-105 ${isDarkMode
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-white text-gray-900 hover:bg-gray-100'
                            } shadow-lg`}
                        title={isDarkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
                    >
                        {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                    </button>
                </div>

                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h2 className="text-xl font-semibold mb-4">Trạng thái hiện tại</h2>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Chế độ: <span className="font-bold">{isDarkMode ? 'Tối' : 'Sáng'}</span>
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Class trên document: {document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Test Cards */}
                    <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <h3 className="text-lg font-semibold mb-3">Card 1</h3>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Đây là một card test để kiểm tra dark mode.
                        </p>
                        <button className={`mt-4 px-4 py-2 rounded-lg transition-colors ${isDarkMode
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}>
                            Button Test
                        </button>
                    </div>

                    <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <h3 className="text-lg font-semibold mb-3">Card 2</h3>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Card thứ hai để test contrast và readability.
                        </p>
                        <input
                            type="text"
                            placeholder="Input test"
                            className={`mt-4 w-full px-3 py-2 rounded-lg border transition-colors ${isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                }`}
                        />
                    </div>
                </div>

                {/* Color Palette Test */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h3 className="text-lg font-semibold mb-4">Color Palette Test</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}>
                            Gray
                        </div>
                        <div className="p-4 rounded-lg bg-blue-500 text-white">
                            Blue
                        </div>
                        <div className="p-4 rounded-lg bg-green-500 text-white">
                            Green
                        </div>
                        <div className="p-4 rounded-lg bg-red-500 text-white">
                            Red
                        </div>
                    </div>
                </div>

                {/* Text Test */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h3 className="text-lg font-semibold mb-4">Text Test</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Đây là text thường để test readability.
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Đây là text mờ hơn để test contrast.
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Đây là text rất mờ để test accessibility.
                    </p>
                </div>

                {/* Instructions */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h3 className="text-lg font-semibold mb-4">Hướng dẫn test</h3>
                    <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <li>• Click nút toggle để chuyển đổi dark/light mode</li>
                        <li>• Kiểm tra xem tất cả elements có chuyển đổi màu sắc không</li>
                        <li>• Kiểm tra contrast và readability</li>
                        <li>• Kiểm tra xem localStorage có lưu được preference không</li>
                        <li>• Refresh trang để test persistence</li>
                    </ul>
                </div>
            </div>
        </div>
    );
} 
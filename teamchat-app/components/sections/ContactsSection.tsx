import React from "react";
import { Button } from "@/components/ui/button";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";

interface ContactsSectionProps {
    isDarkMode?: boolean;
}

function ContactItem({ name, avatar, isDarkMode = false }: { name: string; avatar: string; isDarkMode?: boolean }) {
    return (
        <div
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                }`}
        >
            <div className="flex items-center">
                <img src={avatar || "/placeholder.svg"} alt={name} className="w-10 h-10 rounded-full mr-3" />
                <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{name}</span>
            </div>
            <Button variant="ghost" size="sm" className={isDarkMode ? "text-gray-500 hover:text-gray-300" : ""}>
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </Button>
        </div>
    );
}

export function ContactsSection({ isDarkMode = false }: ContactsSectionProps) {
    return (
        <div className="flex-1 flex">
            <div
                className={`w-80 border-r transition-colors ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}
            >
                <div className={`p-4 border-b transition-colors ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            Danh Bạ
                        </h2>
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white rounded-full w-8 h-8 p-0">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm danh bạ..."
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                }`}
                        />
                    </div>
                </div>

                <div className="overflow-y-auto">
                    <div className="p-4">
                        <h3
                            className={`text-xs font-semibold mb-3 uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                        >
                            A
                        </h3>
                        <div className="space-y-1">
                            <ContactItem
                                name="Adinda Kirana"
                                avatar="/placeholder.svg?height=40&width=40&text=AK"
                                isDarkMode={isDarkMode}
                            />
                            <ContactItem
                                name="Alaya Cordova"
                                avatar="/placeholder.svg?height=40&width=40&text=AC"
                                isDarkMode={isDarkMode}
                            />
                        </div>
                    </div>

                    <div className="p-4">
                        <h3
                            className={`text-xs font-semibold mb-3 uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                        >
                            B
                        </h3>
                        <div className="space-y-1">
                            <ContactItem
                                name="Brenda Bell"
                                avatar="/placeholder.svg?height=40&width=40&text=BB"
                                isDarkMode={isDarkMode}
                            />
                        </div>
                    </div>

                    <div className="p-4">
                        <h3
                            className={`text-xs font-semibold mb-3 uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                        >
                            D
                        </h3>
                        <div className="space-y-1">
                            <ContactItem
                                name="David Green"
                                avatar="/placeholder.svg?height=40&width=40&text=DG"
                                isDarkMode={isDarkMode}
                            />
                            <ContactItem
                                name="Dushane Daniel"
                                avatar="/placeholder.svg?height=40&width=40&text=DD"
                                isDarkMode={isDarkMode}
                            />
                        </div>
                    </div>

                    <div className="p-4">
                        <h3
                            className={`text-xs font-semibold mb-3 uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                        >
                            E
                        </h3>
                        <div className="space-y-1">
                            <ContactItem
                                name="Etla McDaniel"
                                avatar="/placeholder.svg?height=40&width=40&text=EM"
                                isDarkMode={isDarkMode}
                            />
                        </div>
                    </div>

                    <div className="p-4">
                        <h3
                            className={`text-xs font-semibold mb-3 uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                        >
                            H
                        </h3>
                        <div className="space-y-1">
                            <ContactItem
                                name="Henry Watkins"
                                avatar="/placeholder.svg?height=40&width=40&text=HW"
                                isDarkMode={isDarkMode}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat area for contacts */}
            <div className="flex-1 flex flex-col">
                <ChatHeader
                    user={{ name: "Contacts Chat", online: true, avatar: "/placeholder.svg" }}
                    onVideoCall={() => { }}
                    onAudioCall={() => { }}
                    onViewProfile={() => { }}
                    isDarkMode={isDarkMode}
                />
                <ChatMessages
                    messages={[]}
                    currentUser={{ id: "me", name: "Me", avatar: "/placeholder.svg" }}
                    isDarkMode={isDarkMode}
                />
                <ChatInput onSendMessage={() => { }} isDarkMode={isDarkMode} />
            </div>
        </div>
    );
}
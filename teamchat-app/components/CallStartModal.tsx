"use client"

import { useEffect, useState } from "react"
import { Dialog } from "@headlessui/react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface User {
    id: string
    name: string
    avatar?: string
}

export function CallStartModal({
    open,
    onClose,
}: {
    open: boolean
    onClose: () => void
}) {
    const [users, setUsers] = useState<User[]>([])
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])

    useEffect(() => {
        // 🟡 Tạm mock dữ liệu - sau này thay bằng fetch từ API
        setUsers([
            { id: "1", name: "Victoria Lane", avatar: "/placeholder.svg?text=VL" },
            { id: "2", name: "Robert Ledonne", avatar: "/placeholder.svg?text=RL" },
            { id: "3", name: "Etla McDaniel", avatar: "/placeholder.svg?text=EM" },
        ])
    }, [])

    const toggleSelect = (id: string) => {
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    return (
        <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-md">
                <Dialog.Title className="text-lg font-bold mb-4">Chọn người để gọi</Dialog.Title>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {users.map(user => (
                        <div key={user.id} className="flex items-center gap-3">
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                            <span className="flex-1">{user.name}</span>
                            <input
                                type="checkbox"
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => toggleSelect(user.id)}
                            />
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Hủy</Button>
                    <Button onClick={() => {
                        alert(`Bạn chọn gọi: ${selectedUsers.join(", ")}`)
                        onClose()
                    }}>
                        Gọi
                    </Button>
                </div>
            </Dialog.Panel>
        </Dialog >
    )
}
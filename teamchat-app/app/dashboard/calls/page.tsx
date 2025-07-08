"use client"

import { Video, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function CallPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 space-y-6">
            <h1 className="text-2xl font-bold text-purple-700">Gọi điện</h1>

            <Card className="p-6 space-y-4 w-full max-w-md shadow-lg">
                <h2 className="text-lg font-semibold">Chọn kiểu gọi</h2>

                <div className="flex flex-col gap-3">
                    <Button variant="default" className="w-full flex items-center gap-2 justify-center">
                        <Phone className="w-5 h-5" /> Gọi 1 người
                    </Button>

                    <Button variant="outline" className="w-full flex items-center gap-2 justify-center">
                        <Video className="w-5 h-5" /> Gọi nhiều người
                    </Button>
                </div>
            </Card>
        </div>
    )
}
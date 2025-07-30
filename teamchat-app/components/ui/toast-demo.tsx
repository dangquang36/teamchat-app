"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function ToastDemo() {
    const { toast } = useToast()

    return (
        <div className="space-y-2">
            <Button
                variant="outline"
                onClick={() => {
                    toast({
                        title: "📢 Thông báo demo",
                        description: "Đây là thông báo mẫu ở chế độ sáng!",
                    })
                }}
            >
                Test Default Toast
            </Button>
            <Button
                variant="outline"
                onClick={() => {
                    toast({
                        title: "✅ Thành công",
                        description: "Cuộc gọi đã kết nối thành công",
                        variant: "success",
                    })
                }}
            >
                Test Success Toast
            </Button>
            <Button
                variant="outline"
                onClick={() => {
                    toast({
                        title: "❌ Lỗi",
                        description: "Không thể kết nối cuộc gọi",
                        variant: "destructive",
                    })
                }}
            >
                Test Error Toast
            </Button>
        </div>
    )
}
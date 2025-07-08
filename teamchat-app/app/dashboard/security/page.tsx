"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SecurityPage() {
    const [section, setSection] = useState<"change" | "forgot">("change")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser")
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setMessage("Vui lòng nhập đầy đủ thông tin")
            return
        }
        if (newPassword !== confirmPassword) {
            setMessage("Mật khẩu mới không trùng khớp")
            return
        }
        if (!user || currentPassword !== user.password) {
            setMessage("Mật khẩu hiện tại không đúng")
            return
        }
        try {
            const res = await fetch(`https://685e0afa7b57aebd2af7d5fd.mockapi.io/testapifake/login/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...user, password: newPassword })
            })
            if (res.ok) {
                const updatedUser = await res.json()
                localStorage.setItem("currentUser", JSON.stringify(updatedUser))
                setMessage("Đổi mật khẩu thành công")
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
            } else {
                setMessage("Lỗi khi cập nhật mật khẩu")
            }
        } catch (err) {
            setMessage("Lỗi kết nối máy chủ")
        }
    }

    const handleForgotPassword = () => {
        if (!email) {
            setMessage("Vui lòng nhập email để khôi phục mật khẩu")
            return
        }
        setTimeout(() => {
            setMessage("Email khôi phục đã được gửi tới: " + email)
            setEmail("")
        }, 1000)
    }

    return (
        <div className="p-6 space-y-6 max-w-xl mx-auto text-gray-900 dark:text-white">
            <h1 className="text-2xl font-bold">🔐 Bảo mật tài khoản</h1>

            <div className="flex gap-4">
                <button
                    onClick={() => setSection("change")}
                    className={`px-4 py-2 rounded ${section === "change" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
                >
                    Đổi mật khẩu
                </button>
                <button
                    onClick={() => setSection("forgot")}
                    className={`px-4 py-2 rounded ${section === "forgot" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
                >
                    Quên mật khẩu
                </button>
            </div>

            {section === "change" && (
                <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="space-y-4 border p-6 rounded-lg shadow">
                    <Input
                        type="password"
                        placeholder="Mật khẩu hiện tại"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Input
                        type="password"
                        placeholder="Mật khẩu mới"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Input
                        type="password"
                        placeholder="Xác nhận mật khẩu mới"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button type="submit">Cập nhật mật khẩu</Button>
                </form>
            )}

            {section === "forgot" && (
                <form onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }} className="space-y-4 border p-6 rounded-lg shadow">
                    <Input
                        type="email"
                        placeholder="Email đã đăng ký"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button type="submit">Gửi yêu cầu đặt lại mật khẩu</Button>
                </form>
            )}

            {message && <p className="text-center text-red-500 font-medium">{message}</p>}
        </div>
    )
}
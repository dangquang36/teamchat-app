"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
// Removed framer-motion - using CSS transitions only
import { Button } from "@/components/ui/button"
import { MessageCircle, ArrowLeft } from "lucide-react"
import { apiClient } from "@/lib/api"

const schema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Vui lòng nhập email hợp lệ")
    .max(100, "Email không được vượt quá 100 ký tự"),
})

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [serverError, setServerError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({
    resolver: zodResolver(schema),
    mode: "onChange", // Kích hoạt xác thực thời gian thực
  })

  const onSubmit = async (data: { email: string }) => {
    setServerError("")
    try {
      const res = await apiClient.forgotPassword(data.email)
      if (res.success) {
        setIsSubmitted(true)
      } else {
        setServerError(res.error || "Không thể gửi yêu cầu, vui lòng thử lại")
      }
    } catch {
      setServerError("Có lỗi xảy ra, vui lòng thử lại")
    }
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <MessageCircle className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">TeamChat</span>
          </div>

          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email đã được gửi!</h1>
            <p className="text-gray-600">Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.</p>
          </div>

          <div className="space-y-4">
            <Button className="w-full bg-purple-600 hover:bg-purple-700">Mở ứng dụng email</Button>
            <Link href="/auth/login" className="block">
              <Button variant="outline" className="w-full">
                Quay lại đăng nhập
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6a11cb] to-[#2575fc] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageCircle className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">TeamChat</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h1>
          <p className="text-gray-600">Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.</p>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="text"
              {...register("email")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
              placeholder="Nhập email của bạn"
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
            Gửi hướng dẫn
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-purple-600 hover:text-purple-500 font-medium">
            ← Quay lại đăng nhập
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
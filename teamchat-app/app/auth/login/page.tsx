"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MessageCircle, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { apiClient } from "@/lib/api"

const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Vui lòng nhập tên đăng nhập")
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .max(20, "Tên đăng nhập không được vượt quá 20 ký tự")
    .regex(/^[a-zA-ZÀ-ỹ0-9\s]+$/, "Tên chỉ được chứa chữ cái, số, dấu cách"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .max(50, "Mật khẩu không được vượt quá 50 ký tự")
    .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất một chữ cái in hoa")
    .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất một chữ cái thường")
    .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất một số")
    .regex(/[^a-zA-Z0-9]/, "Mật khẩu phải chứa ít nhất một ký tự đặc biệt"),
})

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ username: string; password: string }>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  })

  const onSubmit = async (data: { username: string; password: string }) => {
    setIsLoading(true)
    setError("")
    try {
      const res = await apiClient.login(data.username, data.password)
      if (res.success) {
        localStorage.setItem("userToken", res.data.token)
        localStorage.setItem("currentUser", JSON.stringify(res.data))
        router.push("/")
      } else {
        setError(res.error || "Tên đăng nhập hoặc mật khẩu không đúng")
      }
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại")
    } finally {
      setIsLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập</h1>
          <p className="text-gray-600">Chào mừng bạn quay trở lại!</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Tên đăng nhập
            </label>
            <input
              id="username"
              type="text"
              {...register("username")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
              placeholder="Nhập tên đăng nhập"
            />
            {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Ghi nhớ đăng nhập
              </label>
            </div>
            <Link href="/auth/forgot-password" className="text-sm text-purple-600 hover:text-purple-500">
              Quên mật khẩu?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Chưa có tài khoản?{' '}
            <Link href="/auth/register" className="text-purple-600 hover:text-purple-500 font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-purple-600 hover:text-purple-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay về trang chủ
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

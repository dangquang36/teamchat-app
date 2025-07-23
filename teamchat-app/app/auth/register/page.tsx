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

const schema = z
  .object({
    name: z
      .string()
      .min(1, "Vui lòng nhập Tên")
      .min(3, "Tên phải có ít nhất 3 ký tự")
      .max(20, "Tên không được vượt quá 20 ký tự")
      .regex(/^[a-zA-ZÀ-ỹ0-9\s]+$/, "Tên chỉ được chứa chữ cái, số, dấu cách"),
    email: z
      .string()
      .min(1, "Vui lòng nhập email")
      .email("Email không hợp lệ")
      .max(100, "Email không được vượt quá 100 ký tự"),
    phone: z
      .string()
      .min(1, "Vui lòng nhập số điện thoại")
      .length(10, "Số điện thoại phải có đúng 10 chữ số")
      .regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa số"),
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu")
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .max(50, "Mật khẩu không được vượt quá 50 ký tự")
      .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất một chữ cái in hoa")
      .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất một chữ cái thường")
      .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất một số")
      .regex(/[^a-zA-Z0-9]/, "Mật khẩu phải chứa ít nhất một ký tự đặc biệt"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
    terms: z.literal(true, {
      errorMap: () => ({ message: "Bạn cần đồng ý với điều khoản sử dụng" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState("")
  const [termsError, setTermsError] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  })

  const onSubmit = async (data: any) => {
    if (!data.terms) {
      setTermsError("Bạn cần đồng ý với điều khoản sử dụng")
      return
    }
    setTermsError("")

    try {
      const res = await apiClient.register({
        name: data.name,
        username: data.email.split("@")[0],
        email: data.email,
        phone: data.phone,
        password: data.password,
      })

      if (!res.success) {
        setServerError(res.error || "Đăng ký thất bại")
        return
      }

      localStorage.setItem("userToken", res.data.token)
      localStorage.setItem("currentUser", JSON.stringify(res.data))

      router.push("/auth/login")
    } catch {
      setServerError("Có lỗi xảy ra, vui lòng thử lại")
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký</h1>
          <p className="text-gray-600">Tạo tài khoản mới để bắt đầu</p>
        </div>

        {serverError && <p className="text-sm text-red-500 mb-4">{serverError}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Tên đăng ký
            </label>
            <input
              id="name"
              type="text"
              {...register("name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
              placeholder="Nhập tên đăng nhập của bạn"
            />
            {typeof errors.name?.message === "string" && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="text"
              {...register("email")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
              placeholder="Nhập email của bạn"
            />
            {typeof errors.email?.message === "string" && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <input
              id="phone"
              type="text"
              {...register("phone")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
              placeholder="Nhập số điện thoại"
            />
            {typeof errors.phone?.message === "string" && (
              <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
            )}
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {typeof errors.password?.message === "string" && (
              <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
                placeholder="Nhập lại mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {typeof errors.confirmPassword?.message === "string" && (
              <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              {...register("terms")}
              className="h-4 w-4 mt-1 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
              Tôi đồng ý với {" "}
              <Link href="/terms" className="text-purple-600 hover:text-purple-500">
                Điều khoản sử dụng
              </Link>
            </label>
            {typeof errors.terms?.message === "string" && (
              <p className="text-sm text-red-500 mt-1">{errors.terms.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Đã có tài khoản? {" "}
            <Link href="/auth/login" className="text-purple-600 hover:text-purple-500 font-medium">
              Đăng nhập ngay
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
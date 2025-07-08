"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      setIsLoading(false)
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      setIsLoading(false)
      return
    }

    try {
      //     // Simulate API call
      //     await new Promise((resolve) => setTimeout(resolve, 1000))

      //     // Check if email already exists
      //     const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      //     const existingUser = users.find((u: any) => u.email === formData.email)

      //     if (existingUser) {
      //       setError("Email này đã được đăng ký")
      //       setIsLoading(false)
      //       return
      //     }

      //     // Save new user
      //     const newUser = {
      //       id: Date.now(),
      //       name: formData.name,
      //       email: formData.email,
      //       phone: formData.phone,
      //       password: formData.password,
      //       createdAt: new Date().toISOString(),
      //     }

      //     users.push(newUser)
      //     localStorage.setItem("registeredUsers", JSON.stringify(users))

      //     // Auto login after registration
      //     localStorage.setItem("userToken", "logged-in-" + Date.now())
      //     localStorage.setItem("currentUser", JSON.stringify(newUser))

      //     // Redirect to main app
      //     router.push("/")
      //   } catch (err) {
      //     setError("Có lỗi xảy ra, vui lòng thử lại")
      //   } finally {
      //     setIsLoading(false)
      //   }
      // }
      const res = await apiClient.register({
        name: formData.name,
        username: formData.email.split("@")[0],
        password: formData.password,
        phone: formData.phone,
        email: formData.email,
      })
      if (!res.success) {
        setError(res.error || "Đăng ký thất bại")
        return
      }

      // Lưu token và user
      localStorage.setItem("userToken", res.data.token)
      localStorage.setItem("currentUser", JSON.stringify(res.data))

      router.push("/login")
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageCircle className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">TeamChat</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký</h1>
          <p className="text-gray-600">Tạo tài khoản mới để bắt đầu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBackToHome}
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay về trang chủ
                </Button>
              </div>
            </div>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nhập email của bạn"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nhập số điện thoại"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nhập lại mật khẩu"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              Tôi đồng ý với{" "}
              <Link href="/terms" className="text-purple-600 hover:text-purple-500">
                Điều khoản sử dụng
              </Link>
            </label>
          </div>

          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-purple-600 hover:text-purple-500 font-medium">
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBackToHome}
            className="text-purple-600 hover:text-purple-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay về trang chủ
          </Button>
        </div>
      </div>
    </div>
  )
}

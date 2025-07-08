"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic email validation
    if (!email || !email.includes("@")) {
      setError("Vui lòng nhập email hợp lệ")
      return
    }

    // Handle forgot password logic here
    console.log("Forgot password request:", email)
    setIsSubmitted(true)
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
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
            <Link href="/login" className="block">
              <Button variant="outline" className="w-full">
                Quay lại đăng nhập
              </Button>
            </Link>
            <Button
              type="button"
              variant="ghost"
              onClick={handleBackToHome}
              className="w-full text-purple-600 hover:text-purple-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay về trang chủ
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageCircle className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">TeamChat</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h1>
          <p className="text-gray-600">Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu</p>
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nhập email của bạn"
              required
            />
          </div>

          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
            Gửi hướng dẫn
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-purple-600 hover:text-purple-500 font-medium">
            ← Quay lại đăng nhập
          </Link>
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

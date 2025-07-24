"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Video,
  Users,
  Shield,
  Zap,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleGetStarted = () => {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      router.push("/dashboard/chat");
    } else {
      router.push("/auth/register");
    }
  };

  // Nếu đã đăng nhập, chuyển hướng đến chat
  if (isLoggedIn) {
    router.push("/dashboard/chat");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-cyan-900 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-cyan-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-gradient-to-tr from-indigo-500/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6 backdrop-blur-sm bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            TeamChat
          </span>
        </div>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button
              variant="outline"
              className="bg-transparent border-2 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-lg hover:shadow-cyan-400/20 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
            >
              Đăng nhập
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-400 hover:to-purple-500 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
              Đăng ký
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 text-center py-24 px-6">
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 backdrop-blur-sm border border-cyan-400/30 rounded-full px-6 py-2 text-sm text-cyan-300">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Hoạt động 24/7
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent leading-tight">
          Dự Án Tốt Nghiệp
          <br />
          <span className="text-4xl md:text-6xl">TeamChat</span>
        </h1>

        <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto opacity-90 text-gray-200 leading-relaxed">
          Nền tảng giao tiếp và cộng tác hiện đại giúp đội nhóm làm việc hiệu quả hơn với tin nhắn, cuộc gọi video.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-400 hover:to-purple-500 px-10 py-6 text-lg shadow-2xl hover:shadow-3xl hover:shadow-purple-500/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 font-semibold rounded-xl"
            onClick={handleGetStarted}
          >
            <Zap className="mr-2 h-5 w-5" />
            Bắt đầu miễn phí
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-transparent border-2 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 hover:text-cyan-300 px-10 py-6 text-lg backdrop-blur-sm hover:shadow-lg hover:shadow-cyan-400/20 transition-all duration-300 transform hover:scale-105 font-semibold rounded-xl"
          >
            <Video className="mr-2 h-5 w-5" />
            Xem demo
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Tính năng nổi bật
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-2xl blur-xl transition-all duration-300 group-hover:blur-2xl opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transition-all duration-500 hover:bg-white/10 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-400/10 transform hover:scale-105 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl group-hover:shadow-cyan-400/20 transition-all duration-300">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-cyan-300">Tin nhắn thời gian thực</h3>
              <p className="text-gray-300 leading-relaxed">Chat nhanh chóng với đồng nghiệp.</p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-2xl blur-xl transition-all duration-300 group-hover:blur-2xl opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transition-all duration-500 hover:bg-white/10 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-400/10 transform hover:scale-105 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl group-hover:shadow-purple-400/20 transition-all duration-300">
                <Video className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-purple-300">Cuộc gọi video HD</h3>
              <p className="text-gray-300 leading-relaxed">Họp online chất lượng cao với nhiều người tham gia</p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-2xl blur-xl transition-all duration-300 group-hover:blur-2xl opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transition-all duration-500 hover:bg-white/10 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-400/10 transform hover:scale-105 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl group-hover:shadow-indigo-400/20 transition-all duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-indigo-300">Đăng bài lên nhóm</h3>
              <p className="text-gray-300 leading-relaxed">Đăng bài lên nhóm chia sẻ các thông tin trong ngày trong tuần</p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-2xl blur-xl transition-all duration-300 group-hover:blur-2xl opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transition-all duration-500 hover:bg-white/10 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-400/10 transform hover:scale-105 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl group-hover:shadow-emerald-400/20 transition-all duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-emerald-300">Bảo mật</h3>
              <p className="text-gray-300 leading-relaxed">Bảo mật thông tin về tài khoản thay đổi thông tin tài khoản</p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-2xl blur-xl transition-all duration-300 group-hover:blur-2xl opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transition-all duration-500 hover:bg-white/10 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-400/10 transform hover:scale-105 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl group-hover:shadow-yellow-400/20 transition-all duration-300">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-yellow-300">Hiệu suất cao</h3>
              <p className="text-gray-300 leading-relaxed">Tốc độ xử lý nhanh, không lag trong quá trình sử dụng</p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-2xl blur-xl transition-all duration-300 group-hover:blur-2xl opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transition-all duration-500 hover:bg-white/10 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-400/10 transform hover:scale-105 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl group-hover:shadow-blue-400/20 transition-all duration-300">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-blue-300">Sử dụng nền tảng trang web</h3>
              <p className="text-gray-300 leading-relaxed">Sử dụng trên web, trên các thiết bị có hoạt động về web</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 text-center py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Sẵn sàng bắt đầu?
              </h2>
              <p className="text-xl mb-12 opacity-90 text-gray-200 leading-relaxed">
                Tham gia cùng đội nhóm đang sử dụng TeamChat
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-400 hover:to-purple-500 px-12 py-6 text-lg shadow-2xl hover:shadow-3xl hover:shadow-purple-500/30 transition-all duration-500 transform hover:scale-110 hover:-translate-y-3 font-semibold rounded-xl"
                onClick={handleGetStarted}
              >
                <Users className="mr-2 h-5 w-5" />
                Tạo tài khoản miễn phí
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-12 px-6 border-t border-white/10 backdrop-blur-sm bg-white/5">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              TeamChat
            </span>
          </div>
        </div>
        <p className="opacity-70 text-gray-300">© 2024 TeamChat. All rights reserved.</p>
      </footer>
    </div>
  );
}
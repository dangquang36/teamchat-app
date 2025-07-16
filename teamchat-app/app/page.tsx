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
import { FeatureCard } from "@/components/common/FeatureCard";
import '@/styles/poll.css';

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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold">TeamChat</span>
        </div>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white hover:text-purple-700"
            >
              Đăng nhập
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="bg-white text-purple-700 hover:bg-gray-100">
              Đăng ký
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Kết nối đội nhóm của bạn
        </h1>
        <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto opacity-90">
          Nền tảng giao tiếp và cộng tác hiện đại giúp đội nhóm làm việc hiệu quả hơn với tin nhắn, cuộc gọi video và
          chia sẻ file.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-white text-purple-700 hover:bg-gray-100 px-8 py-4 text-lg"
            onClick={handleGetStarted}
          >
            Bắt đầu miễn phí
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-transparent border-white text-white hover:bg-white hover:text-purple-700 px-8 py-4 text-lg"
          >
            Xem demo
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <h2 className="text-4xl font-bold text-center mb-16">Tính năng nổi bật</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<MessageCircle className="h-12 w-12" />}
            title="Tin nhắn thời gian thực"
            description="Chat nhanh chóng với đồng nghiệp, chia sẻ file và emoji"
          />
          <FeatureCard
            icon={<Video className="h-12 w-12" />}
            title="Cuộc gọi video HD"
            description="Họp online chất lượng cao với nhiều người tham gia"
          />
          <FeatureCard
            icon={<Users className="h-12 w-12" />}
            title="Quản lý nhóm"
            description="Tạo và quản lý các nhóm làm việc hiệu quả"
          />
          <FeatureCard
            icon={<Shield className="h-12 w-12" />}
            title="Bảo mật cao"
            description="Mã hóa end-to-end đảm bảo an toàn thông tin"
          />
          <FeatureCard
            icon={<Zap className="h-12 w-12" />}
            title="Hiệu suất cao"
            description="Tốc độ xử lý nhanh, không lag trong quá trình sử dụng"
          />
          <FeatureCard
            icon={<Globe className="h-12 w-12" />}
            title="Đa nền tảng"
            description="Sử dụng trên web, mobile và desktop"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-20 px-6">
        <h2 className="text-4xl font-bold mb-6">Sẵn sàng bắt đầu?</h2>
        <p className="text-xl mb-12 opacity-90">
          Tham gia cùng hàng nghìn đội nhóm đang sử dụng TeamChat
        </p>
        <Button
          size="lg"
          className="bg-white text-purple-700 hover:bg-gray-100 px-8 py-4 text-lg"
          onClick={handleGetStarted}
        >
          Tạo tài khoản miễn phí
        </Button>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 px-6 border-t border-purple-500/30">
        <p className="opacity-70">© 2024 TeamChat. All rights reserved.</p>
      </footer>
    </div>
  );
}
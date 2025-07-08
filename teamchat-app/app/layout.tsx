import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppProvider } from "@/contexts/AppContext"

const inter = Inter({ subsets: ["latin"] })



export const metadata: Metadata = {
  title: "TeamChat - Kết nối đội nhóm của bạn",
  description: "Nền tảng giao tiếp và cộng tác hiện đại",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}



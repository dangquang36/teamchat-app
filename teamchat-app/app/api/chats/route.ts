import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Mock chats database
const chats = [
  {
    id: "chat-1",
    type: "direct",
    participants: [
      {
        id: "1",
        name: "Dushane Daniel",
        email: "dushane@teamchat.com",
        avatar: "/placeholder.svg?height=40&width=40&text=DD",
        status: "online",
      },
      {
        id: "2",
        name: "Victoria Lane",
        email: "victoria@teamchat.com",
        avatar: "/placeholder.svg?height=40&width=40&text=VL",
        status: "online",
      },
    ],
    lastMessage: {
      id: "2",
      content: "Wow that's great!",
      timestamp: Date.now() - 3500000,
      senderId: "1",
    },
    unreadCount: 0,
    updatedAt: Date.now() - 3500000,
  },
]

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const user = verifyToken(request)
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  try {
    // Filter chats where user is a participant
    const userChats = chats.filter((chat) => chat.participants.some((p) => p.id === user.userId))

    return NextResponse.json({
      success: true,
      data: userChats,
    })
  } catch (error) {
    console.error("Get chats error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

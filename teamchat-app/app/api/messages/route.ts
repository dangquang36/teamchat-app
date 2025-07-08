import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Mock messages database
const messages = [
  {
    id: "1",
    chatId: "chat-1",
    senderId: "2",
    content:
      "Hey, I'm going to meet a friend of mine at the department store. I have to buy some presents for my parents 🎁",
    type: "text",
    timestamp: Date.now() - 3600000,
  },
  {
    id: "2",
    chatId: "chat-1",
    senderId: "1",
    content: "Wow that's great!",
    type: "text",
    timestamp: Date.now() - 3500000,
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

  const { searchParams } = new URL(request.url)
  const chatId = searchParams.get("chatId")
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "50")

  try {
    let filteredMessages = messages
    if (chatId) {
      filteredMessages = messages.filter((m) => m.chatId === chatId)
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedMessages = filteredMessages.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: {
        messages: paginatedMessages,
        hasMore: endIndex < filteredMessages.length,
        total: filteredMessages.length,
      },
    })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = verifyToken(request)
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { chatId, content, type = "text", fileUrl, fileName, fileSize } = await request.json()

    const newMessage = {
      id: Date.now().toString(),
      chatId,
      senderId: user.userId,
      content,
      type,
      timestamp: Date.now(),
      ...(fileUrl && { fileUrl }),
      ...(fileName && { fileName }),
      ...(fileSize && { fileSize }),
    }

    messages.push(newMessage)

    return NextResponse.json({
      success: true,
      data: newMessage,
    })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

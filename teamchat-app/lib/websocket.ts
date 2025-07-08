// WebSocket client for real-time features
type WebSocketEventType =
  | "message_received"
  | "message_sent"
  | "user_online"
  | "user_offline"
  | "typing_start"
  | "typing_stop"
  | "call_incoming"
  | "call_ended"

interface WebSocketMessage {
  type: WebSocketEventType
  data: any
  timestamp: number
}

class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<WebSocketEventType, Function[]> = new Map()

  connect() {
    const token = localStorage.getItem("userToken")
    if (!token) return

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001"
    this.ws = new WebSocket(`${wsUrl}?token=${token}`)

    this.ws.onopen = () => {
      console.log("WebSocket connected")
      this.reconnectAttempts = 0
    }

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error)
      }
    }

    this.ws.onclose = () => {
      console.log("WebSocket disconnected")
      this.attemptReconnect()
    }

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const listeners = this.listeners.get(message.type) || []
    listeners.forEach((listener) => listener(message.data))
  }

  on(eventType: WebSocketEventType, callback: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }
    this.listeners.get(eventType)!.push(callback)
  }

  off(eventType: WebSocketEventType, callback: Function) {
    const listeners = this.listeners.get(eventType) || []
    const index = listeners.indexOf(callback)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }

  send(type: WebSocketEventType, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type,
          data,
          timestamp: Date.now(),
        }),
      )
    }
  }

  // Convenience methods
  sendTyping(chatId: string, isTyping: boolean) {
    this.send(isTyping ? "typing_start" : "typing_stop", { chatId })
  }

  sendMessage(messageData: any) {
    this.send("message_sent", messageData)
  }
}

export const wsClient = new WebSocketClient()

"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { wsClient } from "@/lib/websocket"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  status: "online" | "offline" | "away"
}

interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  type: "text" | "image" | "file" | "audio" | "video"
  timestamp: number
  fileUrl?: string
  fileName?: string
  fileSize?: number
}

interface Chat {
  id: string
  type: "direct" | "group"
  name?: string
  participants: User[]
  lastMessage?: Message
  unreadCount: number
  updatedAt: number
}

interface AppState {
  user: User | null
  chats: Chat[]
  messages: Record<string, Message[]>
  contacts: User[]
  onlineUsers: string[]
  typingUsers: Record<string, string[]>
  loading: boolean
  error: string | null
}

type AppAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_CHATS"; payload: Chat[] }
  | { type: "ADD_CHAT"; payload: Chat }
  | { type: "UPDATE_CHAT"; payload: { chatId: string; updates: Partial<Chat> } }
  | { type: "SET_MESSAGES"; payload: { chatId: string; messages: Message[] } }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_CONTACTS"; payload: User[] }
  | { type: "ADD_CONTACT"; payload: User }
  | { type: "REMOVE_CONTACT"; payload: string }
  | { type: "SET_ONLINE_USERS"; payload: string[] }
  | { type: "USER_ONLINE"; payload: string }
  | { type: "USER_OFFLINE"; payload: string }
  | { type: "SET_TYPING"; payload: { chatId: string; userId: string; isTyping: boolean } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }

const initialState: AppState = {
  user: null,
  chats: [],
  messages: {},
  contacts: [],
  onlineUsers: [],
  typingUsers: {},
  loading: false,
  error: null,
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload }

    case "SET_CHATS":
      return { ...state, chats: action.payload }

    case "ADD_CHAT":
      return { ...state, chats: [action.payload, ...state.chats] }

    case "UPDATE_CHAT":
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.payload.chatId ? { ...chat, ...action.payload.updates } : chat,
        ),
      }

    case "SET_MESSAGES":
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.chatId]: action.payload.messages,
        },
      }

    case "ADD_MESSAGE":
      const { chatId } = action.payload
      return {
        ...state,
        messages: {
          ...state.messages,
          [chatId]: [...(state.messages[chatId] || []), action.payload],
        },
      }

    case "SET_CONTACTS":
      return { ...state, contacts: action.payload }

    case "ADD_CONTACT":
      return { ...state, contacts: [...state.contacts, action.payload] }

    case "REMOVE_CONTACT":
      return {
        ...state,
        contacts: state.contacts.filter((contact) => contact.id !== action.payload),
      }

    case "SET_ONLINE_USERS":
      return { ...state, onlineUsers: action.payload }

    case "USER_ONLINE":
      return {
        ...state,
        onlineUsers: [...new Set([...state.onlineUsers, action.payload])],
      }

    case "USER_OFFLINE":
      return {
        ...state,
        onlineUsers: state.onlineUsers.filter((id) => id !== action.payload),
      }

    case "SET_TYPING":
      const { chatId: typingChatId, userId, isTyping } = action.payload
      const currentTyping = state.typingUsers[typingChatId] || []

      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [typingChatId]: isTyping
            ? [...new Set([...currentTyping, userId])]
            : currentTyping.filter((id) => id !== userId),
        },
      }

    case "SET_LOADING":
      return { ...state, loading: action.payload }

    case "SET_ERROR":
      return { ...state, error: action.payload }

    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
  actions: {
    login: (email: string, password: string) => Promise<boolean>
    register: (userData: any) => Promise<boolean>
    logout: () => Promise<void>
    loadChats: () => Promise<void>
    loadMessages: (chatId: string) => Promise<void>
    sendMessage: (chatId: string, content: string, type?: "text" | "image" | "file" | "audio" | "video") => Promise<void>
    loadContacts: () => Promise<void>
    addContact: (email: string) => Promise<void>
    startTyping: (chatId: string) => void
    stopTyping: (chatId: string) => void
  }
} | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // WebSocket event handlers
  useEffect(() => {
    if (state.user) {
      wsClient.connect()

      wsClient.on("message_received", (message: Message) => {
        dispatch({ type: "ADD_MESSAGE", payload: message })
      })

      wsClient.on("user_online", (userId: string) => {
        dispatch({ type: "USER_ONLINE", payload: userId })
      })

      wsClient.on("user_offline", (userId: string) => {
        dispatch({ type: "USER_OFFLINE", payload: userId })
      })

      wsClient.on("typing_start", ({ chatId, userId }: { chatId: string; userId: string }) => {
        dispatch({ type: "SET_TYPING", payload: { chatId, userId, isTyping: true } })
      })

      wsClient.on("typing_stop", ({ chatId, userId }: { chatId: string; userId: string }) => {
        dispatch({ type: "SET_TYPING", payload: { chatId, userId, isTyping: false } })
      })

      return () => {
        wsClient.disconnect()
      }
    }
  }, [state.user])

  const actions = {
    login: async (email: string, password: string): Promise<boolean> => {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "SET_ERROR", payload: null })

      const response = await apiClient.login(email, password)

      if (response.success && response.data) {
        localStorage.setItem("userToken", response.data.token)
        localStorage.setItem("currentUser", JSON.stringify(response.data.user))
        dispatch({ type: "SET_USER", payload: response.data.user })
        dispatch({ type: "SET_LOADING", payload: false })
        return true
      } else {
        dispatch({ type: "SET_ERROR", payload: response.error || "Login failed" })
        dispatch({ type: "SET_LOADING", payload: false })
        return false
      }
    },

    register: async (userData: any): Promise<boolean> => {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "SET_ERROR", payload: null })

      const response = await apiClient.register(userData)

      if (response.success && response.data) {
        localStorage.setItem("userToken", response.data.token)
        localStorage.setItem("currentUser", JSON.stringify(response.data.user))
        dispatch({ type: "SET_USER", payload: response.data.user })
        dispatch({ type: "SET_LOADING", payload: false })
        return true
      } else {
        dispatch({ type: "SET_ERROR", payload: response.error || "Registration failed" })
        dispatch({ type: "SET_LOADING", payload: false })
        return false
      }
    },

    logout: async (): Promise<void> => {
      await apiClient.logout()
      localStorage.removeItem("userToken")
      localStorage.removeItem("currentUser")
      dispatch({ type: "SET_USER", payload: null })
      wsClient.disconnect()
    },

    loadChats: async (): Promise<void> => {
      const response = await apiClient.getChats()
      if (response.success && response.data) {
        dispatch({ type: "SET_CHATS", payload: response.data })
      }
    },

    loadMessages: async (chatId: string): Promise<void> => {
      const response = await apiClient.getMessages(chatId)
      if (response.success && response.data) {
        dispatch({
          type: "SET_MESSAGES",
          payload: { chatId, messages: response.data.messages },
        })
      }
    },

    sendMessage: async (chatId: string, content: string, type: "text" | "image" | "file" | "audio" | "video" = "text"): Promise<void> => {
      const response = await apiClient.sendMessage(chatId, { content, type })
      if (response.success && response.data) {
        dispatch({ type: "ADD_MESSAGE", payload: response.data })
        wsClient.sendMessage(response.data)
      }
    },

    loadContacts: async (): Promise<void> => {
      const response = await apiClient.getContacts()
      if (response.success && response.data) {
        dispatch({ type: "SET_CONTACTS", payload: response.data })
      }
    },

    addContact: async (email: string): Promise<void> => {
      const response = await apiClient.addContact(email)
      if (response.success && response.data) {
        dispatch({ type: "ADD_CONTACT", payload: response.data })
      }
    },

    startTyping: (chatId: string): void => {
      wsClient.sendTyping(chatId, true)
    },

    stopTyping: (chatId: string): void => {
      wsClient.sendTyping(chatId, false)
    },
  }

  return <AppContext.Provider value={{ state, dispatch, actions }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
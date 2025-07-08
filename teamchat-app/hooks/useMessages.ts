"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/contexts/AppContext"

export function useMessages(chatId: string) {
  const { state, actions } = useApp()
  const [loading, setLoading] = useState(false)

  const messages = state.messages[chatId] || []
  const typingUsers = state.typingUsers[chatId] || []

  useEffect(() => {
    if (chatId && !state.messages[chatId]) {
      setLoading(true)
      actions.loadMessages(chatId).finally(() => setLoading(false))
    }
  }, [chatId])

  const sendMessage = async (content: string, type = "text") => {
    await actions.sendMessage(chatId, content, type)
  }

  const startTyping = () => {
    actions.startTyping(chatId)
  }

  const stopTyping = () => {
    actions.stopTyping(chatId)
  }

  return {
    messages,
    typingUsers,
    loading,
    sendMessage,
    startTyping,
    stopTyping,
  }
}

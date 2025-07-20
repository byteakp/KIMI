"use client"
import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import { useAuth } from "./auth-context"
import { toast } from "@/hooks/use-toast"

interface ChatHistoryItem {
  _id: string // Changed to _id to match backend response
  title: string
  createdAt: string // Assuming your backend provides this
}

interface ChatHistoryContextType {
  chatHistory: ChatHistoryItem[]
  isLoadingHistory: boolean
  fetchChatHistory: () => Promise<void>
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined)

export function ChatHistoryProvider({ children }: { children: React.ReactNode }) {
  const { token, isLoggedIn } = useAuth()
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const fetchChatHistory = useCallback(async () => {
    if (!isLoggedIn || !token) {
      setChatHistory([]) // Clear history if not logged in
      return
    }
    setIsLoadingHistory(true)
    try {
      // Corrected endpoint: Fetching chat history from /api/conversations
      const data: ChatHistoryItem[] = await api.get("/api/conversations", token)
      // Ensure data is an array and map _id to id if necessary for other components,
      // but here we'll just use _id directly in the interface.
      setChatHistory(data || [])
    } catch (error: any) {
      console.error("Error fetching chat history:", error) // Log the full error object for debugging
      toast({
        title: "Error",
        description: error.message || "Could not load chat history due to an unknown error.",
        variant: "destructive",
      })
      setChatHistory([])
    } finally {
      setIsLoadingHistory(false)
    }
  }, [isLoggedIn, token])

  useEffect(() => {
    fetchChatHistory()
  }, [fetchChatHistory])

  const value = React.useMemo(
    () => ({
      chatHistory,
      isLoadingHistory,
      fetchChatHistory,
    }),
    [chatHistory, isLoadingHistory, fetchChatHistory],
  )

  return <ChatHistoryContext.Provider value={value}>{children}</ChatHistoryContext.Provider>
}

export function useChatHistory() {
  const context = useContext(ChatHistoryContext)
  if (context === undefined) {
    throw new Error("useChatHistory must be used within a ChatHistoryProvider")
  }
  return context
}

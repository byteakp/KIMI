"use client"

import * as React from "react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { api } from "@/lib/api"

export interface Message {
  role: "user" | "assistant"
  content: string
  status?: "pending" | "sent" // Added status for optimistic UI
  imageUrl?: string // New: Optional URL for attached image in user message
}

export interface Model {
  id: string // This will be the internal key (e.g., "deepseek-chat")
  name: string // This will be the display name (e.g., "DeepSeek Chat")
  description: string
  isNew?: boolean
  capabilities?: string[] // Added capabilities property
}

export interface SearchResult {
  title: string
  url: string
  snippet: string
}

interface UseChatOptions {
  onNewConversationCreated?: () => void
}

export function useChat({ onNewConversationCreated }: UseChatOptions = {}) {
  const { token, isLoggedIn } = useAuth()
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isThinking, setIsThinking] = React.useState(false)
  const [thinkingSteps, setThinkingSteps] = React.useState<string[]>([])
  const [reasoningText, setReasoningText] = React.useState<string | null>(null) // New state for reasoning
  const [selectedModel, setSelectedModel] = React.useState<string>("K1.5")
  const [enableSearch, setEnableSearch] = React.useState(false)
  const [extendedThinking, setExtendedThinking] = React.useState(false)
  const [allModels, setAllModels] = React.useState<Model[]>([]) // Store all fetched models
  const [models, setModels] = React.useState<Model[]>([]) // Models currently available for selection
  const [attachedFile, setAttachedFile] = React.useState<File | null>(null)
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (token) {
      fetchModels()
    }
  }, [token])

  const fetchModels = async () => {
    try {
      const data: { [key: string]: { name: string; description: string; isNew?: boolean; capabilities?: string[] } } =
        await api.get("/api/chat/models", token)
      console.log("Raw models data from API:", data)
      const fetchedModels: Model[] = Object.keys(data).map((modelId) => ({
        id: modelId,
        name: data[modelId].name,
        description: data[modelId].description,
        isNew: data[modelId].isNew,
        capabilities: data[modelId].capabilities || [], // Ensure capabilities is an array
      }))
      setAllModels(fetchedModels) // Store all models
      // Initialize available models based on current attached file status
      const initialAvailableModels = attachedModels(fetchedModels, attachedFile)
      setModels(initialAvailableModels) // Set models for display

      if (initialAvailableModels.length > 0) {
        // If current selected model is not in the initial available models, select the first one
        if (!selectedModel || !initialAvailableModels.some((m) => m.id === selectedModel)) {
          setSelectedModel(initialAvailableModels[0].id)
          console.log("Default model set to:", initialAvailableModels[0].id)
        }
      } else {
        console.log("No models fetched or models array is empty.")
      }
    } catch (error) {
      console.error("Error fetching models:", error)
      toast({
        title: "Error",
        description: "Could not load AI models.",
        variant: "destructive",
      })
    }
  }

  const attachedModels = React.useCallback((all: Model[], file: File | null) => {
    return file ? all.filter((m) => m.capabilities?.includes("vision")) : all
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAttachedFile(file)
      // Filter models for vision capability when an image is attached
      const visionModels = attachedModels(allModels, file)
      setModels(visionModels)
      // If current selected model is not vision-capable, select the first vision model
      if (!visionModels.some((m) => m.id === selectedModel) && visionModels.length > 0) {
        setSelectedModel(visionModels[0].id)
      }
    } else {
      setAttachedFile(null)
      setModels(allModels) // Reset to all models when no file is attached
      // If the previously selected model was a vision-only model, reset to a default non-vision model if available
      if (!allModels.some((m) => m.id === selectedModel) && allModels.length > 0) {
        setSelectedModel(allModels[0].id)
      }
    }
  }

  const resetChat = React.useCallback(() => {
    setMessages([])
    setInput("")
    setIsLoading(false)
    setIsThinking(false)
    setThinkingSteps([])
    setReasoningText(null)
    setSearchResults([])
    setAttachedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Clear file input
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() && !attachedFile) return

    if (!isLoggedIn || !token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send messages.",
        variant: "destructive",
      })
      return
    }

    const isNewChatSession = messages.length === 0 // Check if this is the first message in the session

    // Optimistic UI: Add user message immediately with 'pending' status
    let userMessage: Message = { role: "user", content: input, status: "pending" }
    const assistantPlaceholder: Message = { role: "assistant", content: "", status: "pending" }

    // Handle image preview for user message
    if (attachedFile) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          userMessage = { ...userMessage, imageUrl: event.target.result as string }
          setMessages((prev) => [...prev, userMessage, assistantPlaceholder])
        }
      }
      reader.readAsDataURL(attachedFile)
    } else {
      setMessages((prev) => [...prev, userMessage, assistantPlaceholder])
    }

    setInput("")
    setAttachedFile(null) // Clear attached file after adding to message
    setIsLoading(true)
    setIsThinking(true) // Start thinking
    setThinkingSteps([])
    setSearchResults([])
    setReasoningText(null) // Clear previous reasoning

    const formData = new FormData()
    formData.append("message", input)
    console.log("Value of selectedModel being sent:", selectedModel)
    formData.append("model", selectedModel)
    formData.append("enableSearch", enableSearch ? "1" : "0")
    formData.append("extendedThinking", extendedThinking ? "1" : "0")
    if (attachedFile) {
      formData.append("image", attachedFile)
    }

    try {
      const response = await fetch("https://kimi-r36z.onrender.com/api/chat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        // If response is not OK, mark the user message as failed or remove it
        setMessages((prev) =>
          prev.map((msg) =>
            msg === userMessage ? { ...msg, status: "sent", content: msg.content + " (Failed to send)" } : msg,
          ),
        )
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Mark the optimistic user message as 'sent' once the server responds successfully
      setMessages((prev) => prev.map((msg) => (msg === userMessage ? { ...msg, status: "sent" } : msg)))

      if (attachedFile) {
        // PATH 1: IMAGE UPLOAD (Expect JSON)
        const data = await response.json()
        console.log("Image upload JSON response:", data)

        setMessages((prev) =>
          prev.map((msg, idx) =>
            idx === prev.length - 1 && msg.role === "assistant" && msg.status === "pending"
              ? { ...msg, content: data.message || "Image processed.", status: "sent" }
              : msg,
          ),
        )
        setIsLoading(false)
        setIsThinking(false)
        setThinkingSteps([])
        setSearchResults([])
        setReasoningText(null)
        if (isNewChatSession && onNewConversationCreated) {
          onNewConversationCreated() // Trigger history refresh for new chat
        }
      } else {
        // PATH 2: TEXT CHAT (Expect Stream)
        const reader = response.body!.getReader()
        const decoder = new TextDecoder("utf-8")
        let buffer = ""
        let assistantResponse = ""
        let currentEventType: string | null = null

        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            setIsLoading(false)
            setIsThinking(false) // Ensure thinking is off at the end
            setThinkingSteps([])
            if (isNewChatSession && onNewConversationCreated) {
              onNewConversationCreated() // Trigger history refresh for new chat
            }
            break
          }

          buffer += decoder.decode(value, { stream: true })

          const boundary = buffer.lastIndexOf("\n")
          if (boundary === -1) continue

          const completeLines = buffer.substring(0, boundary)
          buffer = buffer.substring(boundary + 1)

          const lines = completeLines.split("\n").filter((line) => line.trim() !== "")

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEventType = line.substring("event: ".length).trim()
            } else if (line.startsWith("data: ")) {
              if (currentEventType) {
                try {
                  // Use regex to robustly extract JSON content after "data: "
                  const dataMatch = line.match(/data:\s*(.*)/)
                  let jsonStr = ""
                  if (dataMatch && dataMatch[1]) {
                    jsonStr = dataMatch[1].trim()
                  } else {
                    // Fallback, though this case should ideally not be hit if line.startsWith("data: ") is true
                    jsonStr = line.substring("data: ".length).trim()
                  }

                  console.log("Attempting to parse JSON string:", jsonStr)
                  if (jsonStr === "[DONE]") {
                    currentEventType = null
                    continue
                  }

                  const data = JSON.parse(jsonStr)

                  switch (currentEventType) {
                    case "metadata":
                      break
                    case "thinking":
                      // Only update thinking steps if reasoning hasn't started
                      if (!reasoningText) {
                        setThinkingSteps((prev) => {
                          const newSteps = [...prev]
                          if (newSteps.length > 0 && newSteps[newSteps.length - 1] === data.step) {
                            return newSteps
                          }
                          return [...newSteps, data.step]
                        })
                      }
                      break
                    case "reasoning":
                      setReasoningText(data.reasoning)
                      setIsThinking(false) // Stop thinking animation once reasoning starts
                      setThinkingSteps([]) // Clear thinking steps
                      break
                    case "search_results":
                      setSearchResults(data.results)
                      setIsThinking(false) // Stop thinking animation once search results are here
                      setThinkingSteps([]) // Clear thinking steps
                      break
                    case "token":
                      assistantResponse += data.token
                      setMessages((prev) => {
                        const lastMessage = prev[prev.length - 1]
                        if (lastMessage && lastMessage.role === "assistant") {
                          return [...prev.slice(0, prev.length - 1), { ...lastMessage, content: assistantResponse }]
                        } else {
                          // This case should ideally not be hit if assistantPlaceholder is added correctly
                          return [...prev, { role: "assistant", content: assistantResponse }]
                        }
                      })
                      setIsThinking(false) // Stop thinking animation once tokens start
                      setThinkingSteps([]) // Clear thinking steps
                      break
                    case "error":
                      throw new Error(data.message || "An AI error occurred.")
                  }
                } catch (e) {
                  console.error("Error parsing stream data:", line, e)
                } finally {
                  currentEventType = null
                }
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Chat stream error:", error)
      setIsLoading(false)
      setIsThinking(false)
      setThinkingSteps([])
      setSearchResults([])
      setReasoningText(null) // Clear reasoning on error
      // If an error occurs, ensure the optimistic message is marked as failed or removed
      setMessages((prev) =>
        prev.map((msg, idx) => {
          if (idx === prev.length - 1 && msg.role === "assistant" && msg.status === "pending") {
            return { ...msg, content: `Error: ${error.message || "Failed to get response."}`, status: "sent" }
          }
          return msg.status === "pending" ? { ...msg, status: "sent", content: msg.content + " (Failed to send)" } : msg
        }),
      )
      if (!error.message.includes("Unauthorized")) {
        toast({
          title: "Chat Error",
          description: error.message || "Failed to get response from AI.",
          variant: "destructive",
        })
      }
    }
  }

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    isThinking,
    thinkingSteps,
    reasoningText, // Expose reasoningText
    selectedModel,
    setSelectedModel,
    enableSearch,
    setEnableSearch,
    extendedThinking,
    setExtendedThinking,
    models, // This now represents the filtered list
    handleFileChange,
    fileInputRef,
    attachedFile,
    setAttachedFile,
    searchResults,
    resetChat, // Expose resetChat
  }
}

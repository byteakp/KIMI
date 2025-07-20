"use client"

import * as React from "react"
import { useSidebar } from "@/components/ui/sidebar"
import { ChatMessages } from "@/components/chat-messages"
import { SuggestionChips } from "@/components/suggestion-chips"
import { useChat } from "@/hooks/use-chat"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"
import { ChatInputBar } from "@/components/chat-input-bar"
import { useChatHistory } from "@/context/chat-history-context"
import { AppSidebar } from "@/components/app-sidebar"

export default function HomePage() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    isThinking,
    thinkingSteps,
    reasoningText,
    selectedModel,
    setSelectedModel,
    enableSearch,
    setEnableSearch,
    extendedThinking,
    setExtendedThinking,
    models,
    handleFileChange,
    fileInputRef,
    attachedFile,
    setAttachedFile,
    searchResults,
    resetChat,
  } = useChat({
    onNewConversationCreated: useChatHistory().fetchChatHistory,
  })

  const [showInitialView, setShowInitialView] = React.useState(messages.length === 0)

  React.useEffect(() => {
    setShowInitialView(messages.length === 0)
  }, [messages])

  const handleSuggestionClick = (suggestion: string) => {
    handleInputChange({ target: { value: suggestion } } as React.ChangeEvent<HTMLTextAreaElement>)
    const form = document.getElementById("chat-form") as HTMLFormElement
    if (form) {
      handleSubmit(new Event("submit", { bubbles: true }) as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  const handleNewChatClick = () => {
    resetChat()
    setShowInitialView(true)
  }

  // Helper object to avoid repeating props
  const chatInputProps = {
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    selectedModel,
    setSelectedModel,
    enableSearch,
    setEnableSearch,
    extendedThinking,
    setExtendedThinking,
    models,
    handleFileChange,
    fileInputRef,
    attachedFile,
    setAttachedFile,
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <AppSidebar onNewChatClick={handleNewChatClick} />

      {/* Main Content Area */}
      <main className="flex h-screen flex-1 flex-col transition-all duration-300 ease-in-out">
        {showInitialView ? (
          // --- INITIAL VIEW ---
          <div className="flex flex-grow flex-col items-center justify-center">
            <div className="text-center">
              <h1 className="mb-4 text-7xl font-bold">KIMI</h1>
              {/* --- THIS IS THE UPDATED SUBTITLE --- */}
              <p className="text-sm text-muted-foreground">
                An open-source project by byteakp. Login is required to save chat history and use the AI models.
              </p>
            </div>
            <div className="w-full max-w-4xl p-4">
              <ChatInputBar {...chatInputProps} />
              <SuggestionChips onChipClick={handleSuggestionClick} />
            </div>
          </div>
        ) : (
          // --- CHAT VIEW ---
          <>
            <div className="flex-grow overflow-y-auto p-4">
              <div className="mx-auto max-w-4xl space-y-4">
                <ChatMessages
                  messages={messages}
                  thinkingSteps={thinkingSteps}
                  isLoading={isLoading}
                  isThinking={isThinking}
                  searchResults={searchResults}
                  reasoningText={reasoningText}
                />
              </div>
            </div>
            <div className="w-full flex-shrink-0 p-4">
              <ChatInputBar {...chatInputProps} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

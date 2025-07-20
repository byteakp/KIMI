"use client"

import * as React from "react"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { ChatMessages } from "@/components/chat-messages"
import { SuggestionChips } from "@/components/suggestion-chips"
import { useChat } from "@/hooks/use-chat"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"
import { ChatInputBar } from "@/components/chat-input-bar"
import { useChatHistory } from "@/context/chat-history-context" // Import useChatHistory
import { AppSidebar } from "@/components/app-sidebar" // Ensure AppSidebar is imported

export default function HomePage() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    isThinking, // Destructure isThinking
    thinkingSteps,
    reasoningText, // Destructure reasoningText
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
    resetChat, // Get resetChat from useChat
  } = useChat({
    onNewConversationCreated: useChatHistory().fetchChatHistory, // Pass fetchChatHistory as callback
  })
  const { isLoggedIn } = useAuth()
  const [showInitialView, setShowInitialView] = React.useState(true)
  const { isOpen } = useSidebar()

  const [researcherMode, setResearcherMode] = React.useState(false)

  React.useEffect(() => {
    // Switch to chat view if messages exist
    if (messages.length > 0) {
      setShowInitialView(false)
    } else {
      setShowInitialView(true)
    }
  }, [messages])

  const handleSuggestionClick = (suggestion: string) => {
    handleInputChange({ target: { value: suggestion } } as React.ChangeEvent<HTMLTextAreaElement>)
    handleSubmit(new Event("submit") as unknown as React.FormEvent<HTMLFormElement>)
  }

  const handleNewChatClick = () => {
    resetChat() // Reset chat data
    setShowInitialView(true) // Show initial view
    // Sidebar will automatically re-fetch history via onNewConversationCreated callback
  }

  return (
    <div
      id="app-container" // Added ID for CSS targeting
      className={cn(
        "flex-1 bg-charcoal text-light-gray transition-all duration-300 ease-in-out",
        isOpen ? "ml-64" : "ml-0",
        showInitialView ? "initial-view" : "chat-view", // Apply dynamic classes
      )}
    >
      {!isOpen && (
        <div className="absolute top-4 left-4 z-[99]">
          <SidebarTrigger tooltip="Toggle Sidebar" />
        </div>
      )}

      {/* Pass onNewChatClick to AppSidebar */}
      <AppSidebar onNewChatClick={handleNewChatClick} />

      {/* Welcome Screen (visible only in initial view) */}
      <div id="welcome-screen" className={cn("text-center", !showInitialView && "hidden")}>
        <h1 className="text-7xl font-bold text-light-gray mb-4 animate-kimi-pulse">KIMI</h1>
        <p className="text-sm text-muted-foreground">An open-source project by byteakp. Login is required to save chat history and use the AI models.</p>
      </div>

      {/* Chat Log (visible only in chat view) */}
      <div id="chat-log" className={cn(showInitialView && "hidden", "flex-grow p-4 overflow-y-auto")}>
        {!showInitialView && (
          <div id="message-container" className="max-w-4xl mx-auto space-y-4">
            <ChatMessages
              messages={messages}
              thinkingSteps={thinkingSteps}
              isLoading={isLoading}
              isThinking={isThinking} // Pass isThinking
              searchResults={searchResults}
              reasoningText={reasoningText} // Pass reasoningText
            />
          </div>
        )}
      </div>

      {/* Input Area (always present, but positioned differently) */}
      <div id="input-area" className="w-full flex flex-col items-center p-4 pb-8">
        <ChatInputBar
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          enableSearch={enableSearch}
          setEnableSearch={setEnableSearch}
          extendedThinking={extendedThinking}
          setExtendedThinking={setExtendedThinking}
          models={models}
          handleFileChange={handleFileChange}
          fileInputRef={fileInputRef}
          attachedFile={attachedFile}
          setAttachedFile={setAttachedFile}
          researcherMode={researcherMode}
          setResearcherMode={setResearcherMode}
        />
        {showInitialView && <SuggestionChips onChipClick={handleSuggestionClick} />}
      </div>
    </div>
  )
}

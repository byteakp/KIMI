"use client"

import * as React from "react"
import type { Message, SearchResult } from "@/hooks/use-chat"
import { cn } from "@/lib/utils"
import { User2, Bot, Copy, Check, Link } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image" // Import Image component

interface ChatMessagesProps {
  messages: Message[]
  thinkingSteps: string[]
  isLoading: boolean
  isThinking: boolean
  searchResults: SearchResult[]
  reasoningText: string | null // Added reasoningText prop
}

export function ChatMessages({
  messages,
  thinkingSteps,
  isLoading,
  isThinking,
  searchResults,
  reasoningText, // Destructure reasoningText
}: ChatMessagesProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const chatLogRef = React.useRef<HTMLDivElement | null>(null) // Ref for the scrollable chat log container

  // Use useLayoutEffect to assign the chatLogRef after DOM mutations but before browser paints
  React.useLayoutEffect(() => {
    if (messagesEndRef.current) {
      // Assuming the parent with id="chat-log" is the scrollable container
      chatLogRef.current = messagesEndRef.current.closest("#chat-log") as HTMLDivElement
    }
  }, []) // Run once on mount

  const scrollToBottom = React.useCallback(() => {
    requestAnimationFrame(() => {
      const chatLogElement = chatLogRef.current
      const messagesEndElement = messagesEndRef.current

      if (chatLogElement && messagesEndElement) {
        // Check if the user is already near the bottom (within 100px buffer)
        // or if it's the very first message (to ensure initial scroll)
        const isAtBottom = chatLogElement.scrollHeight - chatLogElement.scrollTop <= chatLogElement.clientHeight + 100

        if (isAtBottom || messages.length === 1) {
          messagesEndElement.scrollIntoView({ behavior: "smooth" })
        }
      }
    })
  }, [messages.length]) // Depend on messages.length to trigger for new messages

  React.useEffect(() => {
    scrollToBottom()
  }, [messages, thinkingSteps, isLoading, isThinking, searchResults, reasoningText, scrollToBottom]) // Added reasoningText to dependencies

  return (
    <div className="flex flex-col w-full">
      {messages.map((message, index) => (
        <div
          key={index}
          className={cn(
            "flex items-start gap-3 my-2 chat-bubble", // Added chat-bubble class
            message.role === "user" ? "justify-end" : "justify-start",
            message.status === "pending" && "opacity-50", // Apply opacity for pending messages
          )}
        >
          {message.role === "assistant" && (
            <div
              className={cn(
                "flex-shrink-0 p-2 rounded-full bg-purple text-primary-foreground",
                // Apply animations based on state
                isThinking && "ai-icon-breathing-glow", // Thinking/Reasoning state
                isLoading && !isThinking && "ai-icon-gradient-ring", // Typing/Streaming state
              )}
            >
              <Bot className="h-5 w-5" />
            </div>
          )}
          <div
            className={cn(
              "rounded-xl p-3 max-w-[80%]",
              message.role === "user"
                ? "bg-purple text-primary-foreground rounded-bl-none"
                : "bg-card text-card-foreground border border-border rounded-xl", // FIX: Changed rounded-br-none to rounded-xl for consistent corners
            )}
          >
            {message.role === "user" && message.imageUrl && (
              <div className="mb-2">
                <Image
                  src={message.imageUrl || "/placeholder.svg"}
                  alt="User uploaded image"
                  width={200} // Adjust as needed
                  height={200} // Adjust as needed
                  className="rounded-lg object-cover max-w-full h-auto"
                />
              </div>
            )}
            <MarkdownRenderer content={message.content} />
          </div>
          {message.role === "user" && (
            <div className="flex-shrink-0 p-2 rounded-full bg-muted text-muted-foreground">
              <User2 className="h-5 w-5" />
            </div>
          )}
        </div>
      ))}
      {/* Display Reasoning Text */}
      {reasoningText && (
        <div className="flex items-start gap-3 justify-start my-2 chat-bubble">
          <div
            className={cn(
              "flex-shrink-0 p-2 rounded-full bg-purple text-primary-foreground",
              isThinking && "ai-icon-breathing-glow", // Apply glow if still thinking/reasoning
            )}
          >
            <Bot className="h-5 w-5" />
          </div>
          <Card className="rounded-xl p-3 max-w-[80%] bg-card text-card-foreground border border-border">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-lg font-semibold">Reasoning</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-sm text-muted-foreground">
              <MarkdownRenderer content={reasoningText} />
            </CardContent>
          </Card>
        </div>
      )}
      {/* Display Search Results */}
      {searchResults.length > 0 && (
        <div className="flex items-start gap-3 justify-start my-2 chat-bubble">
          {" "}
          {/* Added chat-bubble class */}
          <div
            className={cn(
              "flex-shrink-0 p-2 rounded-full bg-purple text-primary-foreground",
              isLoading && !isThinking && "ai-icon-gradient-ring", // Apply gradient if still loading after search
            )}
          >
            <Bot className="h-5 w-5" />
          </div>
          <Card className="rounded-xl p-3 max-w-[80%] bg-card text-card-foreground border border-border">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-lg font-semibold">Search Results</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {searchResults.map((result, idx) => (
                <div key={idx} className="text-sm">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple hover:underline flex items-center gap-1"
                  >
                    <Link className="h-4 w-4" />
                    <span className="font-medium">{result.title}</span>
                  </a>
                  <p className="text-muted-foreground text-xs mt-1">{result.snippet}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
      {isThinking && thinkingSteps.length > 0 && (
        <div className="flex items-start gap-3 justify-start my-2 chat-bubble">
          {" "}
          {/* Added chat-bubble class */}
          <div
            className={cn(
              "flex-shrink-0 p-2 rounded-full bg-purple text-primary-foreground",
              "ai-icon-breathing-glow", // Always apply glow for thinking steps
            )}
          >
            <Bot className="h-5 w-5" />
          </div>
          <div className="rounded-lg p-3 max-w-[80%] bg-secondary text-secondary-foreground rounded-bl-none border border-border animate-pulse">
            <p className="text-sm font-medium italic">
              {thinkingSteps[thinkingSteps.length - 1]}...
              <span className="typing-cursor" /> {/* Blinking cursor */}
            </p>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}

interface MarkdownRendererProps {
  content: string
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null)

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000) // Reset after 2 seconds
  }

  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "")
          const codeContent = String(children).replace(/\n$/, "")
          return !inline && match ? (
            <div className="relative">
              <SyntaxHighlighter style={coldarkDark} language={match[1]} PreTag="div" {...props}>
                {codeContent}
              </SyntaxHighlighter>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 text-xs px-2 py-1 h-auto bg-muted hover:bg-muted-foreground text-muted-foreground hover:text-primary-foreground"
                onClick={() => handleCopy(codeContent)}
              >
                {copiedCode === codeContent ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                {copiedCode === codeContent ? "Copied!" : "Copy"}
              </Button>
            </div>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          )
        },
        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2 last:mb-0" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2 last:mb-0" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        a: ({ node, ...props }) => <a className="text-purple hover:underline" {...props} />,
        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-2 mt-4" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-2 mt-3" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-1 mt-2" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

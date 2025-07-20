import type React from "react"
import type { Metadata } from "next/types"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"

import { cn } from "@/lib/utils"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthProvider } from "@/context/auth-context"
import { ChatHistoryProvider } from "@/context/chat-history-context" // Import new provider

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KIMI - Your AI Research Assistant",
  description: "An AI-powered research assistant.",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen font-sans antialiased", inter.className)}>
        <AuthProvider>
          <ChatHistoryProvider>
            {" "}
            {/* Wrap AuthProvider with ChatHistoryProvider */}
            <SidebarProvider defaultOpen={defaultOpen}>
              <div className="flex min-h-screen w-full bg-charcoal text-light-gray">
                <AppSidebar />
                {children}
              </div>
            </SidebarProvider>
          </ChatHistoryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

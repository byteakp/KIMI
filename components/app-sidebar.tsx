"use client"

import { SidebarMenuSkeleton } from "@/components/ui/sidebar"

import * as React from "react"
import { ChevronUp, LogOut, Plus, User2 } from "lucide-react"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger, // Import SidebarTrigger here
  useSidebar,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/auth-context"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { cn } from "@/lib/utils"
import { useChatHistory } from "@/context/chat-history-context" // Import useChatHistory

interface AppSidebarProps {
  onNewChatClick: () => void
}

export function AppSidebar({ onNewChatClick }: AppSidebarProps) {
  const { isLoggedIn, username, logout } = useAuth()
  const { chatHistory, isLoadingHistory } = useChatHistory() // Use chat history from context
  const [showAuthModal, setShowAuthModal] = React.useState(false)
  const [isLogin, setIsLogin] = React.useState(true) // true for login, false for register
  const pathname = usePathname()
  const { isOpen, toggleSidebar } = useSidebar()

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    // In a real app, you'd likely refetch chat history here
  }

  return (
    <>
      <Sidebar
        variant="sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-0",
        )}
      >
        {isOpen && (
          <div className="flex h-full w-full flex-col">
            {/* KIMI branding and instructions */}
            <div className="flex flex-col items-center justify-center py-4 border-b border-border">
              <span className="text-2xl font-bold tracking-tight text-purple">KIMI</span>
              <span className="text-xs text-muted-foreground mb-1">Made by ByteAKP</span>
              <span className="text-xs text-muted-foreground text-center px-2">
                First, <span className="font-semibold text-purple">log in</span>.<br />
                Then you can use the AI models for <span className="font-semibold text-green-600">free</span>!
              </span>
            </div>

            <SidebarHeader className="flex items-center justify-between p-2">
              {/* SidebarTrigger inside the header when sidebar is open */}
              <SidebarTrigger tooltip="Toggle Sidebar" />
              <SidebarMenu className="flex-1">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => {
                      onNewChatClick() // Call the prop function
                      if (window.innerWidth < 768) {
                        toggleSidebar()
                      }
                    }}
                  >
                    <Plus />
                    <span>New Chat</span>
                    <span className="ml-auto text-xs text-muted-foreground">Ctrl K</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Chat History</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {isLoadingHistory ? (
                      // Display skeleton loaders while loading history
                      Array.from({ length: 5 }).map((_, i) => (
                        <SidebarMenuItem key={`skeleton-${i}`}>
                          <SidebarMenuSkeleton showIcon />
                        </SidebarMenuItem>
                      ))
                    ) : isLoggedIn && chatHistory.length > 0 ? (
                      chatHistory.map((item) => (
                        <SidebarMenuItem key={item._id}>
                          {/* FIX: Removed extraneous whitespace here */}
                          <SidebarMenuButton asChild isActive={pathname === `/chat/${item._id}`}>
                            {/* FIX: Removed extraneous whitespace here */}
                            <a href={`/chat/${item._id}`}>
                              <span>{item.title}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))
                    ) : isLoggedIn && chatHistory.length === 0 ? (
                      <SidebarMenuItem>
                        <span className="text-sm text-muted-foreground p-2">No chat history yet.</span>
                      </SidebarMenuItem>
                    ) : (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => {
                            setIsLogin(true)
                            setShowAuthModal(true)
                          }}
                        >
                          <User2 />
                          <span>Log in to sync chat history</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  {isLoggedIn ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center w-full text-left p-2 rounded-md text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                          <User2 className="mr-2 h-5 w-5" />
                          <span className="flex-grow">{username || "User"}</span>
                          <ChevronUp className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        side="top"
                        className="w-[--radix-popper-anchor-width] bg-card text-card-foreground border-border"
                      >
                        <DropdownMenuItem className="hover:bg-accent hover:text-accent-foreground cursor-pointer">
                          <span>Account</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-accent hover:text-accent-foreground cursor-pointer">
                          <span>Billing</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={logout}
                          className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Sign out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <SidebarMenuButton
                      onClick={() => {
                        setIsLogin(true)
                        setShowAuthModal(true)
                      }}
                    >
                      <User2 />
                      <span>Log In</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </div>
        )}
      </Sidebar>

      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="bg-card text-card-foreground border-border p-6 rounded-lg max-w-md w-full">
          <DialogTitle className="sr-only">Authentication</DialogTitle>
          <DialogDescription className="sr-only">
            Log in or register to continue to your account.
          </DialogDescription>
          {isLogin ? (
            <LoginForm onSuccess={handleAuthSuccess} onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSuccess={handleAuthSuccess} onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

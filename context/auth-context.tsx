"use client"

import * as React from "react"
import { api } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

interface AuthContextType {
  isLoggedIn: boolean
  username: string | null
  token: string | null
  login: (token: string, username: string) => void
  logout: () => void
  checkAuth: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [username, setUsername] = React.useState<string | null>(null)
  const [token, setToken] = React.useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true)

  const login = (newToken: string, newUsername: string) => {
    localStorage.setItem("jwt_token", newToken)
    localStorage.setItem("username", newUsername)
    setToken(newToken)
    setUsername(newUsername)
    setIsLoggedIn(true)
  }

  const logout = () => {
    localStorage.removeItem("jwt_token")
    localStorage.removeItem("username")
    setToken(null)
    setUsername(null)
    setIsLoggedIn(false)
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  const checkAuth = React.useCallback(async () => {
    setIsCheckingAuth(true)
    const storedToken = localStorage.getItem("jwt_token")
    const storedUsername = localStorage.getItem("username")

    if (storedToken) {
      try {
        // Validate token with backend
        const response = await api.get("/api/auth/profile", storedToken)
        if (response.username) {
          setToken(storedToken)
          setUsername(response.username)
          setIsLoggedIn(true)
        } else {
          // Token invalid or expired
          logout()
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        logout()
      }
    }
    setIsCheckingAuth(false)
  }, [])

  React.useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const value = React.useMemo(
    () => ({
      isLoggedIn,
      username,
      token,
      login,
      logout,
      checkAuth,
    }),
    [isLoggedIn, username, token, checkAuth],
  )

  if (isCheckingAuth) {
    // Optionally render a loading spinner or null while checking auth
    return null
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

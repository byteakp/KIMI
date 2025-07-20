"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import { toast } from "@/hooks/use-toast"

interface LoginFormProps {
  onSuccess: () => void
  onSwitchToRegister: () => void
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await api.post("/api/auth/login", { email, password })
      if (response.token) {
        login(response.token, response.username || email)
        toast({
          title: "Logged in successfully!",
          description: `Welcome back, ${response.username || email}.`,
        })
        onSuccess()
      } else {
        throw new Error("Login failed: No token received.")
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-2xl font-bold text-center text-light-gray">Log In</h3>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-muted border-border text-light-gray placeholder:text-muted-foreground"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-muted border-border text-light-gray placeholder:text-muted-foreground"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-purple hover:bg-purple-dark text-primary-foreground"
        disabled={isLoading}
      >
        {isLoading ? "Logging In..." : "Log In"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Button
          variant="link"
          type="button"
          onClick={onSwitchToRegister}
          className="text-purple hover:text-purple-light p-0 h-auto"
        >
          Register
        </Button>
      </p>
    </form>
  )
}

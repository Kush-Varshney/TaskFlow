"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/forms/AuthForm"
import { useAuth } from "@/contexts/AuthContext"

export default function SignupPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup")
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">SvaraAI</h1>
          <p className="text-muted-foreground">Task Management System</p>
        </div>

        <AuthForm mode={mode} onToggleMode={() => setMode(mode === "login" ? "signup" : "login")} />
      </div>
    </div>
  )
}

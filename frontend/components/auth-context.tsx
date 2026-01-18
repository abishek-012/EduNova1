"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type UserRole = "admin" | "teacher" | "student"

interface User {
  email: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  isAuthChecked: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthChecked, setIsAuthChecked] = useState(false)

  // 🔹 Decode JWT payload (no verification, backend already verified)
  const decodeToken = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload
    } catch {
      return null
    }
  }

  // 🔹 On app load → restore session from JWT
  useEffect(() => {
    const token = localStorage.getItem("edunova-token")
    if (token) {
      const payload = decodeToken(token)
      if (payload?.email && payload?.user_type) {
        setUser({
          email: payload.email,
          role: payload.user_type,
        })
      } else {
        localStorage.removeItem("edunova-token")
      }
    }
    setIsAuthChecked(true)
    setIsLoading(false)
  }, [])

  // 🔹 REAL login using backend
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) return false

      const data = await res.json()
      const token = data.token

      const payload = decodeToken(token)
      if (!payload?.email || !payload?.user_type) return false

      // 🔐 Save JWT
      localStorage.setItem("edunova-token", token)

      // 🔹 Set user from JWT (backend is source of truth)
      setUser({
        email: payload.email,
        role: payload.user_type,
      })

      return true
    } catch (err) {
      console.error("Login error:", err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // 🔹 Logout = destroy JWT
  const logout = () => {
    localStorage.removeItem("edunova-token")
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        isAuthChecked,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export type { UserRole }

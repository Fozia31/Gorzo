"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export type UserRole = "woman" | "doctor" | "admin" | null
export type SubscriptionTier = "free" | "premium"

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  tier: SubscriptionTier
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  updateTier: (tier: SubscriptionTier) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
  }

  const updateTier = (tier: SubscriptionTier) => {
    if (user) {
      setUser({ ...user, tier })
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        login, 
        logout,
        updateTier
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

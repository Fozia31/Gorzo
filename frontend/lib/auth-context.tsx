"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { registerUser } from "../api/userApi"

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
  register: (userData: { displayName: string; email: string; password: string; isPremium?: boolean }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("auth_user")
      return stored ? (JSON.parse(stored) as User) : null
    } catch {
      return null
    }
  })

  const login = (userData: User) => {
    setUser(userData)
    try {
      localStorage.setItem("auth_user", JSON.stringify(userData))
    } catch {
      // ignore storage errors
    }
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem("auth_user")
    } catch {
      // ignore storage errors
    }
  }

  const updateTier = (tier: SubscriptionTier) => {
    if (user) {
      setUser({ ...user, tier })
    }
  }

  const register = async (userData: { displayName: string; email: string; password: string; isPremium?: boolean }) => {
    const response = await registerUser(userData);
    const backendUser = response.data;
    const frontendUser: User = {
      id: backendUser._id,
      username: backendUser.displayName,
      email: backendUser.email,
      role: backendUser.role === 'User' ? 'woman' : null,
      tier: backendUser.isPremium ? 'premium' : 'free',
    };
    login(frontendUser);
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        login, 
        logout,
        updateTier,
        register
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

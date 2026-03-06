"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  Users,
  BookOpen,
  MessageCircle,
  FileText,
  Mic,
  Inbox,
  UserCog,
  Flag,
  LogOut,
  Crown,
} from "lucide-react"
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
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const womanNavItems = [
  { title: "Home", icon: Home, href: "/dashboard" },
  { title: "Posts", icon: Users, href: "/dashboard/forum" },
  { title: "Knowledge Hub", icon: BookOpen, href: "/dashboard/knowledge" },
  { title: "Consulting", icon: MessageCircle, href: "/dashboard/consulting" },
]

const doctorNavItems = [
  { title: "Content Creator", icon: FileText, href: "/doctor" },
  { title: "Voice Notes", icon: Mic, href: "/doctor/voice-notes" },
  { title: "Premium Chat Queue", icon: Inbox, href: "/doctor/chats" },
]

const adminNavItems = [
  { title: "Doctor Management", icon: UserCog, href: "/admin" },
  { title: "Moderation Queue", icon: Flag, href: "/admin/moderation" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const getNavItems = () => {
    switch (user?.role) {
      case "doctor":
        return doctorNavItems
      case "admin":
        return adminNavItems
      default:
        return womanNavItems
    }
  }

  const navItems = getNavItems()
  const roleLabel = user?.role === "doctor" ? "Doctor Portal" : user?.role === "admin" ? "Admin Portal" : "My Wellness"

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href={user?.role === "doctor" ? "/doctor" : user?.role === "admin" ? "/admin" : "/dashboard"} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
            <span className="font-serif text-lg font-bold text-secondary-foreground">G</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-semibold tracking-tight text-sidebar-foreground">Gorzo</span>
            <span className="text-xs text-sidebar-foreground/60">Women&apos;s Health</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">{roleLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarSeparator className="mb-4" />
        {user && (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-sidebar-accent">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-sidebar-foreground">
                  {user.username}
                </span>
                {user.role === "woman" && user.tier === "premium" && (
                  <Crown className="h-3 w-3 text-secondary" />
                )}
              </div>
              <span className="text-xs text-sidebar-foreground/60 capitalize">
                {user.role === "woman" ? user.tier : user.role}
              </span>
            </div>
            <SidebarMenuButton
              onClick={handleLogout}
              className="ml-auto h-8 w-8 shrink-0"
              tooltip="Sign Out"
            >
              <LogOut className="size-4" />
            </SidebarMenuButton>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

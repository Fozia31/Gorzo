"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { 
  Heart, 
  BookOpen, 
  PlayCircle,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Crown
} from "lucide-react"
import Link from "next/link"

// Sample knowledge hub articles
const newArticles = [
  {
    id: 1,
    title: "Understanding Your Hormonal Cycle",
    author: "Dr. Amara",
    category: "Hormones",
    hasVoiceNote: true,
    readTime: "5 min",
  },
  {
    id: 2,
    title: "Nutrition Tips for Each Phase of Your Cycle",
    author: "Dr. Selam",
    category: "Nutrition",
    hasVoiceNote: true,
    readTime: "8 min",
  },
  {
    id: 3,
    title: "Managing Stress and Its Impact on Fertility",
    author: "Dr. Hana",
    category: "Mental Health",
    hasVoiceNote: false,
    readTime: "6 min",
  },
]

// Sample recent forum activity
const recentForumActivity = [
  {
    id: 1,
    title: "Natural remedies for menstrual cramps",
    replies: 34,
    timeAgo: "2h ago",
  },
  {
    id: 2,
    title: "PCOS diagnosis - feeling overwhelmed",
    replies: 67,
    timeAgo: "5h ago",
  },
  {
    id: 3,
    title: "How to talk to your partner about fertility",
    replies: 28,
    timeAgo: "1d ago",
  },
]

export default function DashboardPage() {
  const { user } = useAuth()

  // If you need to refresh the user from the backend you could call an
  // endpoint like `/api/users/:id` here using the `user?.id` value. That
  // would replace the static demo login below, but since registration already
  // logs the backend response into context, nothing extra is required.
  //
  // We removed the hard‑coded login so the page displays whatever user the
  // context currently holds (including the one set during registration).


  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
          Welcome back, {user?.username || "User"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s your wellness overview for today
        </p>
      </div>

      {/* Premium Banner for Free Users */}
      {user?.tier === "free" && (
        <Card className="overflow-hidden border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-primary/20 p-3">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Upgrade to Premium</h3>
              <p className="text-sm text-muted-foreground">
                Get direct access to doctors and personalized consultations
              </p>
            </div>
            <Link href="/dashboard/consulting">
              <Button size="sm" className="shrink-0">
                Learn More
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Link href="/dashboard/forum">
          <Card className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="mb-2 rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-center text-xs">Discuss with Sisters</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/knowledge">
          <Card className="group cursor-pointer transition-all hover:border-secondary/50 hover:shadow-md">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="mb-2 rounded-full bg-secondary/30 p-3 transition-colors group-hover:bg-secondary/50">
                <BookOpen className="h-5 w-5 text-secondary-foreground" />
              </div>
              <span className="text-sm font-medium">Knowledge</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/consulting">
          <Card className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="mb-2 rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Consult</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/chatbot">
          <Card className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="mb-2 rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Ask EFOY</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Forum Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg">Active Discussions</CardTitle>
            <CardDescription>Popular topics in the community</CardDescription>
          </div>
          <Link href="/dashboard/forum">
            <Button variant="ghost" size="sm" className="gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentForumActivity.map((topic) => (
            <Link key={topic.id} href="/dashboard/forum">
              <div className="group flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium leading-tight group-hover:text-primary">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {topic.replies} replies • {topic.timeAgo}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* New in Knowledge Hub */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg">New in Knowledge Hub</CardTitle>
            <CardDescription>Latest articles from our doctors</CardDescription>
          </div>
          <Link href="/dashboard/knowledge">
            <Button variant="ghost" size="sm" className="gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {newArticles.map((article) => (
            <Link key={article.id} href={`/dashboard/knowledge/${article.id}`}>
              <div className="group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium leading-tight group-hover:text-primary">
                      {article.title}
                    </h3>
                    {article.hasVoiceNote && (
                      <PlayCircle className="h-4 w-4 shrink-0 text-secondary-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{article.author}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                    <Badge variant="outline" className="h-5 text-[10px]">
                      {article.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

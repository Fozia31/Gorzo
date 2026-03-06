"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MessageCircle, 
  Heart, 
  Flag, 
  MoreHorizontal, 
  Plus,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Sample forum posts
const forumPosts = [
  {
    id: 1,
    username: "BloomingFlower",
    avatar: "BF",
    title: "First time experiencing irregular cycles - need advice",
    content: "Hi sisters, I'm 28 and for the first time my cycle has been very irregular. Last month it was 35 days, this month 24. Should I be worried?",
    category: "Menstrual Health",
    likes: 24,
    comments: 12,
    timeAgo: "2h ago",
    isLiked: false,
  },
  {
    id: 2,
    username: "HopefulMama",
    avatar: "HM",
    title: "Natural remedies for menstrual cramps that actually work",
    content: "After years of struggling, I finally found some natural remedies that help with my cramps. Sharing my experience: 1. Ginger tea with honey 30 min before...",
    category: "Pain Management",
    likes: 87,
    comments: 34,
    timeAgo: "5h ago",
    isLiked: true,
  },
  {
    id: 3,
    username: "WellnessJourney",
    avatar: "WJ",
    title: "How do you talk to your partner about fertility?",
    content: "My husband and I are starting to think about having children. How did you approach the conversation about fertility and timing with your partners?",
    category: "Relationships",
    likes: 45,
    comments: 28,
    timeAgo: "1d ago",
    isLiked: false,
  },
  {
    id: 4,
    username: "StrongSister",
    avatar: "SS",
    title: "PCOS diagnosis - feeling overwhelmed",
    content: "Just got diagnosed with PCOS last week. I'm feeling a bit lost and would love to hear from others who have been through this. What should I expect?",
    category: "Conditions",
    likes: 156,
    comments: 67,
    timeAgo: "2d ago",
    isLiked: false,
  },
]

const categories = [
  "All Topics",
  "Menstrual Health",
  "Fertility",
  "PCOS",
  "Mental Health",
  "Nutrition",
  "Relationships",
]

export default function ForumPage() {
  const [posts, setPosts] = useState(forumPosts)
  const [selectedCategory, setSelectedCategory] = useState("All Topics")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "Menstrual Health" })

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        }
      }
      return post
    }))
  }

  const handleReport = (postId: number) => {
    alert(`Post ${postId} has been reported. Our moderators will review it.`)
  }

  const handleCreatePost = () => {
    // In real app, username comes from auth context
    const post = {
      id: posts.length + 1,
      username: "Selam123",
      avatar: "S1",
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      likes: 0,
      comments: 0,
      timeAgo: "Just now",
      isLiked: false,
    }
    setPosts([post, ...posts])
    setNewPost({ title: "", content: "", category: "Menstrual Health" })
    setIsCreateOpen(false)
  }

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === "All Topics" || post.category === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
            Posts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A safe space to share, ask, and support each other
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create a New Post</DialogTitle>
              <DialogDescription>
                Share your thoughts with the community. Your username will be shown publicly.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="What's on your mind?"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder="Share your experience, question, or thoughts..."
                  rows={4}
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePost} disabled={!newPost.title || !newPost.content}>
                Post
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="shrink-0"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 shrink-0 border-2 border-border">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {post.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{post.username}</span>
                        <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
                      </div>
                      <Badge variant="outline" className="mt-1 h-5 text-[10px]">
                        {post.category}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleReport(post.id)}
                        >
                          <Flag className="mr-2 h-4 w-4" />
                          Report Post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="font-medium leading-tight">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 gap-1.5 px-2",
                        post.isLiked && "text-primary"
                      )}
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2">
                      <MessageCircle className="h-4 w-4" />
                      {post.comments}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

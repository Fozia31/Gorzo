"use client"

import { useEffect, useMemo, useState } from "react"
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
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MessageCircle, 
  Heart, 
  MoreHorizontal, 
  Plus,
  Search,
  Pencil,
  Trash2,
  FileText,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { deletePost, getPosts, updatePost } from "@/api/postApi"

type MyPost = {
  id: string
  username: string
  avatar: string
  title: string
  content: string
  category: string
  likes: number
  comments: number
  timeAgo: string
  createdAt: string
}

const categories = [
  "Menstrual Health",
  "Fertility",
  "PCOS",
  "Mental Health",
  "Nutrition",
  "Relationships",
  "Conditions",
  "Hormones",
]

export default function MyPostsPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<MyPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingPost, setEditingPost] = useState<MyPost | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ title: "", content: "", category: "" })

  const fetchMyPosts = async () => {
    if (!user?.id) {
      setPosts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await getPosts({ userId: user.id })
      const mapped = (data || []).map((post: any) => ({
        id: post._id,
        username: user.username,
        avatar: user.username.slice(0, 2).toUpperCase(),
        title: post.title,
        content: post.content,
        category: post.category,
        likes: post.likes || 0,
        comments: 0,
        timeAgo: new Date(post.createdAt).toLocaleString(),
        createdAt: post.createdAt,
      }))
      setPosts(mapped)
    } catch (error) {
      console.error("Failed to load user posts", error)
      alert("Failed to load your posts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyPosts()
  }, [user?.id])

  const handleEdit = (post: MyPost) => {
    setEditingPost(post)
    setEditForm({
      title: post.title,
      content: post.content,
      category: post.category,
    })
  }

  const handleSaveEdit = async () => {
    if (!editingPost) return

    try {
      const updated = await updatePost(editingPost.id, {
        title: editForm.title,
        content: editForm.content,
        category: editForm.category,
      })

      setPosts((prev) =>
        prev.map((post) =>
          post.id === editingPost.id
            ? {
                ...post,
                title: updated.title,
                content: updated.content,
                category: updated.category,
              }
            : post
        )
      )
      setEditingPost(null)
      setEditForm({ title: "", content: "", category: "" })
    } catch (error) {
      console.error("Failed to update post", error)
      alert("Failed to update post")
    }
  }

  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId)
      setPosts((prev) => prev.filter((post) => post.id !== postId))
      setDeletingPostId(null)
    } catch (error) {
      console.error("Failed to delete post", error)
      alert("Failed to delete post")
    }
  }

  const filteredPosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [posts, searchQuery]
  )

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
            My Posts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and edit your community posts
          </p>
        </div>
        <Link href="/dashboard/forum">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Post
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-primary/10 p-2">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-semibold">{posts.length}</p>
              <p className="text-xs text-muted-foreground">Total Posts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-secondary/30 p-2">
              <Heart className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold">
                {posts.reduce((sum, post) => sum + post.likes, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Likes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-muted p-2">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold">
                {posts.reduce((sum, post) => sum + post.comments, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Comments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search your posts..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Posts List */}
      {loading ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading your posts...</p>
          </CardContent>
        </Card>
      ) : filteredPosts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-1">No posts yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Share your first post with the community
            </p>
            <Link href="/dashboard/forum">
              <Button>Create Your First Post</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
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
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/forum" className="flex items-center">
                              <Eye className="mr-2 h-4 w-4" />
                              View in Forum
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(post)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Post
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeletingPostId(post.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <h3 className="font-medium leading-tight">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                      <div className={cn("flex items-center gap-1.5 text-sm text-muted-foreground")}>
                        <Heart className="h-4 w-4" />
                        {post.likes} likes
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments} comments
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Make changes to your post. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                rows={4}
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPost(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editForm.title || !editForm.content}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingPostId} onOpenChange={() => setDeletingPostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
              All likes and comments will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingPostId && handleDelete(deletingPostId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

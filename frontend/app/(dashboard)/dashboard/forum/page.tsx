"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { getPosts, createPost } from "@/api/postApi";
import { getComments, createComment } from "@/api/commentApi";
import {
  createPostEngagement,
  getPostEngagements,
  deletePostEngagement,
} from "@/api/postEngagementApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle,
  Heart,
  Repeat2,
  Flag,
  MoreHorizontal,
  Plus,
  Search,
  CircleAlert,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// we will fetch posts from backend; start empty
const forumPosts: any[] = [];

const categories = [
  "All Topics",
  "Menstrual Health",
  "Fertility",
  "PCOS",
  "Mental Health",
  "Nutrition",
  "Relationships",
];

type PageMessage = {
  type: "success" | "error";
  text: string;
};

export default function ForumPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Topics");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "Menstrual Health",
  });
  const [pageMessage, setPageMessage] = useState<PageMessage | null>(null);

  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(
    {},
  );
  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [commentText, setCommentText] = useState("");
  const [userEngagements, setUserEngagements] = useState<
    Record<string, { Like?: any; Repost?: any; Report?: any }>
  >({});

  const handleLike = async (postId: string) => {
    if (!user) {
      setPageMessage({
        type: "error",
        text: "You must be logged in to like posts",
      });
      return;
    }

    const isCurrentlyLiked = Boolean(userEngagements[postId]?.Like);

    try {
      if (isCurrentlyLiked) {
        // Unlike: delete the engagement
        await deletePostEngagement(userEngagements[postId].Like._id);
        setUserEngagements((prev) => {
          const next = { ...prev };
          if (next[postId]) {
            delete next[postId].Like;
            if (!next[postId].Repost && !next[postId].Report)
              delete next[postId];
          }
          return next;
        });
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, isLiked: false, likes: Math.max(0, post.likes - 1) }
              : post,
          ),
        );
      } else {
        // Like: create new engagement
        const engagement = await createPostEngagement({
          postId,
          userId: user.id,
          type: "Like",
        });
        setUserEngagements((prev) => ({
          ...prev,
          [postId]: {
            ...(prev[postId] || {}),
            Like: engagement,
          },
        }));
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, isLiked: true, likes: post.likes + 1 }
              : post,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
      setPageMessage({
        type: "error",
        text: "Failed to update like. Please try again.",
      });
    }
  };

  const handleRepost = async (postId: string) => {
    if (!user) {
      alert("You must be logged in to repost");
      return;
    }

    const isCurrentlyReposted = Boolean(userEngagements[postId]?.Repost);

    try {
      if (isCurrentlyReposted) {
        await deletePostEngagement(userEngagements[postId].Repost._id);
        setUserEngagements((prev) => {
          const next = { ...prev };
          if (next[postId]) {
            delete next[postId].Repost;
            if (!next[postId].Like && !next[postId].Report) delete next[postId];
          }
          return next;
        });
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isReposted: false,
                  reposts: Math.max(0, (post.reposts || 0) - 1),
                }
              : post,
          ),
        );
      } else {
        const engagement = await createPostEngagement({
          postId,
          userId: user.id,
          type: "Repost",
        });
        setUserEngagements((prev) => ({
          ...prev,
          [postId]: {
            ...(prev[postId] || {}),
            Repost: engagement,
          },
        }));
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, isReposted: true, reposts: (post.reposts || 0) + 1 }
              : post,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to toggle repost:", error);
      alert("Failed to update repost. Please try again.");
    }
  };

  const handleReport = async (postId: string) => {
    if (!user) {
      alert("Please log in to report this post.");
      return;
    }

    if (userEngagements[postId]?.Report) {
      alert("You have already reported this post.");
      return;
    }

    try {
      const engagement = await createPostEngagement({
        postId,
        userId: user.id,
        type: "Report",
        reportReason: "Reported by community member",
      });

      setUserEngagements((prev) => ({
        ...prev,
        [postId]: {
          ...(prev[postId] || {}),
          Report: engagement,
        },
      }));

      alert("Post reported successfully.");
    } catch (error: any) {
      console.error("Failed to report post:", error);
      if (error?.statusCode === 409) {
        alert("You have already reported this post.");
        return;
      }
      alert(error?.message || "Unable to report this post. Please try again.");
    }
  };

  const handleOpenComments = async (postId: string) => {
    setCurrentPostId(postId);
    try {
      const res = await getComments({ postId });
      setComments(res || []);
      setCommentDialogOpen(true);
    } catch (err) {
      console.error("failed to load comments", err);
      setPageMessage({ type: "error", text: "Could not load comments" });
    }
  };

  const handleAddComment = async () => {
    if (!user || !currentPostId) return;
    if (!commentText.trim()) return;
    try {
      const payload = {
        postId: currentPostId,
        userId: user.id,
        displayName: user.username,
        content: commentText.trim(),
      };
      const res = await createComment(payload);
      const newC = res;
      setComments([newC, ...comments]);
      // update comment count
      setCommentCounts((prev) => ({
        ...prev,
        [currentPostId]: (prev[currentPostId] || 0) + 1,
      }));
      // also update map so previews reflect new comment
      setCommentsMap((prev) => {
        const arr = prev[currentPostId]
          ? [newC, ...prev[currentPostId]]
          : [newC];
        return { ...prev, [currentPostId]: arr };
      });
      // update post preview comments
      setPosts((prev) =>
        prev.map((p) =>
          p.id === currentPostId
            ? {
                ...p,
                previewComments: [newC, ...(p.previewComments || [])].slice(
                  0,
                  2,
                ),
              }
            : p,
        ),
      );
      setCommentText("");
    } catch (err) {
      console.error("add comment error", err);
      setPageMessage({ type: "error", text: "Failed to add comment" });
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      setPageMessage({ type: "error", text: "You must be logged in to post" });
      return;
    }

    try {
      const payload = {
        userId: user.id,
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        isAnonymous: false,
      };
      const result = await createPost(payload);
      // API returns the post object directly
      const post = result;
      // transform for UI
      const uiPost = {
        id: post._id,
        username: user.username,
        avatar: user.username.slice(0, 2).toUpperCase(),
        title: post.title,
        content: post.content,
        category: post.category,
        likes: 0,
        reposts: 0,
        timeAgo: "Just now",
        isLiked: false,
        isReposted: false,
      };
      setPosts([uiPost, ...posts]);
      setCommentCounts((prev) => ({ ...prev, [post._id]: 0 }));
      setNewPost({ title: "", content: "", category: "Menstrual Health" });
      setIsCreateOpen(false);
    } catch (err: any) {
      console.error("create post error", err);
      setPageMessage({
        type: "error",
        text: err?.message || "Failed to create post",
      });
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All Topics" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // fetch all posts when page loads; if user exists we still show every post
  useEffect(() => {
    getPosts()
      .then((res) => {
        const items = res || [];
        const uiItems = items.map((post: any) => {
          const isMine = user && post.userId === user.id;
          const isLiked = Boolean(userEngagements[post._id]?.Like);
          const isReposted = Boolean(userEngagements[post._id]?.Repost);
          return {
            id: post._id,
            userId: post.userId,
            username: isMine ? user!.username : "Anonymous",
            avatar: isMine ? user!.username.slice(0, 2).toUpperCase() : "AN",
            title: post.title,
            content: post.content,
            category: post.category,
            likes: post.likes || 0,
            reposts: post.reposts || 0,
            timeAgo: new Date(post.createdAt).toLocaleString(),
            isLiked: isLiked,
            isReposted: isReposted,
          };
        });
        setPosts(uiItems);
        // fetch all comments to compute counts and previews
        return getComments().catch((err) => {
          console.error("failed to load comments", err);
          return [];
        });
      })
      .then((cres) => {
        const commentsArray = Array.isArray(cres) ? cres : [];
        const counts: Record<string, number> = {};
        const map: Record<string, any[]> = {};
        commentsArray.forEach((c: any) => {
          counts[c.postId] = (counts[c.postId] || 0) + 1;
          if (!map[c.postId]) map[c.postId] = [];
          map[c.postId].push(c);
        });
        setPosts((prev) =>
          prev.map((p) => ({
            ...p,
          })),
        );
        setCommentsMap(map);
        setCommentCounts(counts);
      })
      .catch((err) => {
        console.error("failed to load posts or comments", err);
      });

    // Load user engagements
    if (user) {
      getPostEngagements({ userId: user.id })
        .then((engagements) => {
          const engagementMap: Record<
            string,
            { Like?: any; Repost?: any; Report?: any }
          > = {};
          engagements.forEach((engagement: any) => {
            if (!engagementMap[engagement.postId]) {
              engagementMap[engagement.postId] = {};
            }
            if (engagement.type === "Like") {
              engagementMap[engagement.postId].Like = engagement;
            } else if (engagement.type === "Repost") {
              engagementMap[engagement.postId].Repost = engagement;
            } else if (engagement.type === "Report") {
              engagementMap[engagement.postId].Report = engagement;
            }
          });
          setUserEngagements(engagementMap);
        })
        .catch((err) => {
          console.error("failed to load engagements", err);
        });
    }
  }, [user]);

  useEffect(() => {
    setPosts((prev) =>
      prev.map((post) => ({
        ...post,
        isLiked: Boolean(userEngagements[post.id]?.Like),
        isReposted: Boolean(userEngagements[post.id]?.Repost),
      })),
    );
  }, [userEngagements]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
            Discuss with Sisters
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
                Share your thoughts with the community. Your username will be
                shown publicly.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newPost.category}
                  onChange={(e) =>
                    setNewPost({ ...newPost, category: e.target.value })
                  }
                >
                  {categories.slice(1).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="What's on your mind?"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder="Share your experience, question, or thoughts..."
                  rows={4}
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={!newPost.title || !newPost.content}
              >
                Post
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {pageMessage && (
        <Alert
          variant={pageMessage.type === "error" ? "destructive" : "default"}
          className={
            pageMessage.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 [&>svg]:text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
              : ""
          }
        >
          {pageMessage.type === "error" ? (
            <CircleAlert className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <AlertDescription>{pageMessage.text}</AlertDescription>
        </Alert>
      )}

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
          {categories.map((cat) => (
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
          <Card
            key={post.id}
            className="overflow-hidden transition-all hover:shadow-md"
          >
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
                        <span className="text-sm font-medium">
                          {post.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {post.timeAgo}
                        </span>
                      </div>
                      <Badge variant="outline" className="mt-1 h-5 text-[10px]">
                        {post.category}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                        >
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
                        post.isLiked && "text-primary",
                      )}
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4",
                          post.isLiked && "fill-current",
                        )}
                      />
                      {post.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 gap-1.5 px-2",
                        post.isReposted && "text-primary",
                      )}
                      onClick={() => handleRepost(post.id)}
                    >
                      <Repeat2
                        className={cn(
                          "h-4 w-4",
                          post.isReposted && "fill-current",
                        )}
                      />
                      {post.reposts || 0}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 px-2"
                      onClick={() => handleOpenComments(post.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      {commentCounts[post.id] || 0}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* comment dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
            <DialogDescription>
              Read and add comments to this post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {comments.map((c) => (
              <div key={c._id} className="border-b pb-2">
                <p className="text-sm font-medium">{c.displayName}</p>
                <p className="text-sm">{c.content}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <Textarea
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button onClick={handleAddComment} disabled={!commentText.trim()}>
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

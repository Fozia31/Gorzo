"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Send,
  User,
  Sparkles,
  Star,
  MessageCircle,
  ArrowRight,
  Stethoscope,
  FileText,
  RefreshCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { getDoctors } from "@/api/doctorApi"
import { getPosts } from "@/api/postApi"
import { getDoctorAdvice } from "@/api/doctorAdviceApi"
import {
  chatWithGemini,
  suggestDoctorsWithGemini,
  summarizeArticleWithGemini,
  summarizePostWithGemini,
} from "@/api/aiConversationApi"

type UiDoctorSuggestion = {
  doctorId: string
  name: string
  specialization: string
  reason: string
}

type UiPost = {
  id: string
  title: string
  category: string
  likes: number
  comments: number
}

type UiArticle = {
  id: string
  title: string
  category: string
  summary: string
}

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  recommendations?: {
    doctors?: UiDoctorSuggestion[]
    posts?: UiPost[]
    articles?: UiArticle[]
    disclaimer?: string
  }
}

type FeelingOption = {
  label: string
}

const feelingOptions: FeelingOption[] = [
  { label: "Experiencing cramps or pain" },
  { label: "Worried about my cycle" },
  { label: "Struggling with PCOS" },
  { label: "Feeling anxious or stressed" },
  { label: "Questions about fertility" },
  { label: "Need nutrition advice" },
]

const mapPostToUi = (post: any): UiPost => ({
  id: String(post?._id || post?.post_id || ""),
  title: String(post?.title || "Untitled post"),
  category: String(post?.category || "General"),
  likes: Number(post?.likes || 0),
  comments: Number(post?.commentsCount || 0),
})

const mapArticleToUi = (article: any): UiArticle => ({
  id: String(article?._id || article?.advice_id || ""),
  title: String(article?.title || "Untitled article"),
  category: String(article?.category || "General"),
  summary: String(article?.summary || article?.transcript || article?.textContent || "").slice(0, 140),
})

export default function ChatbotPage() {
  const { user } = useAuth()
  const userId = user?.id || ""

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello, dear sister! I am your EFOY health companion powered by Gemini. Share your concern and I can chat, suggest suitable doctors, and summarize posts or health articles for you.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isCatalogLoading, setIsCatalogLoading] = useState(false)
  const [catalogPosts, setCatalogPosts] = useState<UiPost[]>([])
  const [catalogArticles, setCatalogArticles] = useState<UiArticle[]>([])
  const [catalogDoctorIds, setCatalogDoctorIds] = useState<Set<string>>(new Set())
  const [conversationId, setConversationId] = useState<string>("")
  const [summarizingPostId, setSummarizingPostId] = useState<string>("")
  const [summarizingArticleId, setSummarizingArticleId] = useState<string>("")

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  useEffect(() => {
    const loadCatalog = async () => {
      setIsCatalogLoading(true)
      try {
        const [postsData, adviceData, doctorsResponse] = await Promise.all([
          getPosts({ limit: 20 }),
          getDoctorAdvice({ limit: 20, status: "published" }),
          getDoctors({ limit: 100, verificationStatus: "Verified" }),
        ])

        const mappedPosts = Array.isArray(postsData)
          ? postsData.map(mapPostToUi).filter((item) => item.id)
          : []

        const mappedArticles = Array.isArray(adviceData)
          ? adviceData.map(mapArticleToUi).filter((item) => item.id)
          : []

        const doctorItems = Array.isArray(doctorsResponse?.data) ? doctorsResponse.data : []
        const doctorIdSet = new Set<string>(
          doctorItems
            .map((item: any) => String(item?._id || ""))
            .filter(Boolean)
        )

        setCatalogPosts(mappedPosts)
        setCatalogArticles(mappedArticles)
        setCatalogDoctorIds(doctorIdSet)
      } catch {
        setCatalogPosts([])
        setCatalogArticles([])
        setCatalogDoctorIds(new Set())
      } finally {
        setIsCatalogLoading(false)
      }
    }

    void loadCatalog()
  }, [])

  const fallbackPosts = useMemo(() => {
    return [...catalogPosts].sort((a, b) => b.likes - a.likes).slice(0, 3)
  }, [catalogPosts])

  const fallbackArticles = useMemo(() => {
    return catalogArticles.slice(0, 2)
  }, [catalogArticles])

  const appendMessage = (message: Message) => {
    setMessages((prev) => [...prev, message])
  }

  const handleSummarizePost = async (post: UiPost) => {
    if (!userId || !post.id || summarizingPostId) return

    setSummarizingPostId(post.id)
    try {
      const result = await summarizePostWithGemini({
        userId,
        postId: post.id,
        conversationId: conversationId || undefined,
      })

      if (result?.conversationId) {
        setConversationId(String(result.conversationId))
      }

      appendMessage({
        id: `post-summary-${Date.now()}`,
        role: "assistant",
        content: result?.summary || "I could not summarize this post right now.",
        timestamp: new Date(),
      })
    } catch (error: any) {
      appendMessage({
        id: `post-summary-error-${Date.now()}`,
        role: "assistant",
        content: error?.message || "Failed to summarize the post. Please try again.",
        timestamp: new Date(),
      })
    } finally {
      setSummarizingPostId("")
    }
  }

  const handleSummarizeArticle = async (article: UiArticle) => {
    if (!userId || !article.id || summarizingArticleId) return

    setSummarizingArticleId(article.id)
    try {
      const result = await summarizeArticleWithGemini({
        userId,
        articleId: article.id,
        conversationId: conversationId || undefined,
      })

      if (result?.conversationId) {
        setConversationId(String(result.conversationId))
      }

      appendMessage({
        id: `article-summary-${Date.now()}`,
        role: "assistant",
        content: result?.summary || "I could not summarize this article right now.",
        timestamp: new Date(),
      })
    } catch (error: any) {
      appendMessage({
        id: `article-summary-error-${Date.now()}`,
        role: "assistant",
        content: error?.message || "Failed to summarize the article. Please try again.",
        timestamp: new Date(),
      })
    } finally {
      setSummarizingArticleId("")
    }
  }

  const handleSend = async (text?: string) => {
    const messageText = (text || input).trim()
    if (!messageText || isTyping) return

    appendMessage({
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date(),
    })
    setInput("")

    if (!userId) {
      appendMessage({
        id: `auth-error-${Date.now()}`,
        role: "assistant",
        content: "Please log in first so I can create your personalized AI conversation.",
        timestamp: new Date(),
      })
      return
    }

    setIsTyping(true)
    try {
      const chatResult = await chatWithGemini({
        userId,
        message: messageText,
        conversationId: conversationId || undefined,
      })

      const nextConversationId = String(chatResult?.conversationId || conversationId || "")
      if (nextConversationId) {
        setConversationId(nextConversationId)
      }

      let suggestedDoctors: UiDoctorSuggestion[] = []
      let disclaimer = ""

      try {
        const suggestionResult = await suggestDoctorsWithGemini({
          userId,
          query: messageText,
          conversationId: nextConversationId || undefined,
        })

        if (suggestionResult?.conversationId) {
          setConversationId(String(suggestionResult.conversationId))
        }

        const suggestions = Array.isArray(suggestionResult?.suggestions)
          ? suggestionResult.suggestions
          : []

        suggestedDoctors = suggestions
          .filter((item: any) => item?.doctorId && catalogDoctorIds.has(String(item.doctorId)))
          .map((item: any) => ({
            doctorId: String(item.doctorId),
            name: String(item.name || "Doctor"),
            specialization: String(item.specialization || "General"),
            reason: String(item.reason || "Recommended for your concern."),
          }))

        disclaimer = String(suggestionResult?.disclaimer || "")
      } catch {
        suggestedDoctors = []
      }

      appendMessage({
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: chatResult?.response || "I could not generate a response right now.",
        timestamp: new Date(),
        recommendations: {
          doctors: suggestedDoctors,
          posts: fallbackPosts,
          articles: fallbackArticles,
          disclaimer,
        },
      })
    } catch (error: any) {
      appendMessage({
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content: error?.message || "Something went wrong while contacting AI. Please try again.",
        timestamp: new Date(),
      })
    } finally {
      setIsTyping(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col p-4 md:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-primary/20">
          <Image
            src="/logo.jpg"
            alt="EFOY"
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h1 className="font-serif text-xl font-semibold text-foreground">Ask EFOY</h1>
          <p className="text-sm text-muted-foreground">Gemini-powered health companion</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden">
        <CardContent ref={scrollRef} className="h-full space-y-4 overflow-y-auto p-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-3">
              <div className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}>
                {message.role === "assistant" ? (
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-primary/20">
                    <Image
                      src="/logo.jpg"
                      alt="EFOY"
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    message.role === "assistant" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                  )}
                >
                  <p className="whitespace-pre-line text-sm">{message.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      message.role === "assistant" ? "text-muted-foreground" : "text-primary-foreground/70"
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {message.recommendations && (
                <div className="ml-11 space-y-4">
                  {(message.recommendations.doctors || []).length > 0 && (
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Stethoscope className="h-3 w-3" />
                        Recommended Doctors
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {message.recommendations.doctors?.map((doctor) => (
                          <Link key={doctor.doctorId} href="/dashboard/consulting">
                            <Card className="w-65 cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                              <CardContent className="space-y-2 p-3">
                                <div>
                                  <p className="text-sm font-medium">{doctor.name}</p>
                                  <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
                                </div>
                                <p className="line-clamp-2 text-xs text-muted-foreground">{doctor.reason}</p>
                                <Badge variant="secondary" className="text-[10px]">
                                  Suggested by Gemini
                                </Badge>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {(message.recommendations.posts || []).length > 0 && (
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <MessageCircle className="h-3 w-3" />
                        Community Posts
                      </p>
                      <div className="space-y-2">
                        {message.recommendations.posts?.map((post) => (
                          <Card key={post.id} className="transition-all hover:border-primary/50 hover:shadow-md">
                            <CardContent className="space-y-2 p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium">{post.title}</p>
                                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>{post.likes} likes</span>
                                    <span>{post.comments} comments</span>
                                    <Badge variant="outline" className="text-[10px]">
                                      {post.category}
                                    </Badge>
                                  </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex items-center gap-2">
                                <Link href="/dashboard/forum">
                                  <Button size="sm" variant="outline">Open</Button>
                                </Link>
                                <Button
                                  size="sm"
                                  onClick={() => void handleSummarizePost(post)}
                                  disabled={summarizingPostId === post.id || !userId}
                                >
                                  {summarizingPostId === post.id ? <RefreshCcw className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                                  Summarize
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {(message.recommendations.articles || []).length > 0 && (
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Sparkles className="h-3 w-3" />
                        Doctor Articles
                      </p>
                      <div className="space-y-2">
                        {message.recommendations.articles?.map((article) => (
                          <Card key={article.id} className="transition-all hover:border-primary/50 hover:shadow-md">
                            <CardContent className="space-y-2 p-3">
                              <div>
                                <p className="text-sm font-medium">{article.title}</p>
                                <p className="line-clamp-2 text-xs text-muted-foreground">
                                  {article.summary || "Tap summarize to get the key insights."}
                                </p>
                                <Badge variant="outline" className="mt-1 text-[10px]">
                                  {article.category}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Link href="/dashboard/knowledge">
                                  <Button size="sm" variant="outline">Open</Button>
                                </Link>
                                <Button
                                  size="sm"
                                  onClick={() => void handleSummarizeArticle(article)}
                                  disabled={summarizingArticleId === article.id || !userId}
                                >
                                  {summarizingArticleId === article.id ? <RefreshCcw className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                                  Summarize
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {message.recommendations.disclaimer && (
                    <p className="text-xs text-muted-foreground">{message.recommendations.disclaimer}</p>
                  )}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-primary/20">
                <Image src="/logo.jpg" alt="EFOY" width={32} height={32} className="h-full w-full object-cover" />
              </div>
              <div className="rounded-2xl bg-muted px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "0ms" }}></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "150ms" }}></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {messages.length <= 2 && (
        <div className="mt-2 space-y-1.5">
          <p className="text-center text-[11px] text-muted-foreground">Quick options</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {feelingOptions.map((option) => (
              <Button
                key={option.label}
                variant="outline"
                className="h-7 rounded-full px-2.5 py-1 text-[11px]"
                onClick={() => void handleSend(option.label)}
                disabled={isTyping}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Input
          ref={inputRef}
          placeholder={isCatalogLoading ? "Loading health resources..." : "Tell me how you are feeling..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
          disabled={isTyping}
        />
        <Button onClick={() => void handleSend()} disabled={!input.trim() || isTyping}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        <Sparkles className="mr-1 inline h-3 w-3" />
        AI suggestions are informational and not a medical diagnosis.
      </p>
    </div>
  )
}

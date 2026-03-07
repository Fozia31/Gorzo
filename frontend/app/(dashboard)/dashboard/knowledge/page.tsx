"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  PlayCircle, 
  PauseCircle,
  BookOpen, 
  Mic, 
  Clock,
  User,
  Headphones,
  Paperclip,
  Download
} from "lucide-react"
import { getDoctorAdvice } from "@/api/doctorAdviceApi"

type AdviceAttachment = {
  name: string
  url: string
  mimeType?: string
  size?: number
}

type KnowledgeArticle = {
  id: string
  title: string
  author: {
    name: string
    specialty: string
    avatar?: string
  }
  content: string
  category: string
  readTime: string
  hasVoiceNote: boolean
  voiceDuration?: string
  audioUrl?: string
  attachments: AdviceAttachment[]
  publishedAt: string
  featured: boolean
}

const categories = ["All", "Hormones", "Nutrition", "Fertility", "Conditions", "Wellness", "Mental Health"]

export default function KnowledgeHubPage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const loadKnowledgeHub = async () => {
      try {
        setIsLoading(true)
        const items = await getDoctorAdvice({ status: "published" })
        const mapped: KnowledgeArticle[] = Array.isArray(items)
          ? items.map((item: any, index: number) => {
              const textContent = String(item?.textContent || "")
              const authorName = item?.doctorId?.userId?.displayName || "Doctor"
              const specialty = item?.doctorId?.specialization || "Women's Health"
              const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0
              const readMinutes = Math.max(1, Math.ceil(words / 200))
              const audioSeconds = Number(item?.audioDuration || 0)
              const durationLabel = audioSeconds > 0
                ? `${Math.floor(audioSeconds / 60)}:${String(audioSeconds % 60).padStart(2, "0")}`
                : undefined

              return {
                id: String(item?._id || index),
                title: String(item?.title || "Untitled"),
                author: {
                  name: authorName,
                  specialty,
                  avatar: "",
                },
                content: textContent,
                category: String(item?.category || "Wellness"),
                readTime: `${readMinutes} min`,
                hasVoiceNote: Boolean(item?.voiceUrl),
                voiceDuration: durationLabel,
                audioUrl: item?.voiceUrl || "",
                attachments: Array.isArray(item?.attachments)
                  ? item.attachments
                      .filter((file: any) => Boolean(file?.url))
                      .map((file: any) => ({
                        name: String(file?.name || "Attachment"),
                        url: String(file?.url || ""),
                        mimeType: file?.mimeType ? String(file.mimeType) : "",
                        size: Number(file?.size || 0),
                      }))
                  : [],
                publishedAt: item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : "",
                featured: index < 2,
              }
            })
          : []
        setArticles(mapped)
      } catch {
        setArticles([])
      } finally {
        setIsLoading(false)
      }
    }

    void loadKnowledgeHub()
  }, [])

  const getAudioUrl = (articleId: string) =>
    articles.find((article) => article.id === articleId)?.audioUrl || ""

  const toggleAudio = (articleId: string) => {
    if (playingAudio === articleId) {
      setPlayingAudio(null)
    } else {
      setPlayingAudio(articleId)
    }
  }

  // when playingAudio changes, update the <audio> element
  useEffect(() => {
    if (!audioRef.current) return
    if (playingAudio === null) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    } else {
      const audioUrl = getAudioUrl(playingAudio)
      if (audioUrl) {
        audioRef.current.src = audioUrl
        audioRef.current.play().catch(err => {
          console.error("audio play failed", err)
        })
      } else {
        setPlayingAudio(null)
      }
    }
  }, [playingAudio])

  const handleAudioEnded = () => {
    setPlayingAudio(null)
  }

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredArticles = filteredArticles.filter(a => a.featured)
  const regularArticles = filteredArticles.filter(a => !a.featured)

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
          Knowledge Hub
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Expert articles and insights from our trusted doctors
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="All" className="w-full" onValueChange={setSelectedCategory}>
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {categories.map(cat => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="rounded-full border border-transparent px-4 py-1.5 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6 space-y-6">
          {isLoading && (
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                Loading articles...
              </CardContent>
            </Card>
          )}

          {/* Featured Articles */}
          {!isLoading && featuredArticles.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Featured</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {featuredArticles.map((article) => (
                  <Card key={article.id} className="overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 to-secondary/5">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                          Featured
                        </Badge>
                        <div className="flex items-center gap-2">
                          {article.hasVoiceNote && (
                            <Badge variant="outline" className="gap-1">
                              <Headphones className="h-3 w-3" />
                              {article.voiceDuration || "Voice"}
                            </Badge>
                          )}
                          {article.attachments.length > 0 && (
                            <Badge variant="outline" className="gap-1">
                              <Paperclip className="h-3 w-3" />
                              {article.attachments.length} file{article.attachments.length > 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="mt-2 text-lg leading-tight">
                        {article.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.content}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={article.author.avatar} />
                            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                              {article.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{article.author.name}</p>
                            <p className="text-xs text-muted-foreground">{article.author.specialty}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {article.readTime}
                        </div>
                      </div>

                      {article.hasVoiceNote && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                          onClick={() => toggleAudio(article.id)}
                        >
                          {playingAudio === article.id ? (
                            <>
                              <PauseCircle className="h-4 w-4 text-primary" />
                              Pause Insight
                            </>
                          ) : (
                            <>
                              <PlayCircle className="h-4 w-4 text-secondary-foreground" />
                              Play Insight
                            </>
                          )}
                        </Button>
                      )}

                      {article.attachments.length > 0 && (
                        <div className="space-y-2">
                          {article.attachments.map((file, index) => (
                            <Button
                              key={`${article.id}-featured-file-${index}`}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start gap-2"
                              onClick={() => window.open(file.url, "_blank")}
                            >
                              <Download className="h-4 w-4" />
                              <span className="truncate">{file.name}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Articles */}
          {!isLoading && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">All Articles</h2>
            <div className="space-y-3">
              {regularArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        {article.hasVoiceNote ? (
                          <Mic className="h-5 w-5 text-primary" />
                        ) : (
                          <BookOpen className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium leading-tight">{article.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="shrink-0 text-xs">
                              {article.category}
                            </Badge>
                            {article.attachments.length > 0 && (
                              <Badge variant="outline" className="shrink-0 gap-1 text-xs">
                                <Paperclip className="h-3 w-3" />
                                {article.attachments.length}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {article.content}
                        </p>
                        {article.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {article.attachments.slice(0, 2).map((file, index) => (
                              <Button
                                key={`${article.id}-regular-file-${index}`}
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1 text-xs"
                                onClick={() => window.open(file.url, "_blank")}
                              >
                                <Download className="h-3 w-3" />
                                <span className="max-w-35 truncate">{file.name}</span>
                              </Button>
                            ))}
                            {article.attachments.length > 2 && (
                              <Badge variant="secondary" className="h-7 px-2 text-xs">
                                +{article.attachments.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{article.author.name}</span>
                            <span>•</span>
                            <span>{article.publishedAt}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {article.hasVoiceNote && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => toggleAudio(article.id)}
                              >
                                {playingAudio === article.id ? (
                                  <PauseCircle className="h-5 w-5 text-primary" />
                                ) : (
                                  <PlayCircle className="h-5 w-5 text-secondary-foreground" />
                                )}
                              </Button>
                            )}
                            {article.attachments.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1"
                                onClick={() => window.open(article.attachments[0].url, "_blank")}
                              >
                                <Download className="h-4 w-4" />
                                Open File
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          )}
        </TabsContent>
      </Tabs>

      {!isLoading && filteredArticles.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">No articles found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
      {/* hidden audio element for playback */}
      <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />
    </div>
  )
}

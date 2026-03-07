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
  Headphones
} from "lucide-react"

// Sample articles
const articles = [
  {
    id: 1,
    title: "Understanding Your Hormonal Cycle: A Complete Guide",
    author: {
      name: "Dr. Amara Bekele",
      specialty: "Gynecologist",
      avatar: "/doctors/amara.jpg"
    },
    content: "Your menstrual cycle is controlled by a complex interplay of hormones. Understanding these changes can help you better manage your health and wellbeing throughout the month...",
    category: "Hormones",
    readTime: "8 min",
    hasVoiceNote: true,
    voiceDuration: "4:32",
    audioUrl: "/audio/hormonal-cycle.mp3",
    publishedAt: "2 days ago",
    featured: true,
  },
  {
    id: 2,
    title: "Nutrition Tips for Each Phase of Your Cycle",
    author: {
      name: "Dr. Selam Haile",
      specialty: "Nutritionist",
      avatar: "/doctors/selam.jpg"
    },
    content: "What you eat can significantly impact how you feel during different phases of your menstrual cycle. During the follicular phase, focus on iron-rich foods...",
    category: "Nutrition",
    readTime: "6 min",
    hasVoiceNote: true,
    voiceDuration: "3:15",
    audioUrl: "/audio/nutrition-cycle.mp3",
    publishedAt: "4 days ago",
    featured: true,
  },
  {
    id: 3,
    title: "Managing Stress and Its Impact on Fertility",
    author: {
      name: "Dr. Hana Tadesse",
      specialty: "Reproductive Health",
      avatar: "/doctors/hana.jpg"
    },
    content: "Chronic stress can affect your fertility in multiple ways. The stress hormone cortisol can interfere with the hormones needed for ovulation...",
    category: "Fertility",
    readTime: "5 min",
    hasVoiceNote: false,
    publishedAt: "1 week ago",
    featured: false,
  },
  {
    id: 4,
    title: "PCOS: Symptoms, Diagnosis, and Management",
    author: {
      name: "Dr. Amara Bekele",
      specialty: "Gynecologist",
      avatar: "/doctors/amara.jpg"
    },
    content: "Polycystic Ovary Syndrome (PCOS) affects up to 10% of women of reproductive age. Common symptoms include irregular periods, excess hair growth...",
    category: "Conditions",
    readTime: "10 min",
    hasVoiceNote: true,
    voiceDuration: "6:45",
    audioUrl: "/audio/pcos-symptoms.mp3",
    publishedAt: "1 week ago",
    featured: false,
  },
  {
    id: 5,
    title: "The Connection Between Sleep and Hormonal Balance",
    author: {
      name: "Dr. Selam Haile",
      specialty: "Nutritionist",
      avatar: "/doctors/selam.jpg"
    },
    content: "Quality sleep is essential for maintaining hormonal balance. During sleep, your body produces important hormones like melatonin and growth hormone...",
    category: "Wellness",
    readTime: "7 min",
    hasVoiceNote: true,
    voiceDuration: "4:10",
    audioUrl: "/audio/sleep-hormones.mp3",
    publishedAt: "2 weeks ago",
    featured: false,
  },
]

const categories = ["All", "Hormones", "Nutrition", "Fertility", "Conditions", "Wellness", "Mental Health"]

export default function KnowledgeHubPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [playingAudio, setPlayingAudio] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const getAudioUrl = (articleId: number) =>
    articles.find((article) => article.id === articleId)?.audioUrl || ""

  const toggleAudio = (articleId: number) => {
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
          Expert articles and voice notes from our trusted doctors
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
          {/* Featured Articles */}
          {featuredArticles.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Featured</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {featuredArticles.map((article) => (
                  <Card key={article.id} className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                          Featured
                        </Badge>
                        {article.hasVoiceNote && (
                          <Badge variant="outline" className="gap-1">
                            <Headphones className="h-3 w-3" />
                            {article.voiceDuration}
                          </Badge>
                        )}
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
                              Pause Voice Note
                            </>
                          ) : (
                            <>
                              <PlayCircle className="h-4 w-4 text-secondary-foreground" />
                              Play Voice Note
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Articles */}
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
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {article.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {article.content}
                        </p>
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
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {filteredArticles.length === 0 && (
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

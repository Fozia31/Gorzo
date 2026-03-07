"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Send,
  Bot,
  User,
  Sparkles,
  Heart,
  Star,
  MessageCircle,
  ArrowRight,
  Stethoscope
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

type Message = {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: Date
  recommendations?: {
    doctors?: Doctor[]
    posts?: Post[]
  }
}

type Doctor = {
  id: number
  name: string
  specialty: string
  rating: number
  totalReviews: number
  available: boolean
  consultationFee: number
}

type Post = {
  id: number
  username: string
  title: string
  category: string
  likes: number
  comments: number
}

// Doctors data
const doctors: Doctor[] = [
  { id: 1, name: "Dr. Amara Bekele", specialty: "Gynecologist", rating: 4.9, totalReviews: 156, available: true, consultationFee: 299 },
  { id: 2, name: "Dr. Selam Haile", specialty: "Nutritionist", rating: 4.8, totalReviews: 98, available: true, consultationFee: 249 },
  { id: 3, name: "Dr. Hana Tadesse", specialty: "Reproductive Health", rating: 4.9, totalReviews: 124, available: false, consultationFee: 349 },
  { id: 4, name: "Dr. Meron Alemu", specialty: "Mental Health", rating: 4.7, totalReviews: 89, available: true, consultationFee: 279 },
]

// Posts data
const posts: Post[] = [
  { id: 1, username: "BloomingFlower", title: "First time experiencing irregular cycles - need advice", category: "Menstrual Health", likes: 24, comments: 12 },
  { id: 2, username: "HopefulMama", title: "Natural remedies for menstrual cramps that actually work", category: "Pain Management", likes: 87, comments: 34 },
  { id: 3, username: "WellnessJourney", title: "How do you talk to your partner about fertility?", category: "Relationships", likes: 45, comments: 28 },
  { id: 4, username: "StrongSister", title: "PCOS diagnosis - feeling overwhelmed", category: "Conditions", likes: 156, comments: 67 },
  { id: 5, username: "HealthyMind", title: "Dealing with anxiety during pregnancy", category: "Mental Health", likes: 112, comments: 45 },
  { id: 6, username: "NutritionQueen", title: "Best foods for hormonal balance", category: "Nutrition", likes: 203, comments: 78 },
  { id: 7, username: "FertilityHope", title: "My journey with fertility treatments", category: "Fertility", likes: 178, comments: 89 },
  { id: 8, username: "CycleSister", title: "Understanding your menstrual cycle phases", category: "Menstrual Health", likes: 145, comments: 56 },
]

// Feeling options for quick selection
const feelingOptions = [
  { label: "Experiencing cramps or pain", keywords: ["cramps", "pain", "menstrual"] },
  { label: "Worried about my cycle", keywords: ["cycle", "irregular", "period", "menstrual"] },
  { label: "Struggling with PCOS", keywords: ["pcos", "hormonal"] },
  { label: "Feeling anxious or stressed", keywords: ["anxiety", "stress", "mental", "depression"] },
  { label: "Questions about fertility", keywords: ["fertility", "pregnancy", "conception"] },
  { label: "Need nutrition advice", keywords: ["nutrition", "diet", "food", "weight"] },
]

function getRecommendations(message: string): { doctors: Doctor[], posts: Post[], response: string } {
  const lowerMessage = message.toLowerCase()
  
  let recommendedDoctors: Doctor[] = []
  let recommendedPosts: Post[] = []
  let response = ""

  // Check for mental health related keywords
  if (lowerMessage.includes("anxiety") || lowerMessage.includes("stress") || lowerMessage.includes("mental") || 
      lowerMessage.includes("depression") || lowerMessage.includes("sad") || lowerMessage.includes("overwhelmed") ||
      lowerMessage.includes("worried") || lowerMessage.includes("anxious")) {
    recommendedDoctors = doctors.filter(d => d.specialty === "Mental Health").sort((a, b) => b.rating - a.rating)
    recommendedPosts = posts.filter(p => p.category === "Mental Health" || p.title.toLowerCase().includes("anxiety") || p.title.toLowerCase().includes("stress"))
      .sort((a, b) => b.likes - a.likes).slice(0, 3)
    response = "I understand you're going through a difficult time. It's completely normal to feel this way, and I'm here to help. Based on what you've shared, I recommend connecting with our mental health specialist who can provide personalized support."
  }
  // Check for menstrual/cycle related keywords
  else if (lowerMessage.includes("period") || lowerMessage.includes("cycle") || lowerMessage.includes("menstrual") ||
           lowerMessage.includes("cramp") || lowerMessage.includes("bleeding") || lowerMessage.includes("irregular")) {
    recommendedDoctors = doctors.filter(d => d.specialty === "Gynecologist").sort((a, b) => b.rating - a.rating)
    recommendedPosts = posts.filter(p => p.category === "Menstrual Health" || p.category === "Pain Management" || 
      p.title.toLowerCase().includes("cycle") || p.title.toLowerCase().includes("cramp"))
      .sort((a, b) => b.likes - a.likes).slice(0, 3)
    response = "Menstrual health is so important, and I'm glad you're reaching out! Many sisters in our community have shared similar experiences. Here are some highly-rated resources and doctors who specialize in this area."
  }
  // Check for PCOS related keywords
  else if (lowerMessage.includes("pcos") || lowerMessage.includes("polycystic") || lowerMessage.includes("hormonal") ||
           lowerMessage.includes("hormone")) {
    recommendedDoctors = doctors.filter(d => d.specialty === "Gynecologist" || d.specialty === "Nutritionist")
      .sort((a, b) => b.rating - a.rating)
    recommendedPosts = posts.filter(p => p.category === "Conditions" || p.title.toLowerCase().includes("pcos") || 
      p.title.toLowerCase().includes("hormonal"))
      .sort((a, b) => b.likes - a.likes).slice(0, 3)
    response = "PCOS can feel overwhelming, but you're not alone! Many women in our community have successfully managed their symptoms with the right support. I recommend speaking with both a gynecologist and nutritionist for a comprehensive approach."
  }
  // Check for fertility related keywords
  else if (lowerMessage.includes("fertility") || lowerMessage.includes("pregnant") || lowerMessage.includes("pregnancy") ||
           lowerMessage.includes("conception") || lowerMessage.includes("baby") || lowerMessage.includes("trying to conceive")) {
    recommendedDoctors = doctors.filter(d => d.specialty === "Reproductive Health" || d.specialty === "Gynecologist")
      .sort((a, b) => b.rating - a.rating)
    recommendedPosts = posts.filter(p => p.category === "Fertility" || p.category === "Relationships" ||
      p.title.toLowerCase().includes("fertility") || p.title.toLowerCase().includes("pregnancy"))
      .sort((a, b) => b.likes - a.likes).slice(0, 3)
    response = "Your fertility journey is deeply personal, and I'm here to support you. Our reproductive health specialists have helped many women achieve their dreams of motherhood. Here are some resources that might help."
  }
  // Check for nutrition related keywords
  else if (lowerMessage.includes("nutrition") || lowerMessage.includes("diet") || lowerMessage.includes("food") ||
           lowerMessage.includes("weight") || lowerMessage.includes("eat") || lowerMessage.includes("healthy")) {
    recommendedDoctors = doctors.filter(d => d.specialty === "Nutritionist").sort((a, b) => b.rating - a.rating)
    recommendedPosts = posts.filter(p => p.category === "Nutrition" || p.title.toLowerCase().includes("food") ||
      p.title.toLowerCase().includes("diet"))
      .sort((a, b) => b.likes - a.likes).slice(0, 3)
    response = "Good nutrition is the foundation of women's health! Our nutritionist specializes in women's dietary needs and can create a personalized plan for you. Here are some popular resources from our community."
  }
  // Check for pain related keywords
  else if (lowerMessage.includes("pain") || lowerMessage.includes("hurt") || lowerMessage.includes("ache") ||
           lowerMessage.includes("sore")) {
    recommendedDoctors = doctors.filter(d => d.specialty === "Gynecologist").sort((a, b) => b.rating - a.rating)
    recommendedPosts = posts.filter(p => p.category === "Pain Management" || p.title.toLowerCase().includes("pain") ||
      p.title.toLowerCase().includes("cramp") || p.title.toLowerCase().includes("remedies"))
      .sort((a, b) => b.likes - a.likes).slice(0, 3)
    response = "I'm sorry to hear you're experiencing pain. It's important to address this with proper care. Many sisters have found relief through various methods shared in our community. Let me also recommend some specialists who can help."
  }
  // Default response
  else {
    recommendedDoctors = doctors.filter(d => d.available).sort((a, b) => b.rating - a.rating).slice(0, 2)
    recommendedPosts = posts.sort((a, b) => b.likes - a.likes).slice(0, 3)
    response = "Thank you for sharing! I'm here to help you find the right support. Based on our most popular resources and highest-rated doctors, here are some recommendations that might interest you. Feel free to tell me more about how you're feeling for more personalized suggestions."
  }

  return { doctors: recommendedDoctors, posts: recommendedPosts, response }
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hello, dear sister! I'm your EFOY health companion. How are you feeling today? Share what's on your mind, and I'll recommend the best doctors and community discussions to support you.\n\nYou can tell me about any health concerns, or choose from the options below.",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText) return

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Get recommendations based on user message
    setTimeout(() => {
      const { doctors: recDoctors, posts: recPosts, response } = getRecommendations(messageText)
      
      const botMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: response,
        timestamp: new Date(),
        recommendations: {
          doctors: recDoctors,
          posts: recPosts
        }
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1200)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col p-4 md:p-6">
      {/* Header */}
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
          <p className="text-sm text-muted-foreground">Your personalized health companion</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-3">
                <div
                  className={cn(
                    "flex gap-3",
                    message.role === "user" && "flex-row-reverse"
                  )}
                >
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
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === "assistant"
                        ? "bg-muted text-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    <p className="whitespace-pre-line text-sm">{message.content}</p>
                    <p className={cn(
                      "mt-1 text-[10px]",
                      message.role === "assistant" ? "text-muted-foreground" : "text-primary-foreground/70"
                    )}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                {message.recommendations && (
                  <div className="ml-11 space-y-4">
                    {/* Recommended Doctors */}
                    {message.recommendations.doctors && message.recommendations.doctors.length > 0 && (
                      <div className="space-y-2">
                        <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <Stethoscope className="h-3 w-3" />
                          Recommended Doctors
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {message.recommendations.doctors.map((doctor) => (
                            <Link key={doctor.id} href="/dashboard/consulting">
                              <Card className="w-[200px] cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-2">
                                    <Avatar className="h-10 w-10">
                                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                        {doctor.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{doctor.name}</p>
                                      <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
                                      <div className="mt-1 flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                        <span className="text-xs font-medium">{doctor.rating}</span>
                                        <span className="text-xs text-muted-foreground">({doctor.totalReviews})</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Badge 
                                    variant={doctor.available ? "default" : "secondary"} 
                                    className="mt-2 w-full justify-center text-[10px]"
                                  >
                                    {doctor.available ? "Available" : "Unavailable"}
                                  </Badge>
                                </CardContent>
                              </Card>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommended Posts */}
                    {message.recommendations.posts && message.recommendations.posts.length > 0 && (
                      <div className="space-y-2">
                        <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <MessageCircle className="h-3 w-3" />
                          Popular Community Discussions
                        </p>
                        <div className="space-y-2">
                          {message.recommendations.posts.map((post) => (
                            <Link key={post.id} href="/dashboard/forum">
                              <Card className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                                <CardContent className="flex items-center justify-between p-3">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{post.title}</p>
                                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Heart className="h-3 w-3" />
                                        {post.likes}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <MessageCircle className="h-3 w-3" />
                                        {post.comments}
                                      </span>
                                      <Badge variant="outline" className="text-[10px]">{post.category}</Badge>
                                    </div>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </CardContent>
                              </Card>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-primary/20">
                  <Image
                    src="/logo.jpg"
                    alt="EFOY"
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
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
          </div>
        </ScrollArea>
      </Card>

      {/* Feeling Options */}
      {messages.length <= 2 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground text-center">Quick options - Tell me how you&apos;re feeling:</p>
          <div className="grid grid-cols-2 gap-2">
            {feelingOptions.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto justify-start gap-2 p-3 text-left"
                onClick={() => handleSend(option.label)}
              >
                <Heart className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-xs">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="mt-4 flex gap-2">
        <Input
          ref={inputRef}
          placeholder="Tell me how you're feeling..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button onClick={() => handleSend()} disabled={!input.trim() || isTyping}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Disclaimer */}
      <p className="mt-3 text-center text-xs text-muted-foreground">
        <Sparkles className="mr-1 inline h-3 w-3" />
        I&apos;ll suggest doctors and community posts based on your needs.
      </p>
    </div>
  )
}

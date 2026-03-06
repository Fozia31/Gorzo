"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { useAuth } from "@/lib/auth-context"
import { 
  FileText,
  Mic,
  MicOff,
  Upload,
  Save,
  Eye,
  Trash2,
  PlayCircle,
  PauseCircle,
  Square,
  Clock,
  Check,
  Users,
  MessageSquare,
  Send,
  Search,
  UserPlus,
  Activity,
  Calendar,
  ChevronRight,
  Star,
  TrendingUp,
  ThumbsUp
} from "lucide-react"
import { cn } from "@/lib/utils"

// Sample patients
const samplePatients = [
  {
    id: 1,
    username: "WellnessSeeker",
    avatar: "WS",
    lastVisit: "2 hours ago",
    status: "active",
    tier: "premium",
    unreadMessages: 2,
    consultations: 5,
    joinedDate: "Jan 2024",
  },
  {
    id: 2,
    username: "BloomingFlower",
    avatar: "BF",
    lastVisit: "Yesterday",
    status: "active",
    tier: "premium",
    unreadMessages: 0,
    consultations: 3,
    joinedDate: "Feb 2024",
  },
  {
    id: 3,
    username: "HopefulMama",
    avatar: "HM",
    lastVisit: "3 days ago",
    status: "inactive",
    tier: "premium",
    unreadMessages: 1,
    consultations: 8,
    joinedDate: "Nov 2023",
  },
  {
    id: 4,
    username: "StrongSister",
    avatar: "SS",
    lastVisit: "1 week ago",
    status: "inactive",
    tier: "free",
    unreadMessages: 0,
    consultations: 1,
    joinedDate: "Mar 2024",
  },
]

// Sample published articles
const publishedArticles = [
  {
    id: 1,
    title: "Understanding Your Hormonal Cycle: A Complete Guide",
    category: "Hormones",
    publishedAt: "2 days ago",
    views: 234,
    hasVoiceNote: true,
  },
  {
    id: 2,
    title: "Nutrition Tips for Each Phase of Your Cycle",
    category: "Nutrition",
    publishedAt: "4 days ago",
    views: 156,
    hasVoiceNote: true,
  },
  {
    id: 3,
    title: "Managing Stress and Its Impact on Fertility",
    category: "Fertility",
    publishedAt: "1 week ago",
    views: 89,
    hasVoiceNote: false,
  },
]

const categories = ["Hormones", "Nutrition", "Fertility", "Conditions", "Wellness", "Mental Health"]

// Sample ratings from patients
const myRatings = [
  {
    id: 1,
    user: "Selam123",
    rating: 5,
    comment: "Dr. Amara was incredibly helpful and understanding. She took the time to explain everything clearly and made me feel comfortable discussing sensitive topics.",
    date: "2 days ago",
    anonymous: false,
  },
  {
    id: 2,
    user: "Anonymous User",
    rating: 5,
    comment: "Best consultation experience I've had. Very professional and caring approach.",
    date: "1 week ago",
    anonymous: true,
  },
  {
    id: 3,
    user: "HealthyMama22",
    rating: 4,
    comment: "Good advice, though response took a bit longer than expected. Would still recommend.",
    date: "2 weeks ago",
    anonymous: false,
  },
  {
    id: 4,
    user: "WellnessJourney",
    rating: 5,
    comment: "Dr. Amara helped me understand my cycle better. Her advice was practical and easy to follow. Highly recommend!",
    date: "3 weeks ago",
    anonymous: false,
  },
  {
    id: 5,
    user: "Anonymous User",
    rating: 4,
    comment: "Very knowledgeable and patient. Answered all my questions thoroughly.",
    date: "1 month ago",
    anonymous: true,
  },
]

// Rating statistics
const ratingStats = {
  average: 4.9,
  total: 156,
  distribution: [
    { stars: 5, count: 128, percentage: 82 },
    { stars: 4, count: 22, percentage: 14 },
    { stars: 3, count: 4, percentage: 3 },
    { stars: 2, count: 1, percentage: 1 },
    { stars: 1, count: 1, percentage: 0 },
  ],
  thisMonth: 12,
  lastMonth: 8,
}

export default function DoctorDashboardPage() {
  const { user, login } = useAuth()
  const [patients, setPatients] = useState(samplePatients)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<typeof samplePatients[0] | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasRecording, setHasRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [messageToSend, setMessageToSend] = useState("")
  const [sendingVoiceNote, setSendingVoiceNote] = useState(false)
  const [articleData, setArticleData] = useState({
    title: "",
    category: "Hormones",
    content: "",
  })
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-login for demo
  useEffect(() => {
    if (!user) {
      login({
        id: "2",
        username: "Dr. Amara Bekele",
        email: "doctor@example.com",
        role: "doctor",
        tier: "premium",
      })
    }
  }, [user, login])

  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setHasRecording(true)
  }

  const deleteRecording = () => {
    setHasRecording(false)
    setRecordingTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePublish = () => {
    alert("Article published successfully!")
    setArticleData({ title: "", category: "Hormones", content: "" })
    setHasRecording(false)
    setRecordingTime(0)
  }

  const handleSendMessage = (type: "text" | "voice") => {
    if (type === "text" && messageToSend.trim()) {
      alert(`Message sent to ${selectedPatient?.username}: ${messageToSend}`)
      setMessageToSend("")
    } else if (type === "voice" && hasRecording) {
      alert(`Voice note sent to ${selectedPatient?.username}`)
      setHasRecording(false)
      setRecordingTime(0)
      setSendingVoiceNote(false)
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
          Doctor Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your patients and create educational content
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-primary/10 p-2">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-semibold">{patients.length}</p>
              <p className="text-xs text-muted-foreground">Patients</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-secondary/30 p-2">
              <MessageSquare className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold">
                {patients.reduce((acc, p) => acc + p.unreadMessages, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Unread</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-muted p-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold">{publishedArticles.length}</p>
              <p className="text-xs text-muted-foreground">Articles</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-primary/10 p-2">
              <Star className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <p className="text-xl font-semibold">{ratingStats.average}</p>
                <Star className="h-3 w-3 fill-primary text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">{ratingStats.total} reviews</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patients" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-xl">
          <TabsTrigger value="patients" className="gap-2">
            <Users className="h-4 w-4" />
            Patients
          </TabsTrigger>
          <TabsTrigger value="ratings" className="gap-2">
            <Star className="h-4 w-4" />
            My Ratings
          </TabsTrigger>
          <TabsTrigger value="create" className="gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="published" className="gap-2">
            <Eye className="h-4 w-4" />
            Published
          </TabsTrigger>
        </TabsList>

        {/* Patients Tab */}
        <TabsContent value="patients" className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className="overflow-hidden transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-border">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {patient.avatar}
                          </AvatarFallback>
                        </Avatar>
                        {patient.status === "active" && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{patient.username}</span>
                          <Badge 
                            variant={patient.tier === "premium" ? "default" : "outline"}
                            className="h-5 text-[10px]"
                          >
                            {patient.tier}
                          </Badge>
                          {patient.unreadMessages > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center">
                              {patient.unreadMessages}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {patient.lastVisit}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {patient.consultations} consultations
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedPatient(patient)}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Message
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Send Message to {patient.username}</DialogTitle>
                            <DialogDescription>
                              Send a text message or voice note to your patient
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Tabs defaultValue="text" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="text">Text Message</TabsTrigger>
                                <TabsTrigger value="voice" onClick={() => setSendingVoiceNote(true)}>
                                  Voice Note
                                </TabsTrigger>
                              </TabsList>
                              <TabsContent value="text" className="mt-4">
                                <Textarea
                                  placeholder="Type your message..."
                                  rows={4}
                                  value={messageToSend}
                                  onChange={(e) => setMessageToSend(e.target.value)}
                                />
                              </TabsContent>
                              <TabsContent value="voice" className="mt-4">
                                <div className="flex flex-col items-center gap-4 rounded-xl bg-muted/50 p-6">
                                  {!hasRecording ? (
                                    <>
                                      {isRecording ? (
                                        <div className="flex flex-col items-center gap-4">
                                          <div className="relative">
                                            <div className="h-16 w-16 animate-pulse rounded-full bg-destructive/20" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                              <MicOff className="h-6 w-6 text-destructive" />
                                            </div>
                                          </div>
                                          <div className="text-center">
                                            <p className="text-xl font-mono font-semibold">{formatTime(recordingTime)}</p>
                                            <p className="text-sm text-muted-foreground">Recording...</p>
                                          </div>
                                          <Button variant="destructive" size="sm" onClick={stopRecording}>
                                            <Square className="mr-2 h-4 w-4" />
                                            Stop
                                          </Button>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                            <Mic className="h-6 w-6 text-primary" />
                                          </div>
                                          <Button onClick={startRecording} size="sm">
                                            <Mic className="mr-2 h-4 w-4" />
                                            Start Recording
                                          </Button>
                                        </>
                                      )}
                                    </>
                                  ) : (
                                    <div className="flex flex-col items-center gap-3">
                                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/30">
                                        <Check className="h-6 w-6 text-secondary-foreground" />
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        Duration: {formatTime(recordingTime)}
                                      </p>
                                      <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                                          {isPlaying ? <PauseCircle className="mr-2 h-4 w-4" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                                          {isPlaying ? "Pause" : "Preview"}
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={deleteRecording} className="text-destructive">
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </TabsContent>
                            </Tabs>
                          </div>
                          <DialogFooter>
                            <Button 
                              onClick={() => handleSendMessage(sendingVoiceNote && hasRecording ? "voice" : "text")}
                              disabled={(!messageToSend.trim() && !hasRecording)}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Send
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No patients found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Your patients will appear here"}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Ratings Tab */}
        <TabsContent value="ratings" className="mt-6 space-y-6">
          {/* Rating Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">{ratingStats.average}</span>
                    <span className="text-2xl text-muted-foreground">/5</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-5 w-5",
                          i < Math.floor(ratingStats.average)
                            ? "fill-secondary-foreground text-secondary-foreground"
                            : "text-muted"
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Based on {ratingStats.total} reviews
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-secondary-foreground" />
                    <span className="text-secondary-foreground font-medium">
                      +{ratingStats.thisMonth - ratingStats.lastMonth} reviews this month
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ratingStats.distribution.map((item) => (
                  <div key={item.stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm font-medium">{item.stars}</span>
                      <Star className="h-3 w-3 fill-secondary-foreground text-secondary-foreground" />
                    </div>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-secondary-foreground rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Reviews */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <ThumbsUp className="h-5 w-5 text-primary" />
                Recent Reviews
              </h2>
              <Badge variant="outline" className="gap-1">
                {ratingStats.thisMonth} this month
              </Badge>
            </div>

            <div className="space-y-3">
              {myRatings.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={cn(
                            "text-sm",
                            review.anonymous ? "bg-muted" : "bg-primary/10 text-primary"
                          )}>
                            {review.anonymous ? "?" : review.user.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{review.user}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < review.rating
                                ? "fill-secondary-foreground text-secondary-foreground"
                                : "text-muted"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button variant="outline" className="gap-2">
                View All Reviews
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Create Content Tab */}
        <TabsContent value="create" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>New Article</CardTitle>
              <CardDescription>
                Write educational content for the Knowledge Hub
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Article Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter article title..."
                    value={articleData.title}
                    onChange={(e) => setArticleData({ ...articleData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={articleData.category}
                    onChange={(e) => setArticleData({ ...articleData, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your article content here..."
                  rows={10}
                  value={articleData.content}
                  onChange={(e) => setArticleData({ ...articleData, content: e.target.value })}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" />
                Voice Note
              </CardTitle>
              <CardDescription>
                Record or upload an audio summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4 rounded-xl bg-muted/50 p-6">
                {!hasRecording ? (
                  <>
                    {isRecording ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="h-20 w-20 animate-pulse rounded-full bg-destructive/20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <MicOff className="h-8 w-8 text-destructive" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-mono font-semibold">{formatTime(recordingTime)}</p>
                          <p className="text-sm text-muted-foreground">Recording...</p>
                        </div>
                        <Button variant="destructive" onClick={stopRecording}>
                          <Square className="mr-2 h-4 w-4" />
                          Stop Recording
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                          <Mic className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button onClick={startRecording} className="gap-2">
                            <Mic className="h-4 w-4" />
                            Start Recording
                          </Button>
                          <Button variant="outline" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Audio
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex w-full flex-col items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/30">
                      <Check className="h-8 w-8 text-secondary-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Voice note recorded</p>
                      <p className="text-sm text-muted-foreground">Duration: {formatTime(recordingTime)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? <PauseCircle className="mr-2 h-4 w-4" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                        {isPlaying ? "Pause" : "Preview"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={deleteRecording} className="text-destructive hover:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button onClick={handlePublish} disabled={!articleData.title || !articleData.content}>
              <Check className="mr-2 h-4 w-4" />
              Publish Article
            </Button>
          </div>
        </TabsContent>

        {/* Published Tab */}
        <TabsContent value="published" className="mt-6 space-y-4">
          {publishedArticles.map((article) => (
            <Card key={article.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{article.title}</h3>
                      {article.hasVoiceNote && (
                        <Badge variant="secondary" className="gap-1">
                          <Mic className="h-3 w-3" />
                          Voice
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Badge variant="outline">{article.category}</Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.publishedAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views} views
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { 
  Crown,
  MessageCircle,
  Star,
  CheckCircle,
  Sparkles,
  Send,
  Shield,
  Clock,
  User,
  ArrowLeft,
  ThumbsUp,
  Calendar,
  X,
  Trash2,
  AlertTriangle,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

// Sample doctors with ratings and reviews from users
const doctors = [
  {
    id: 1,
    name: "Dr. Amara Bekele",
    specialty: "Gynecologist",
    avatar: "/doctors/amara.jpg",
    rating: 4.9,
    totalReviews: 156,
    available: true,
    responseTime: "Usually responds in 2 hours",
    experience: "12 years",
    bio: "Specialized in women's reproductive health, pregnancy care, and hormonal disorders.",
    reviews: [
      { id: 1, user: "Anonymous User", rating: 5, comment: "Very professional and caring. Made me feel comfortable discussing sensitive topics.", date: "2 weeks ago" },
      { id: 2, user: "HealthyMama22", rating: 5, comment: "Dr. Amara helped me understand my cycle better. Highly recommend!", date: "1 month ago" },
      { id: 3, user: "WellnessJourney", rating: 4, comment: "Good advice, though response took a bit longer than expected.", date: "1 month ago" },
    ]
  },
  {
    id: 2,
    name: "Dr. Selam Haile",
    specialty: "Nutritionist",
    avatar: "/doctors/selam.jpg",
    rating: 4.8,
    totalReviews: 98,
    available: true,
    responseTime: "Usually responds in 3 hours",
    experience: "8 years",
    bio: "Expert in women's nutrition, weight management, and dietary planning for hormonal balance.",
    reviews: [
      { id: 1, user: "FitnessFocus", rating: 5, comment: "Her meal plans are practical and easy to follow. Lost 5kg in 2 months!", date: "3 weeks ago" },
      { id: 2, user: "BusyMom123", rating: 5, comment: "Finally found a nutritionist who understands Ethiopian food culture.", date: "1 month ago" },
      { id: 3, user: "Anonymous User", rating: 4, comment: "Very knowledgeable. Helped me with my PCOS diet.", date: "2 months ago" },
    ]
  },
  {
    id: 3,
    name: "Dr. Hana Tadesse",
    specialty: "Reproductive Health",
    avatar: "/doctors/hana.jpg",
    rating: 4.9,
    totalReviews: 124,
    available: false,
    responseTime: "Currently unavailable",
    experience: "15 years",
    bio: "Specializes in fertility, family planning, and reproductive disorders.",
    reviews: [
      { id: 1, user: "HopefulMother", rating: 5, comment: "Dr. Hana gave me hope when I was struggling with fertility issues.", date: "1 week ago" },
      { id: 2, user: "Anonymous User", rating: 5, comment: "Extremely compassionate and thorough. Best doctor I've consulted.", date: "3 weeks ago" },
      { id: 3, user: "NewMom2024", rating: 5, comment: "She guided me through my entire pregnancy journey.", date: "2 months ago" },
    ]
  },
  {
    id: 4,
    name: "Dr. Meron Alemu",
    specialty: "Mental Health",
    avatar: "/doctors/meron.jpg",
    rating: 4.7,
    totalReviews: 89,
    available: true,
    responseTime: "Usually responds in 4 hours",
    experience: "10 years",
    bio: "Specializes in women's mental health, postpartum depression, and anxiety disorders.",
    reviews: [
      { id: 1, user: "Anonymous User", rating: 5, comment: "Finally someone who understands the mental load women carry.", date: "1 week ago" },
      { id: 2, user: "StrongWoman", rating: 4, comment: "Helpful sessions, though I wish there were more follow-ups.", date: "1 month ago" },
      { id: 3, user: "NewMomStruggles", rating: 5, comment: "Helped me through postpartum anxiety. Forever grateful.", date: "6 weeks ago" },
    ]
  },
]

const premiumFeatures = [
  "Direct private chat with certified doctors",
  "Priority responses within 24 hours",
  "Personalized health advice",
  "Secure and confidential conversations",
  "Access to all Knowledge Hub content",
  "Cancel anytime"
]

// Chat Room type
type ChatRoom = {
  id: string
  doctor: typeof doctors[0]
  createdAt: string
  messages: {
    id: number
    sender: "user" | "doctor"
    content: string
    time: string
  }[]
}

// Rating Dialog Component
function RatingDialog({
  doctor,
  open,
  onClose,
  onSubmit
}: {
  doctor: typeof doctors[0] | null
  open: boolean
  onClose: () => void
  onSubmit: (rating: number, comment: string, anonymous: boolean) => void
}) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [anonymous, setAnonymous] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!doctor) return null

  const handleSubmit = () => {
    if (rating === 0) return
    onSubmit(rating, comment, anonymous)
    setSubmitted(true)
  }

  const handleClose = () => {
    setRating(0)
    setHoverRating(0)
    setComment("")
    setAnonymous(false)
    setSubmitted(false)
    onClose()
  }

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/30">
              <CheckCircle className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Thank You!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your feedback helps other women find the right doctor and helps {doctor.name} improve their service.
            </p>
            <Button onClick={handleClose} className="mt-6">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Rate Your Experience
          </DialogTitle>
          <DialogDescription>
            Share your experience with {doctor.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Doctor Info */}
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={doctor.avatar} />
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {doctor.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{doctor.name}</p>
              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Your Rating</Label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      (hoverRating || rating) >= star
                        ? "fill-secondary-foreground text-secondary-foreground"
                        : "text-muted"
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {rating === 0 && "Tap to rate"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Share Your Experience (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Tell others about your experience with this doctor..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Post anonymously</span>
            </div>
            <button
              type="button"
              onClick={() => setAnonymous(!anonymous)}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                anonymous ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background transition-transform shadow-sm",
                  anonymous && "translate-x-5"
                )}
              />
            </button>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleSubmit} disabled={rating === 0} className="w-full gap-2">
            <Send className="h-4 w-4" />
            Submit Rating
          </Button>
          <Button variant="ghost" onClick={handleClose} className="w-full">
            Skip for Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Doctor Profile View with Reviews
function DoctorProfileView({ 
  doctor, 
  onBack, 
  onContact,
}: { 
  doctor: typeof doctors[0]
  onBack: () => void
  onContact: () => void
}) {
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Doctors
      </Button>

      {/* Doctor Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
            <Avatar className="h-24 w-24">
              <AvatarImage src={doctor.avatar} />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl">
                {doctor.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-serif text-2xl font-semibold">{doctor.name}</h1>
              <p className="text-muted-foreground">{doctor.specialty}</p>
              <div className="mt-2 flex items-center justify-center gap-4 md:justify-start">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-secondary-foreground text-secondary-foreground" />
                  <span className="font-semibold">{doctor.rating}</span>
                  <span className="text-sm text-muted-foreground">({doctor.totalReviews} reviews)</span>
                </div>
                <Badge variant={doctor.available ? "default" : "secondary"}>
                  {doctor.available ? "Available" : "Unavailable"}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground md:justify-start">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {doctor.experience} experience
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {doctor.responseTime}
                </span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{doctor.bio}</p>
            </div>
            <div className="w-full md:w-auto">
              <Button 
                onClick={onContact}
                disabled={!doctor.available}
                className="w-full gap-2"
                size="lg"
              >
                <MessageCircle className="h-4 w-4" />
                {doctor.available ? "Contact Doctor" : "Currently Unavailable"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ThumbsUp className="h-5 w-5 text-primary" />
          Patient Reviews ({doctor.totalReviews})
        </h2>
        <div className="space-y-3">
          {doctor.reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-xs">
                        {review.user.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{review.user}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "h-3 w-3",
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
        <p className="text-center text-sm text-muted-foreground">
          Showing top 3 reviews. Contact doctor to see all reviews.
        </p>
      </div>
    </div>
  )
}

// Payment Required Dialog
function PaymentDialog({ 
  doctor, 
  open, 
  onClose 
}: { 
  doctor: typeof doctors[0] | null
  open: boolean
  onClose: () => void
}) {
  if (!doctor) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Premium Required
          </DialogTitle>
          <DialogDescription>
            Upgrade to Premium to chat with {doctor.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={doctor.avatar} />
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {doctor.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{doctor.name}</p>
              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
            </div>
          </div>

          <div className="rounded-xl bg-card border p-4">
            <div className="mb-3 flex items-baseline justify-center gap-1">
              <span className="text-2xl font-bold text-foreground">299 ETB</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-2">
              {premiumFeatures.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-secondary-foreground" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Secure payment via M-Pesa</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link href={`/dashboard/payment?doctor=${doctor.id}`} className="w-full">
            <Button className="w-full gap-2">
              <Sparkles className="h-4 w-4" />
              Upgrade to Premium
            </Button>
          </Link>
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Chat Room View for premium users
function ChatRoomView({ 
  chatRoom, 
  onBack,
  onOpenRating,
  onClearHistory
}: { 
  chatRoom: ChatRoom
  onBack: () => void
  onOpenRating: () => void
  onClearHistory: () => void
}) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState(chatRoom.messages)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "user" as const,
        content: message.trim(),
        time: "Just now"
      }
      setMessages([...messages, newMessage])
      setMessage("")
    }
  }

  const handleClearHistory = () => {
    setMessages([])
    onClearHistory()
    setShowClearDialog(false)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-border p-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={chatRoom.doctor.avatar} />
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            {chatRoom.doctor.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-medium">{chatRoom.doctor.name}</h3>
          <p className="text-xs text-muted-foreground">{chatRoom.doctor.specialty}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onOpenRating} className="gap-1">
            <Star className="h-3 w-3" />
            Rate
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowClearDialog(true)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium">Start your conversation</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Send a message to {chatRoom.doctor.name}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.sender === "user" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2",
                msg.sender === "user" 
                  ? "bg-primary text-primary-foreground rounded-br-sm" 
                  : "bg-muted rounded-bl-sm"
              )}>
                <p className="text-sm">{msg.content}</p>
                <p className={cn(
                  "mt-1 text-[10px]",
                  msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Clear History Confirmation */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Clear Chat History?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages in this conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Main Consulting Page
export default function ConsultingPage() {
  const { user, updateTier } = useAuth()
  const isPremium = user?.tier === "premium"
  
  const [view, setView] = useState<"list" | "profile" | "chat">("list")
  const [selectedDoctor, setSelectedDoctor] = useState<typeof doctors[0] | null>(null)
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  
  // Chat rooms created after payment - in real app this would come from database
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    // Sample existing chat room for demo
    {
      id: "chat-1",
      doctor: doctors[0],
      createdAt: "2 days ago",
      messages: [
        {
          id: 1,
          sender: "user",
          content: "Hello Dr. Amara, I've been experiencing some health concerns lately.",
          time: "2 days ago"
        },
        {
          id: 2,
          sender: "doctor",
          content: "Hello! Thank you for reaching out. I'm here to help. Can you tell me more about what you're experiencing?",
          time: "2 days ago"
        },
        {
          id: 3,
          sender: "user",
          content: "I've been having irregular symptoms for the past few weeks.",
          time: "1 day ago"
        },
        {
          id: 4,
          sender: "doctor",
          content: "I understand. Let me ask you a few questions to better understand your situation. Have you noticed any patterns?",
          time: "1 day ago"
        },
      ]
    }
  ])

  // Auto-set premium for demo if coming from successful payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("payment") === "success") {
      updateTier("premium")
      const doctorId = params.get("doctor")
      if (doctorId) {
        const doctor = doctors.find(d => d.id === parseInt(doctorId))
        if (doctor) {
          // Create new chat room for the doctor
          const existingRoom = chatRooms.find(r => r.doctor.id === doctor.id)
          if (!existingRoom) {
            const newRoom: ChatRoom = {
              id: `chat-${Date.now()}`,
              doctor: doctor,
              createdAt: "Just now",
              messages: []
            }
            setChatRooms([newRoom, ...chatRooms])
            setSelectedChatRoom(newRoom)
            setView("chat")
          }
        }
      }
    }
  }, [])

  const handleDoctorClick = (doctor: typeof doctors[0]) => {
    setSelectedDoctor(doctor)
    setView("profile")
  }

  const handleContactDoctor = () => {
    if (!selectedDoctor) return
    
    if (isPremium) {
      // Check if chat room exists
      const existingRoom = chatRooms.find(r => r.doctor.id === selectedDoctor.id)
      if (existingRoom) {
        setSelectedChatRoom(existingRoom)
        setView("chat")
      } else {
        // Create new chat room
        const newRoom: ChatRoom = {
          id: `chat-${Date.now()}`,
          doctor: selectedDoctor,
          createdAt: "Just now",
          messages: []
        }
        setChatRooms([newRoom, ...chatRooms])
        setSelectedChatRoom(newRoom)
        setView("chat")
      }
    } else {
      setShowPaymentDialog(true)
    }
  }

  const handleOpenExistingChat = (chatRoom: ChatRoom) => {
    setSelectedChatRoom(chatRoom)
    setSelectedDoctor(chatRoom.doctor)
    setView("chat")
  }

  const handleBack = () => {
    if (view === "chat") {
      setSelectedChatRoom(null)
      setView("list")
    } else if (view === "profile") {
      setSelectedDoctor(null)
      setView("list")
    }
  }

  const handleRatingSubmit = (rating: number, comment: string, anonymous: boolean) => {
    // In real app, this would submit to database
    console.log("Rating submitted:", { rating, comment, anonymous, doctor: selectedDoctor?.id })
  }

  const handleClearHistory = () => {
    if (selectedChatRoom) {
      setChatRooms(chatRooms.map(room => 
        room.id === selectedChatRoom.id 
          ? { ...room, messages: [] }
          : room
      ))
    }
  }

  // Chat Room View
  if (view === "chat" && selectedChatRoom) {
    return (
      <>
        <ChatRoomView 
          chatRoom={selectedChatRoom}
          onBack={handleBack}
          onOpenRating={() => setShowRatingDialog(true)}
          onClearHistory={handleClearHistory}
        />
        <RatingDialog
          doctor={selectedChatRoom.doctor}
          open={showRatingDialog}
          onClose={() => setShowRatingDialog(false)}
          onSubmit={handleRatingSubmit}
        />
      </>
    )
  }

  // Doctor Profile View
  if (view === "profile" && selectedDoctor) {
    return (
      <>
        <DoctorProfileView 
          doctor={selectedDoctor}
          onBack={handleBack}
          onContact={handleContactDoctor}
        />
        <PaymentDialog 
          doctor={selectedDoctor}
          open={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
        />
      </>
    )
  }

  // Doctors List View (default)
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
          Consulting
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect with certified healthcare professionals
        </p>
      </div>

      {/* Premium User: Active Chats */}
      {isPremium && chatRooms.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <MessageCircle className="h-5 w-5 text-primary" />
              Your Conversations
            </h2>
            <Badge variant="secondary" className="gap-1">
              <Crown className="h-3 w-3" />
              Premium
            </Badge>
          </div>
          <div className="grid gap-3">
            {chatRooms.map((room) => (
              <Card 
                key={room.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
                onClick={() => handleOpenExistingChat(room)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={room.doctor.avatar} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {room.doctor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-medium">{room.doctor.name}</h3>
                        <span className="text-xs text-muted-foreground shrink-0">{room.createdAt}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{room.doctor.specialty}</p>
                      {room.messages.length > 0 && (
                        <p className="mt-1 text-sm text-muted-foreground truncate">
                          {room.messages[room.messages.length - 1].content}
                        </p>
                      )}
                    </div>
                    <MessageCircle className="h-5 w-5 text-primary shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Doctors */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          {isPremium ? "Start New Conversation" : "Available Doctors"}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {doctors.map((doctor) => {
            const hasExistingChat = chatRooms.some(r => r.doctor.id === doctor.id)
            return (
              <Card 
                key={doctor.id}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => handleDoctorClick(doctor)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={doctor.avatar} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{doctor.name}</h3>
                        {hasExistingChat && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <MessageCircle className="h-3 w-3" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-secondary-foreground text-secondary-foreground" />
                          <span className="text-sm font-medium">{doctor.rating}</span>
                          <span className="text-xs text-muted-foreground">({doctor.totalReviews})</span>
                        </div>
                        <Badge variant={doctor.available ? "default" : "secondary"} className="text-xs">
                          {doctor.available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Premium Promo for Free Users */}
      {!isPremium && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center md:flex-row md:text-left gap-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Unlock Premium Consultations</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Get direct access to certified doctors, priority responses, and personalized health advice.
                </p>
              </div>
              <Link href="/dashboard/payment">
                <Button className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Crown,
  MessageCircle,
  Send,
  Shield,
  Sparkles,
  Star,
  ThumbsUp,
  Trash2,
  User,
} from "lucide-react"

import * as chatApi from "@/api/chatApi"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { getSocket } from "@/lib/socket"
import { cn } from "@/lib/utils"

type Review = {
  id: number
  user: string
  rating: number
  comment: string
  date: string
}

type Doctor = {
  id: number
  name: string
  specialty: string
  avatar: string
  rating: number
  totalReviews: number
  experience: string
  responseTime: string
  bio: string
  available: boolean
  reviews: Review[]
}

type ChatMessage = {
  id: string | number
  sender: "user" | "doctor"
  content: string
  time: string
}

type ChatRoom = {
  id: string
  doctor: Doctor
  createdAt: string
  messages: ChatMessage[]
}

const premiumFeatures = [
  "Direct private chat with certified doctors",
  "Priority responses within 24 hours",
  "Personalized health advice",
  "Secure and confidential conversations",
  "Access to all Knowledge Hub content",
  "Cancel anytime",
]

const doctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Amara Bekele",
    specialty: "Gynecologist",
    avatar: "/placeholder-user.jpg",
    rating: 4.9,
    totalReviews: 156,
    experience: "8 years",
    responseTime: "Usually replies in 2 hours",
    bio: "Specialized in menstrual health and hormonal disorders.",
    available: true,
    reviews: [
      { id: 1, user: "Selam123", rating: 5, comment: "Very helpful and professional.", date: "2 days ago" },
      { id: 2, user: "Anonymous", rating: 5, comment: "Clear advice and quick response.", date: "1 week ago" },
      { id: 3, user: "WellnessJourney", rating: 4, comment: "Great consultation experience.", date: "2 weeks ago" },
    ],
  },
  {
    id: 2,
    name: "Dr. Hana Tesfaye",
    specialty: "Reproductive Endocrinologist",
    avatar: "/placeholder-user.jpg",
    rating: 4.8,
    totalReviews: 98,
    experience: "10 years",
    responseTime: "Usually replies in 4 hours",
    bio: "Focuses on fertility and endocrine-related women's health.",
    available: true,
    reviews: [
      { id: 1, user: "BloomingFlower", rating: 5, comment: "Compassionate and knowledgeable.", date: "3 days ago" },
      { id: 2, user: "HopefulMama", rating: 4, comment: "Good practical suggestions.", date: "1 week ago" },
      { id: 3, user: "Anonymous", rating: 5, comment: "Excellent follow-up.", date: "2 weeks ago" },
    ],
  },
]

function ChatRoomView({ chatRoom, onBack, onOpenRating, onClearHistory }: {
  chatRoom: ChatRoom
  onBack: () => void
  onOpenRating: () => void
  onClearHistory: () => void
}) {
  const [message, setMessage] = useState("")
  const [sendError, setSendError] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>(chatRoom.messages)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null)

  useEffect(() => {
    const socket = getSocket()
    socket.connect()
    socket.emit("joinPremium", chatRoom.id)

    const onPremiumMessage = (data: { _id?: string; chatId: string; senderType?: string; messageText?: string; createdAt?: string }) => {
      if (data.chatId !== chatRoom.id) return
      setMessages((prev) => [
        ...prev,
        {
          id: data._id ?? Date.now(),
          sender: data.senderType === "doctor" ? "doctor" : "user",
          content: data.messageText ?? "",
          time: data.createdAt ? new Date(data.createdAt).toLocaleTimeString() : "Now",
        },
      ])
    }

    socket.on("premiumMessage", onPremiumMessage)
    socketRef.current = socket

    ;(async () => {
      try {
        const res = await chatApi.getMessages(chatRoom.id)
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        setMessages(
          list.map((msg: { _id?: string; senderType?: string; messageText?: string; createdAt?: string }) => ({
            id: msg._id ?? Date.now(),
            sender: msg.senderType === "doctor" ? "doctor" : "user",
            content: msg.messageText ?? "",
            time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : "Now",
          }))
        )
      } catch {
        // keep seeded messages on fetch error
      }
    })()

    return () => {
      socket.off("premiumMessage", onPremiumMessage)
      socket.disconnect()
    }
  }, [chatRoom.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    setSendError("")
    if (!message.trim()) return

    const newMsg = {
      chatId: chatRoom.id,
      senderId: "user",
      messageText: message.trim(),
      senderType: "user",
    }

    socketRef.current?.emit("premiumMessage", newMsg)

    try {
      await chatApi.sendMessage(newMsg)
    } catch {
      setSendError("Sorry, your message could not be sent. Please try again.")
      return
    }

    setMessage("")
  }

  const handleClear = () => {
    setMessages([])
    onClearHistory()
    setShowClearDialog(false)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <Avatar className="h-10 w-10"><AvatarImage src={chatRoom.doctor.avatar} /><AvatarFallback>{chatRoom.doctor.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
        <div className="flex-1"><h3 className="font-medium">{chatRoom.doctor.name}</h3><p className="text-xs text-muted-foreground">{chatRoom.doctor.specialty}</p></div>
        <Button variant="outline" size="sm" onClick={onOpenRating} className="gap-1"><Star className="h-3 w-3" />Rate</Button>
        <Button variant="ghost" size="icon" onClick={() => setShowClearDialog(true)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? <p className="text-center text-sm text-muted-foreground">Start your conversation</p> : messages.map((msg) => (
          <div key={msg.id} className={cn("flex", msg.sender === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[80%] rounded-2xl px-4 py-2", msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
              <p className="text-sm">{msg.content}</p>
              <p className="mt-1 text-[10px] opacity-70">{msg.time}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border p-4">
        {sendError && <div className="mb-2 text-sm text-destructive">{sendError}</div>}
        <div className="flex gap-2">
          <Input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Type your message..." className="flex-1" />
          <Button onClick={handleSend} disabled={!message.trim()}><Send className="h-4 w-4" /></Button>
        </div>
      </div>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" />Clear Chat History?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete all messages in this conversation.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Clear History</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function RatingDialog({ doctor, open, onClose, onSubmit }: {
  doctor: Doctor | null
  open: boolean
  onClose: () => void
  onSubmit: (rating: number, comment: string, anonymous: boolean) => void
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [anonymous, setAnonymous] = useState(false)
  if (!doctor) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Rate {doctor.name}</DialogTitle><DialogDescription>Share your consultation experience.</DialogDescription></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2">{[1, 2, 3, 4, 5].map((n) => <Button key={n} variant={n <= rating ? "default" : "outline"} size="sm" onClick={() => setRating(n)}>{n}</Button>)}</div>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional comment" rows={4} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={anonymous} onChange={() => setAnonymous((v) => !v)} />Post anonymously</label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Skip</Button>
          <Button onClick={() => { onSubmit(rating, comment, anonymous); onClose() }} disabled={rating === 0}><Send className="mr-2 h-4 w-4" />Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PaymentDialog({ doctor, open, onClose }: { doctor: Doctor | null; open: boolean; onClose: () => void }) {
  if (!doctor) return null
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-primary" />Premium Required</DialogTitle>
          <DialogDescription>Upgrade to chat with {doctor.name}</DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 py-2">{premiumFeatures.slice(0, 4).map((f) => <li key={f} className="flex items-start gap-2 text-sm"><CheckCircle className="mt-0.5 h-4 w-4" />{f}</li>)}</ul>
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Shield className="h-3 w-3" />Secure payment via M-Pesa</div>
        <Link href={`/dashboard/payment?doctor=${doctor.id}`} className="mt-3 block"><Button className="w-full">Upgrade to Premium</Button></Link>
      </DialogContent>
    </Dialog>
  )
}

export default function ConsultingPage() {
  const { user, updateTier } = useAuth()
  const isPremium = user?.tier === "premium"

  const [view, setView] = useState<"list" | "profile" | "chat">("list")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showRatingDialog, setShowRatingDialog] = useState(false)

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([{ id: "chat-1", doctor: doctors[0], createdAt: "2 days ago", messages: [] }])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("payment") === "success" && user?.tier !== "premium") {
      updateTier("premium")
    }
  }, [updateTier, user?.tier])

  const byDoctorId = useMemo(() => new Map(chatRooms.map((r) => [r.doctor.id, r])), [chatRooms])

  const openDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setView("profile")
  }

  const startOrOpenChat = () => {
    if (!selectedDoctor) return
    if (!isPremium) {
      setShowPaymentDialog(true)
      return
    }

    const existing = byDoctorId.get(selectedDoctor.id)
    const room = existing ?? { id: `chat-${Date.now()}`, doctor: selectedDoctor, createdAt: "Just now", messages: [] }
    if (!existing) setChatRooms((prev) => [room, ...prev])
    setSelectedChatRoom(room)
    setView("chat")
  }

  if (view === "chat" && selectedChatRoom) {
    return (
      <>
        <ChatRoomView
          chatRoom={selectedChatRoom}
          onBack={() => setView("list")}
          onOpenRating={() => setShowRatingDialog(true)}
          onClearHistory={() => setChatRooms((prev) => prev.map((r) => r.id === selectedChatRoom.id ? { ...r, messages: [] } : r))}
        />
        <RatingDialog doctor={selectedChatRoom.doctor} open={showRatingDialog} onClose={() => setShowRatingDialog(false)} onSubmit={() => undefined} />
      </>
    )
  }

  if (view === "profile" && selectedDoctor) {
    return (
      <>
        <div className="space-y-6 p-4 md:p-6">
          <Button variant="ghost" size="sm" onClick={() => setView("list")} className="gap-2"><ArrowLeft className="h-4 w-4" />Back to Doctors</Button>
          <Card>
            <CardHeader>
              <CardTitle>{selectedDoctor.name}</CardTitle>
              <CardDescription>{selectedDoctor.specialty}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{selectedDoctor.bio}</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{selectedDoctor.experience}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{selectedDoctor.responseTime}</span>
              </div>
              <Button onClick={startOrOpenChat} disabled={!selectedDoctor.available} className="w-full">{selectedDoctor.available ? "Contact Doctor" : "Unavailable"}</Button>
            </CardContent>
          </Card>
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><ThumbsUp className="h-5 w-5" />Patient Reviews</h2>
            {selectedDoctor.reviews.map((r) => <Card key={r.id}><CardContent className="p-4"><p className="font-medium">{r.user}</p><p className="text-sm text-muted-foreground">{r.comment}</p></CardContent></Card>)}
          </div>
        </div>
        <PaymentDialog doctor={selectedDoctor} open={showPaymentDialog} onClose={() => setShowPaymentDialog(false)} />
      </>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Consulting</h1>
        <p className="mt-1 text-sm text-muted-foreground">Connect with certified healthcare professionals</p>
      </div>

      {isPremium && chatRooms.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><MessageCircle className="h-5 w-5" />Your Conversations</h2>
          {chatRooms.map((room) => (
            <Card key={room.id} className="cursor-pointer" onClick={() => { setSelectedDoctor(room.doctor); setSelectedChatRoom(room); setView("chat") }}>
              <CardContent className="flex items-center gap-3 p-4">
                <Avatar className="h-10 w-10"><AvatarImage src={room.doctor.avatar} /><AvatarFallback>{room.doctor.name.slice(0, 2)}</AvatarFallback></Avatar>
                <div className="flex-1"><p className="font-medium">{room.doctor.name}</p><p className="text-sm text-muted-foreground">{room.doctor.specialty}</p></div>
                <Badge variant="secondary">Premium</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="cursor-pointer" onClick={() => openDoctor(doctor)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-14 w-14"><AvatarImage src={doctor.avatar} /><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between"><h3 className="font-semibold">{doctor.name}</h3><span className="text-sm">{doctor.rating}</span></div>
                  <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isPremium && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <div>
              <h3 className="text-lg font-semibold">Unlock Premium Consultations</h3>
              <p className="text-sm text-muted-foreground">Get direct doctor access and priority responses.</p>
            </div>
            <Link href="/dashboard/payment"><Button className="gap-2"><Sparkles className="h-4 w-4" />Upgrade</Button></Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

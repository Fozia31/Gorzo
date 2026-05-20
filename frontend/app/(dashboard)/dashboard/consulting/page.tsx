"use client"

import { useState, useEffect, useRef } from "react"
import * as chatApi from "@/api/chatApi"
import { getConsultationAccess } from "@/api/paymentApi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { getDoctorRatings, getDoctorRatingStats, getDoctors, submitDoctorRating } from "@/api/doctorApi"
import { getChats, getOrCreateDoctorChat } from "@/api/chatApi"
import { getMessagesByChat, sendMessage } from "@/api/messageApi"
import { 
  Crown,
  MessageCircle,
  Star,
  CheckCircle,
  CheckCircle2,
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
  Plus,
  Lock
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

// Sample doctors with ratings, reviews, and availability
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
    consultationFee: 299,
    availability: {
      Monday: { enabled: true, slots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "17:00" }] },
      Tuesday: { enabled: true, slots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "17:00" }] },
      Wednesday: { enabled: true, slots: [{ start: "09:00", end: "12:00" }] },
      Thursday: { enabled: true, slots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "17:00" }] },
      Friday: { enabled: true, slots: [{ start: "09:00", end: "12:00" }] },
      Saturday: { enabled: false, slots: [] },
      Sunday: { enabled: false, slots: [] },
    },
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
    consultationFee: 249,
    availability: {
      Monday: { enabled: true, slots: [{ start: "10:00", end: "13:00" }, { start: "15:00", end: "18:00" }] },
      Tuesday: { enabled: true, slots: [{ start: "10:00", end: "13:00" }] },
      Wednesday: { enabled: true, slots: [{ start: "10:00", end: "13:00" }, { start: "15:00", end: "18:00" }] },
      Thursday: { enabled: true, slots: [{ start: "10:00", end: "13:00" }] },
      Friday: { enabled: true, slots: [{ start: "10:00", end: "13:00" }, { start: "15:00", end: "18:00" }] },
      Saturday: { enabled: true, slots: [{ start: "10:00", end: "14:00" }] },
      Sunday: { enabled: false, slots: [] },
    },
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
    consultationFee: 349,
    availability: {
      Monday: { enabled: false, slots: [] },
      Tuesday: { enabled: false, slots: [] },
      Wednesday: { enabled: false, slots: [] },
      Thursday: { enabled: false, slots: [] },
      Friday: { enabled: false, slots: [] },
      Saturday: { enabled: false, slots: [] },
      Sunday: { enabled: false, slots: [] },
    },
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
    consultationFee: 279,
    availability: {
      Monday: { enabled: true, slots: [{ start: "08:00", end: "12:00" }] },
      Tuesday: { enabled: true, slots: [{ start: "08:00", end: "12:00" }, { start: "14:00", end: "16:00" }] },
      Wednesday: { enabled: false, slots: [] },
      Thursday: { enabled: true, slots: [{ start: "08:00", end: "12:00" }, { start: "14:00", end: "16:00" }] },
      Friday: { enabled: true, slots: [{ start: "08:00", end: "12:00" }] },
      Saturday: { enabled: false, slots: [] },
      Sunday: { enabled: false, slots: [] },
    },
    reviews: [
      { id: 1, user: "Anonymous User", rating: 5, comment: "Finally someone who understands the mental load women carry.", date: "1 week ago" },
      { id: 2, user: "StrongWoman", rating: 4, comment: "Helpful sessions, though I wish there were more follow-ups.", date: "1 month ago" },
      { id: 3, user: "NewMomStruggles", rating: 5, comment: "Helped me through postpartum anxiety. Forever grateful.", date: "6 weeks ago" },
    ]
  },
]
// Chat Room type
type ChatRoom = {
  id: string
  doctor: DoctorProfile
  createdAt: string
  messages: {
    id: number | string
    sender: "user" | "doctor"
    content: string
    time: string
  }[]
}

type PageMessage = {
  type: "success" | "error"
  text: string
}

const formatChatTime = (dateValue?: string | Date) => {
  if (!dateValue) return "Just now"
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return "Just now"

  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / (1000 * 60))
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const mapBackendMessageToUi = (item: any) => ({
  id: item?._id || `${Date.now()}`,
  sender: item?.senderRole === "Doctor" ? "doctor" : "user",
  content: item?.messageType === "voice" ? "Insight" : item?.messageText || "",
  time: formatChatTime(item?.createdAt),
})

// Rating Dialog Component
function RatingDialog({
  doctor,
  open,
  onClose,
  onSubmit
}: {
  doctor: DoctorProfile | null
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

// Helper function to get availability summary
function getAvailabilitySummary(availability: typeof doctors[0]["availability"]) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const shortDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const availableDays = days.filter(day => availability[day]?.enabled)
  
  if (availableDays.length === 0) return "Currently unavailable"
  if (availableDays.length === 7) return "Available all week"
  if (availableDays.length >= 5 && !availability["Saturday"]?.enabled && !availability["Sunday"]?.enabled) {
    return "Weekdays only"
  }
  
  return availableDays.map(d => shortDays[days.indexOf(d)]).join(", ")
}

// Doctor Profile View with Reviews
function DoctorProfileView({ 
  doctor, 
  onBack, 
  onContact,
  hasPaidAccess,
}: { 
  doctor: DoctorProfile
  onBack: () => void
  onContact: () => void
  hasPaidAccess: boolean
}) {
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const shortDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

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
              {hasPaidAccess ? (
                <Button 
                  onClick={onContact}
                  disabled={!doctor.available}
                  className="w-full gap-2"
                  size="lg"
                >
                  <MessageCircle className="h-4 w-4" />
                  {doctor.available ? "Open Chat" : "Currently Unavailable"}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button 
                    onClick={onContact}
                    disabled={!doctor.available}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <Crown className="h-4 w-4" />
                    {doctor.available ? `Pay ${doctor.consultationFee} ETB` : "Currently Unavailable"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    One-time payment for consultation access
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-primary" />
            Available Hours
          </CardTitle>
          <CardDescription>
            {getAvailabilitySummary(doctor.availability)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {daysOfWeek.map((day, index) => {
              const dayData = doctor.availability[day]
              const isAvailable = dayData?.enabled && dayData.slots.length > 0
              
              return (
                <div 
                  key={day} 
                  className={cn(
                    "flex items-center justify-between rounded-lg p-3",
                    isAvailable ? "bg-secondary/20" : "bg-muted/30"
                  )}
                >
                  <span className={cn(
                    "font-medium",
                    !isAvailable && "text-muted-foreground"
                  )}>
                    {shortDays[index]}
                  </span>
                  <div className="text-right">
                    {isAvailable ? (
                      <div className="flex flex-wrap justify-end gap-2">
                        {dayData.slots.map((slot, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {slot.start} - {slot.end}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unavailable</span>
                    )}
                  </div>
                </div>
              )
            })}
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
        {canLoadMoreReviews ? (
          <div className="flex justify-center">
            <Button variant="outline" onClick={onLoadMoreReviews} disabled={isLoadingReviews}>
              {isLoadingReviews ? "Loading..." : "Load More Reviews"}
            </Button>
          </div>
        ) : null}
        <p className="text-center text-sm text-muted-foreground">
          {doctor.reviews.length > 0 ? "Showing real reviews from patients." : "No reviews yet for this doctor."}
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
  doctor: DoctorProfile | null
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
            Pay for Consultation
          </DialogTitle>
          <DialogDescription>
            One-time payment to access chat with {doctor.name}
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
            <div className="flex-1">
              <p className="font-medium">{doctor.name}</p>
              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary">{doctor.consultationFee} ETB</p>
              <p className="text-xs text-muted-foreground">one-time</p>
            </div>
          </div>

          <div className="rounded-xl bg-card border p-4">
            <h4 className="font-medium mb-3">What you get:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-secondary-foreground" />
                <span className="text-muted-foreground">Private chat with {doctor.name}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-secondary-foreground" />
                <span className="text-muted-foreground">Personalized health advice</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-secondary-foreground" />
                <span className="text-muted-foreground">Response within 24 hours</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-secondary-foreground" />
                <span className="text-muted-foreground">Secure and confidential</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Secure payment via M-Pesa Ethiopia</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link href={`/dashboard/payment?doctor=${doctor.id}&amount=${doctor.consultationFee}`} className="w-full">
            <Button className="w-full gap-2">
              <Sparkles className="h-4 w-4" />
              Pay {doctor.consultationFee} ETB
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

// Chat Room View for paid users
function ChatRoomView({ 
  chatRoom, 
  onBack,
  onOpenRating,
  onClearHistory,
  onSendMessage,
  isSending,
}: { 
  chatRoom: ChatRoom
  onBack: () => void
  onOpenRating: () => void
  onClearHistory: () => void
  onSendMessage: (messageText: string) => Promise<void>
  isSending: boolean
}) {
  const [message, setMessage] = useState("")
  const [showClearDialog, setShowClearDialog] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatRoom.messages])

  const handleSend = async () => {
    if (message.trim()) {
      await onSendMessage(message.trim())
      setMessage("")
    }
    // Save to DB via chatApi
    try {
      await chatApi.sendMessage(newMsg)
    } catch (e) {
      setSendError("Sorry, your message could not be sent. Please try again.")
      return
    }
    setMessage("")
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
        {chatRoom.messages.length === 0 ? (
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
          chatRoom.messages.map((msg) => (
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
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void handleSend()}
            className="flex-1"
            disabled={isSending}
          />
          <Button onClick={() => void handleSend()} disabled={!message.trim() || isSending}>
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
  const { user } = useAuth()
  
  const [view, setView] = useState<"list" | "profile" | "chat">("list")
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null)
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [reviewPage, setReviewPage] = useState(1)
  const [reviewTotalPages, setReviewTotalPages] = useState(1)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [isLoadingChats, setIsLoadingChats] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  
  // Server-backed access per doctor
  const [paidDoctorIds, setPaidDoctorIds] = useState<number[]>([])
  
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])

  useEffect(() => {
    if (!user?.id) {
      setPaidDoctorIds([])
      return
    }

    const loadAccess = async () => {
      const checks = await Promise.all(
        doctors.map(async (doctor) => {
          try {
            const response = await getConsultationAccess({
              userId: user.id,
              doctorId: String(doctor.id),
            })
            return response?.data?.hasAccess ? doctor.id : null
          } catch {
            return null
          }
        })
      )
      setPaidDoctorIds(checks.filter((id): id is number => id !== null))
    }

    loadAccess()
  }, [user?.id])

  // Auto-handle payment success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("payment") === "success") {
      const doctorId = params.get("doctor")
      if (doctorId && user?.id) {
        const docId = parseInt(doctorId)
        const doctor = doctors.find(d => d.id === docId)
        ;(async () => {
          if (!doctor) return
          try {
            const response = await getConsultationAccess({
              userId: user.id,
              doctorId: String(docId),
            })
            const hasAccess = Boolean(response?.data?.hasAccess)
            if (!hasAccess) return

            setPaidDoctorIds((prev) => (prev.includes(docId) ? prev : [...prev, docId]))
            let roomToOpen: ChatRoom | null = null
            setChatRooms((prev) => {
              const existingRoom = prev.find((r) => r.doctor.id === docId)
              if (existingRoom) {
                roomToOpen = existingRoom
                return prev
              }
              const newRoom: ChatRoom = {
                id: `chat-${Date.now()}`,
                doctor,
                createdAt: "Just now",
                messages: [],
              }
              roomToOpen = newRoom
              return [newRoom, ...prev]
            })
            if (roomToOpen) {
              setSelectedChatRoom(roomToOpen)
              setSelectedDoctor(doctor)
              setView("chat")
            }
          } catch {
            // no-op: keep user on consulting page if access check fails
          }
        })()
      }
      // Clear URL params
      window.history.replaceState({}, '', '/dashboard/consulting')
    }
  }, [user?.id])

  const hasPaidForDoctor = (doctorId: number) => paidDoctorIds.includes(doctorId)

  const handleDoctorClick = (doctor: typeof doctors[0]) => {
    setSelectedDoctor(doctor)
    setView("profile")
  }

  const handleContactDoctor = () => {
    if (!selectedDoctor) return
    
    if (hasPaidForDoctor(selectedDoctor.id)) {
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
        setChatRooms((prev) => [newRoom, ...prev])
        setSelectedChatRoom(newRoom)
        setView("chat")
      }
    } else {
      setShowPaymentDialog(true)
    }

    setChatRooms((prev) => {
      const existing = prev.find((item) => item.id === room.id)
      if (!existing) return [room, ...prev]
      return prev.map((item) =>
        item.id === room.id
          ? {
              ...item,
              doctor,
              createdAt: room.createdAt,
            }
          : item
      )
    })

    return room
  }

  const refreshDoctorReviews = async (doctor: any, page = 1, append = false) => {
    if (!doctor?.doctorRecordId) return

    setIsLoadingReviews(true)
    try {
      const [ratingsResponse, stats] = await Promise.all([
        getDoctorRatings(doctor.doctorRecordId, { limit: REVIEWS_PAGE_SIZE, page }),
        getDoctorRatingStats(doctor.doctorRecordId),
      ])

      const incomingReviews = mapRatingsToReviews(ratingsResponse?.data || [], doctor.id)
      const mergedReviews = append
        ? [
            ...(Array.isArray(doctor.reviews) ? doctor.reviews : []),
            ...incomingReviews.filter(
              (review: any) => !(Array.isArray(doctor.reviews) ? doctor.reviews : []).some((existing: any) => existing.id === review.id)
            ),
          ]
        : incomingReviews

      const updatedDoctor = {
        ...doctor,
        rating: Number(stats?.average || doctor.rating || 0),
        totalReviews: Number(stats?.total || doctor.totalReviews || 0),
        reviews: mergedReviews,
      }

      setReviewPage(Number(page))
      setReviewTotalPages(Number(ratingsResponse?.pagination?.totalPages || 1))
      setSelectedDoctor(updatedDoctor)
      setDoctorsList((prev) => prev.map((item) => (item.id === updatedDoctor.id ? { ...item, rating: updatedDoctor.rating, totalReviews: updatedDoctor.totalReviews, reviews: updatedDoctor.reviews } : item)))
      setChatRooms((prev) => prev.map((room) => (room.doctor.id === updatedDoctor.id ? { ...room, doctor: { ...room.doctor, rating: updatedDoctor.rating, totalReviews: updatedDoctor.totalReviews, reviews: updatedDoctor.reviews } } : room)))
    } finally {
      setIsLoadingReviews(false)
    }
  }

  useEffect(() => {
    const loadDoctorsAvailability = async () => {
      try {
        const response = await getDoctors({ limit: 100 })
        const backendDoctors = Array.isArray(response?.data) ? response.data : []
        if (backendDoctors.length === 0) return

        const baseDoctors = mapBackendDoctorsToUi(backendDoctors)
        const uiDoctors = await Promise.all(
          baseDoctors.map(async (doctor) => {
            if (!doctor.doctorRecordId) return doctor
            try {
              const [ratingsResponse, stats] = await Promise.all([
                getDoctorRatings(doctor.doctorRecordId, { limit: REVIEWS_PAGE_SIZE, page: 1 }),
                getDoctorRatingStats(doctor.doctorRecordId),
              ])

              const reviews = mapRatingsToReviews(ratingsResponse?.data, doctor.id)

              return {
                ...doctor,
                rating: Number(stats?.average || doctor.rating || 0),
                totalReviews: Number(stats?.total || reviews.length || doctor.totalReviews || 0),
                reviews,
              }
            } catch {
              return doctor
            }
          })
        )

        setDoctorsList(uiDoctors)

        // If selected doctor is open, keep it in sync with the refreshed data.
        setSelectedDoctor((prev) => {
          if (!prev) return prev
          const updated = uiDoctors.find((item) => item.id === prev.id)
          return updated || prev
        })
      } catch {
        setDoctorsList([])
      }
    }

    void loadDoctorsAvailability()
  }, [])

  useEffect(() => {
    const loadUserConsultations = async () => {
      if (!user?.id || doctorsList.length === 0) return

      setIsLoadingChats(true)
      try {
        const chats = await getChats({ userId: user.id, sessionStatus: "Active" })
        const items = Array.isArray(chats) ? chats : []

        const mappedRooms = items
          .map((chat: any) => {
            const doctorRecordId = String(chat?.doctorId?._id || "")
            const doctor = doctorsList.find((item) => item.doctorRecordId === doctorRecordId)
            if (!doctor) return null

            return {
              id: String(chat?._id || ""),
              doctor,
              createdAt: formatChatTime(chat?.createdAt || chat?.updatedAt),
              messages: [],
            } as ChatRoom
          })
          .filter(Boolean) as ChatRoom[]

        setChatRooms(mappedRooms)
        setPaidDoctorIds([...new Set(mappedRooms.map((room) => room.doctor.id))])

        setSelectedChatRoom((prev) => {
          if (!prev) return prev
          const updated = mappedRooms.find((room) => room.id === prev.id)
          return updated || prev
        })
      } catch {
        setChatRooms([])
        setPaidDoctorIds([])
      } finally {
        setIsLoadingChats(false)
      }
    }

    void loadUserConsultations()
  }, [user?.id, doctorsList])

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChatRoom?.id) return

      // Frontend-only local chats do not fetch from backend.
      if (selectedChatRoom.id.startsWith("local-")) return

      try {
        const response = await getMessagesByChat(selectedChatRoom.id, { limit: 200 })
        const items = Array.isArray(response?.data) ? response.data : []
        const mappedMessages = items.map(mapBackendMessageToUi)

        setChatRooms((prev) =>
          prev.map((room) => (room.id === selectedChatRoom.id ? { ...room, messages: mappedMessages } : room))
        )
        setSelectedChatRoom((prev) =>
          prev && prev.id === selectedChatRoom.id ? { ...prev, messages: mappedMessages } : prev
        )
      } catch {
        setChatRooms((prev) =>
          prev.map((room) => (room.id === selectedChatRoom.id ? { ...room, messages: [] } : room))
        )
      }
    }

    void loadMessages()
  }, [selectedChatRoom?.id])

  // Auto-handle payment success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("payment") !== "success" || paymentHandledRef.current) return

    const doctorId = params.get("doctor")
    const doctorRecordId = params.get("doctorRecordId")

    const doctor = doctorRecordId
      ? doctorsList.find((item) => item.doctorRecordId === doctorRecordId)
      : doctorId
        ? doctorsList.find((item) => item.id === Number(doctorId))
        : undefined
    if (!doctor) return

    const docId = Number(doctor.id)

    paymentHandledRef.current = true

    setPaidDoctorIds((prev) => (prev.includes(docId) ? prev : [...prev, docId]))
    const room = upsertLocalChatRoom(doctor)
    setSelectedDoctor(doctor)
    setSelectedChatRoom(room)
    setView("chat")

    window.history.replaceState({}, "", "/dashboard/consulting")
  }, [doctorsList])

  const hasPaidForDoctor = (doctorId: number) => paidDoctorIds.includes(doctorId)

  const handleDoctorClick = (doctor: DoctorProfile) => {
    setSelectedDoctor(doctor)
    setReviewPage(1)
    setReviewTotalPages(1)
    setView("profile")
    void refreshDoctorReviews(doctor, 1, false)
  }

  const handleContactDoctor = async () => {
    if (!selectedDoctor) return

    // Frontend-only mock M-Pesa flow: require local "paid" state before opening chat.
    if (!hasPaidForDoctor(Number(selectedDoctor.id))) {
      setShowPaymentDialog(true)
      return
    }

    const room = upsertLocalChatRoom(selectedDoctor)
    setSelectedChatRoom(room)
    setView("chat")
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

  const handleRatingSubmit = async (rating: number, comment: string, anonymous: boolean) => {
    if (!selectedDoctor?.doctorRecordId || !user?.id) return

    try {
      await submitDoctorRating(selectedDoctor.doctorRecordId, {
        userId: user.id,
        rating,
        comment,
        anonymous,
      })

      await refreshDoctorReviews(selectedDoctor, 1, false)
    } catch {
      setPageMessage({ type: "error", text: "Failed to submit rating. Please try again." })
    }
  }

  const handleLoadMoreReviews = () => {
    if (!selectedDoctor) return
    if (reviewPage >= reviewTotalPages) return
    void refreshDoctorReviews(selectedDoctor, reviewPage + 1, true)
  }

  const handleClearHistory = () => {
    if (selectedChatRoom) {
      setChatRooms(chatRooms.map(room => 
        room.id === selectedChatRoom.id 
          ? { ...room, messages: [] }
          : room
      ))
      setSelectedChatRoom({ ...selectedChatRoom, messages: [] })
    }
  }

  const handleSendChatMessage = async (messageText: string) => {
    if (!selectedChatRoom?.id || !user?.id) return

    if (selectedChatRoom.id.startsWith("local-")) {
      const uiMessage = {
        id: `${Date.now()}`,
        sender: "user" as const,
        content: messageText,
        time: "Just now",
      }

      setChatRooms((prev) =>
        prev.map((room) =>
          room.id === selectedChatRoom.id
            ? { ...room, messages: [...room.messages, uiMessage] }
            : room
        )
      )
      setSelectedChatRoom((prev) =>
        prev && prev.id === selectedChatRoom.id
          ? { ...prev, messages: [...prev.messages, uiMessage] }
          : prev
      )
      return
    }

    setIsSendingMessage(true)
    try {
      const created = await sendMessage({
        chatId: selectedChatRoom.id,
        senderId: user.id,
        senderRole: "User",
        messageType: "text",
        messageText,
      })

      const uiMessage = mapBackendMessageToUi(created)
      setChatRooms((prev) =>
        prev.map((room) =>
          room.id === selectedChatRoom.id
            ? { ...room, messages: [...room.messages, uiMessage] }
            : room
        )
      )
      setSelectedChatRoom((prev) =>
        prev && prev.id === selectedChatRoom.id
          ? { ...prev, messages: [...prev.messages, uiMessage] }
          : prev
      )
    } catch {
      setPageMessage({ type: "error", text: "Failed to send message. Please try again." })
    } finally {
      setIsSendingMessage(false)
    }
  }

  const messageBanner = pageMessage ? (
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
  ) : null

  // Chat Room View
  if (view === "chat" && selectedChatRoom) {
    return (
      <>
        {messageBanner}
        <ChatRoomView 
          chatRoom={selectedChatRoom}
          onBack={handleBack}
          onOpenRating={() => setShowRatingDialog(true)}
          onClearHistory={handleClearHistory}
          onSendMessage={handleSendChatMessage}
          isSending={isSendingMessage}
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
        {messageBanner}
        <DoctorProfileView 
          doctor={selectedDoctor}
          onBack={handleBack}
          onContact={handleContactDoctor}
          hasPaidAccess={hasPaidForDoctor(selectedDoctor.id)}
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
      {messageBanner}
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
          Consulting
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect with certified healthcare professionals
        </p>
      </div>

      {/* User's Paid Consultations */}
      {chatRooms.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <MessageCircle className="h-5 w-5 text-primary" />
              Your Consultations
            </h2>
            <Badge variant="secondary" className="gap-1">
              {chatRooms.length} doctor{chatRooms.length > 1 ? "s" : ""}
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

      {isLoadingChats ? (
        <p className="text-sm text-muted-foreground">Loading your consultations...</p>
      ) : null}

      {/* All Doctors */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          {chatRooms.length > 0 ? "Find More Doctors" : "Available Doctors"}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {doctors.map((doctor) => {
            const hasPaid = hasPaidForDoctor(doctor.id)
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
                        {hasPaid ? (
                          <Badge variant="outline" className="gap-1 text-xs bg-secondary/20">
                            <CheckCircle className="h-3 w-3" />
                            Paid
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Lock className="h-3 w-3" />
                            {doctor.consultationFee} ETB
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
                      {doctor.available && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{getAvailabilitySummary(doctor.availability)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

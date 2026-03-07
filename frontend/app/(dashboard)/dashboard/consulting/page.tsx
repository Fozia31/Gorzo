"use client"

<<<<<<< HEAD
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
=======
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { getDoctorRatings, getDoctorRatingStats, getDoctors, submitDoctorRating } from "@/api/doctorApi"
import { 
>>>>>>> e0b55d9ff6ccafb6c28bc3f5f2c7e6417afec56f
  Crown,
  MessageCircle,
  Send,
  Shield,
  Sparkles,
  Star,
  ThumbsUp,
  Trash2,
<<<<<<< HEAD
  User,
=======
  AlertTriangle,
  Plus,
  Lock
>>>>>>> e0b55d9ff6ccafb6c28bc3f5f2c7e6417afec56f
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

<<<<<<< HEAD
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
=======
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

const availabilityDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const

const emptyAvailability = {
  Monday: { enabled: false, slots: [] },
  Tuesday: { enabled: false, slots: [] },
  Wednesday: { enabled: false, slots: [] },
  Thursday: { enabled: false, slots: [] },
  Friday: { enabled: false, slots: [] },
  Saturday: { enabled: false, slots: [] },
  Sunday: { enabled: false, slots: [] },
}

const normalizeDoctorName = (name: string) =>
  name.replace(/^dr\.?\s*/i, "").trim().toLowerCase()

const toAvailabilityRecord = (items: Array<{ day: string; enabled: boolean; slots: { start: string; end: string }[] }>) => {
  const record = { ...emptyAvailability }
  for (const item of items || []) {
    if (record[item.day as keyof typeof record]) {
      record[item.day as keyof typeof record] = {
        enabled: Boolean(item.enabled),
        slots: Array.isArray(item.slots) ? item.slots : [],
      }
    }
  }
  return record
}

const hasAnyAvailability = (availability: typeof doctors[0]["availability"]) =>
  availabilityDays.some((day) => availability[day].enabled && availability[day].slots.length > 0)

const mapBackendDoctorsToUi = (backendDoctors: any[]) => {
  return backendDoctors.map((item: any, index: number) => {
    const displayName = item?.userId?.displayName || "Doctor"
    const specialty = item?.specialization || "General Practitioner"
    const matchedSample = doctors.find((sample) => {
      const sampleName = normalizeDoctorName(sample.name)
      const backendName = normalizeDoctorName(displayName)
      if (sampleName && backendName && sampleName === backendName) return true
      return sample.specialty.toLowerCase() === String(specialty).toLowerCase()
    })

    const availability = Array.isArray(item?.availability)
      ? toAvailabilityRecord(item.availability)
      : matchedSample?.availability || { ...emptyAvailability }
    const available = hasAnyAvailability(availability)

    return {
      id: index + 1,
      doctorRecordId: String(item?._id || ""),
      userId: String(item?.userId?._id || ""),
      name: displayName,
      specialty,
      avatar: item?.userId?.avatar || matchedSample?.avatar || "/doctors/placeholder.jpg",
      // Do not use sample rating totals here. Real values are hydrated from backend stats.
      rating: 0,
      totalReviews: 0,
      available,
      responseTime: available ? (matchedSample?.responseTime || "Usually responds in a few hours") : "Currently unavailable",
      experience: matchedSample?.experience || (item?.createdAt ? `${Math.max(new Date().getFullYear() - new Date(item.createdAt).getFullYear(), 1)} years` : "N/A"),
      bio: item?.bio || matchedSample?.bio || "No bio provided yet.",
      consultationFee: matchedSample?.consultationFee || 299,
      availability,
      reviews: [],
    }
  })
}

const mapBackendReviewDate = (dateValue: string | Date | undefined) => {
  if (!dateValue) return "recently"
  const date = new Date(dateValue)
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / (1000 * 60))
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months > 1 ? "s" : ""} ago`
}

const REVIEWS_PAGE_SIZE = 5

const mapRatingsToReviews = (items: any[], doctorId: string | number) =>
  Array.isArray(items)
    ? items.map((item: any, index: number) => ({
        id: item.id || `${doctorId}-${index}`,
        user: item.user || "Anonymous User",
        rating: Number(item.rating || 0),
        comment: item.comment || "",
        date: mapBackendReviewDate(item.date),
      }))
    : []
>>>>>>> e0b55d9ff6ccafb6c28bc3f5f2c7e6417afec56f

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

<<<<<<< HEAD
function ChatRoomView({ chatRoom, onBack, onOpenRating, onClearHistory }: {
=======
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
  onLoadMoreReviews,
  canLoadMoreReviews,
  isLoadingReviews,
}: { 
  doctor: typeof doctors[0]
  onBack: () => void
  onContact: () => void
  hasPaidAccess: boolean
  onLoadMoreReviews: () => void
  canLoadMoreReviews: boolean
  isLoadingReviews: boolean
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
  onClearHistory
}: { 
>>>>>>> e0b55d9ff6ccafb6c28bc3f5f2c7e6417afec56f
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
<<<<<<< HEAD
  const { user, updateTier } = useAuth()
  const isPremium = user?.tier === "premium"

=======
  const { user } = useAuth()
  const [doctorsList, setDoctorsList] = useState(doctors)
  
>>>>>>> e0b55d9ff6ccafb6c28bc3f5f2c7e6417afec56f
  const [view, setView] = useState<"list" | "profile" | "chat">("list")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
<<<<<<< HEAD

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([{ id: "chat-1", doctor: doctors[0], createdAt: "2 days ago", messages: [] }])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("payment") === "success" && user?.tier !== "premium") {
      updateTier("premium")
    }
  }, [updateTier, user?.tier])
=======
  const [reviewPage, setReviewPage] = useState(1)
  const [reviewTotalPages, setReviewTotalPages] = useState(1)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  
  // Track which doctors the user has paid for - in real app this would come from database
  const [paidDoctorIds, setPaidDoctorIds] = useState<number[]>([1]) // Demo: already paid for Dr. Amara
  
  // Chat rooms created after payment - in real app this would come from database
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    // Sample existing chat room for demo (only for paid doctor)
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
        // Keep sample doctors when backend is unavailable.
      }
    }

    void loadDoctorsAvailability()
  }, [])

  // Auto-handle payment success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("payment") === "success") {
      const doctorId = params.get("doctor")
      if (doctorId) {
        const docId = parseInt(doctorId)
          const doctor = doctorsList.find(d => d.id === docId)
        if (doctor && !paidDoctorIds.includes(docId)) {
          // Add to paid doctors
          setPaidDoctorIds(prev => [...prev, docId])
          
          // Create new chat room for the doctor
          const existingRoom = chatRooms.find(r => r.doctor.id === docId)
          if (!existingRoom) {
            const newRoom: ChatRoom = {
              id: `chat-${Date.now()}`,
              doctor: doctor,
              createdAt: "Just now",
              messages: []
            }
            setChatRooms(prev => [newRoom, ...prev])
            setSelectedChatRoom(newRoom)
            setSelectedDoctor(doctor)
            setView("chat")
          }
        }
      }
      // Clear URL params
      window.history.replaceState({}, '', '/dashboard/consulting')
    }
  }, [doctorsList, paidDoctorIds, chatRooms])

  const hasPaidForDoctor = (doctorId: number) => paidDoctorIds.includes(doctorId)
>>>>>>> e0b55d9ff6ccafb6c28bc3f5f2c7e6417afec56f

  const byDoctorId = useMemo(() => new Map(chatRooms.map((r) => [r.doctor.id, r])), [chatRooms])

  const openDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setReviewPage(1)
    setReviewTotalPages(1)
    setView("profile")
    void refreshDoctorReviews(doctor, 1, false)
  }

  const startOrOpenChat = () => {
    if (!selectedDoctor) return
<<<<<<< HEAD
    if (!isPremium) {
=======
    
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
        setChatRooms([newRoom, ...chatRooms])
        setSelectedChatRoom(newRoom)
        setView("chat")
      }
    } else {
>>>>>>> e0b55d9ff6ccafb6c28bc3f5f2c7e6417afec56f
      setShowPaymentDialog(true)
      return
    }

    const existing = byDoctorId.get(selectedDoctor.id)
    const room = existing ?? { id: `chat-${Date.now()}`, doctor: selectedDoctor, createdAt: "Just now", messages: [] }
    if (!existing) setChatRooms((prev) => [room, ...prev])
    setSelectedChatRoom(room)
    setView("chat")
  }

<<<<<<< HEAD
=======
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
      alert("Failed to submit rating. Please try again.")
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
    }
  }

  // Chat Room View
>>>>>>> e0b55d9ff6ccafb6c28bc3f5f2c7e6417afec56f
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
<<<<<<< HEAD
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
=======
        <DoctorProfileView 
          doctor={selectedDoctor}
          onBack={handleBack}
          onContact={handleContactDoctor}
          hasPaidAccess={hasPaidForDoctor(selectedDoctor.id)}
          onLoadMoreReviews={handleLoadMoreReviews}
          canLoadMoreReviews={reviewPage < reviewTotalPages}
          isLoadingReviews={isLoadingReviews}
        />
        <PaymentDialog 
          doctor={selectedDoctor}
          open={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
        />
>>>>>>> e0b55d9ff6ccafb6c28bc3f5f2c7e6417afec56f
      </>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Consulting</h1>
        <p className="mt-1 text-sm text-muted-foreground">Connect with certified healthcare professionals</p>
      </div>

<<<<<<< HEAD
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
=======
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

      {/* All Doctors */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          {chatRooms.length > 0 ? "Find More Doctors" : "Available Doctors"}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {doctorsList.map((doctor) => {
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
>>>>>>> e0b55d9ff6ccafb6c28bc3f5f2c7e6417afec56f
    </div>
  )
}

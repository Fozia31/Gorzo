"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  CheckCircle2, 
  Phone, 
  Shield, 
  Crown,
  ArrowLeft,
  Loader2,
  Clock,
  Smartphone,
  Star,
  MessageCircle
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

type PaymentStatus = "idle" | "processing" | "waiting" | "success" | "error"

// Doctor data (matching consulting page)
const doctors = [
  {
    id: 1,
    name: "Dr. Amara Bekele",
    specialty: "Gynecologist",
    avatar: "/doctors/amara.jpg",
    rating: 4.9,
    consultationFee: 299,
  },
  {
    id: 2,
    name: "Dr. Selam Haile",
    specialty: "Nutritionist",
    avatar: "/doctors/selam.jpg",
    rating: 4.8,
    consultationFee: 249,
  },
  {
    id: 3,
    name: "Dr. Hana Tadesse",
    specialty: "Reproductive Health",
    avatar: "/doctors/hana.jpg",
    rating: 4.9,
    consultationFee: 349,
  },
  {
    id: 4,
    name: "Dr. Meron Alemu",
    specialty: "Mental Health",
    avatar: "/doctors/meron.jpg",
    rating: 4.7,
    consultationFee: 279,
  },
]

function PaymentContent() {
  const searchParams = useSearchParams()
  const doctorId = searchParams.get("doctor")
  const amountParam = searchParams.get("amount")
  const { updateTier } = useAuth()
  
  const [phoneNumber, setPhoneNumber] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle")
  const [transactionId, setTransactionId] = useState("")

  // Find the doctor
  const doctor = doctorId ? doctors.find(d => d.id === parseInt(doctorId)) : null
  const amount = amountParam ? parseInt(amountParam) : doctor?.consultationFee || 299

  const formatPhoneNumber = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "")
    // Format as Ethiopian phone number (07XX or +2517XX format)
    if (digits.startsWith("251")) {
      return digits.slice(0, 12)
    } else if (digits.startsWith("0")) {
      return digits.slice(0, 10)
    } else if (digits.startsWith("7")) {
      return digits.slice(0, 9)
    }
    return digits.slice(0, 12)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value))
  }

  const getFormattedPhone = () => {
    if (phoneNumber.startsWith("251")) {
      return `+${phoneNumber}`
    } else if (phoneNumber.startsWith("0")) {
      return `+251${phoneNumber.slice(1)}`
    } else if (phoneNumber.startsWith("7")) {
      return `+251${phoneNumber}`
    }
    return phoneNumber
  }

  const isValidPhone = () => {
    const formatted = getFormattedPhone()
    return formatted.match(/^\+2517\d{8}$/)
  }

  const handlePayment = async () => {
    if (!isValidPhone()) return

    setPaymentStatus("processing")
    
    // Simulate M-Pesa API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setPaymentStatus("waiting")
    
    // Simulate waiting for user to confirm on phone
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Simulate successful payment
    setTransactionId(`MP${Date.now().toString().slice(-10)}`)
    setPaymentStatus("success")
    
    // Upgrade user to premium status
    updateTier("premium")
  }

  // Redirect if no doctor specified
  if (!doctor) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <h2 className="mb-2 font-serif text-xl font-semibold">No Doctor Selected</h2>
            <p className="mb-6 text-muted-foreground">
              Please select a doctor from the consulting page first.
            </p>
            <Link href="/dashboard/consulting">
              <Button>Go to Consulting</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentStatus === "success") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <Card className="w-full max-w-md border-secondary/50">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 rounded-full bg-secondary/20 p-4">
              <CheckCircle2 className="h-12 w-12 text-secondary-foreground" />
            </div>
            <h2 className="mb-2 font-serif text-2xl font-semibold">Payment Successful!</h2>
            <p className="mb-6 text-muted-foreground">
              You now have access to chat with {doctor.name}.
            </p>
            
            <div className="mb-6 w-full space-y-3 rounded-lg bg-muted/50 p-4 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono font-medium">{transactionId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-medium">{amount} ETB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Doctor</span>
                <span className="font-medium">{doctor.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phone Number</span>
                <span className="font-medium">{getFormattedPhone()}</span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2">
              <Link href={`/dashboard/consulting?payment=success&doctor=${doctorId}`} className="w-full">
                <Button className="w-full gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Start Chatting with {doctor.name.split(' ')[0]}
                </Button>
              </Link>
              <Link href="/dashboard/consulting" className="w-full">
                <Button variant="outline" className="w-full">
                  Back to Consulting
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentStatus === "waiting") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="relative mb-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Smartphone className="h-12 w-12 text-primary" />
              </div>
              <div className="absolute -right-1 -top-1 rounded-full bg-background p-1">
                <div className="h-4 w-4 animate-pulse rounded-full bg-secondary" />
              </div>
            </div>
            <h2 className="mb-2 font-serif text-xl font-semibold">Check Your Phone</h2>
            <p className="mb-4 text-muted-foreground">
              A payment request has been sent to
            </p>
            <p className="mb-6 text-lg font-semibold">{getFormattedPhone()}</p>
            
            <div className="mb-6 w-full space-y-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-3 text-left">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                  1
                </div>
                <p className="text-sm">Open the M-Pesa prompt on your phone</p>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                  2
                </div>
                <p className="text-sm">Enter your M-Pesa PIN to confirm</p>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                  3
                </div>
                <p className="text-sm">Wait for confirmation</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Request expires in 60 seconds</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/consulting">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
            Pay for Consultation
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pay securely with M-Pesa Ethiopia
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Doctor Info & What You Get */}
        <div className="space-y-4">
          {/* Selected Doctor */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Selected Doctor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={doctor.avatar} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xl">
                    {doctor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{doctor.name}</h3>
                  <p className="text-muted-foreground">{doctor.specialty}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-secondary-foreground text-secondary-foreground" />
                    <span className="font-medium">{doctor.rating}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{amount} ETB</p>
                  <p className="text-xs text-muted-foreground">one-time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What You Get */}
          <Card className="border-secondary/30 bg-secondary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="h-5 w-5 text-secondary-foreground" />
                What You Get
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                `Private chat access with ${doctor.name}`,
                "Personalized health advice",
                "Response within doctor's available hours",
                "Secure and confidential communication",
                "Chat history saved for your reference",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-secondary-foreground shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Important Note */}
          <Card className="border-dashed">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Note:</strong> This is a one-time payment for consultation access with this specific doctor. To chat with other doctors, you&apos;ll need to pay for each consultation separately.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#4CAF50]/10">
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#4CAF50"/>
                    <path d="M2 17L12 22L22 17" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg">M-Pesa Ethiopia</CardTitle>
                  <CardDescription>Pay with your mobile money</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="07XXXXXXXX or 2517XXXXXXXX"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your M-Pesa registered phone number
                </p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Doctor</span>
                  <span className="font-medium">{doctor.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Specialty</span>
                  <span>{doctor.specialty}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="text-xl font-bold">{amount} ETB</span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full gap-2" 
                size="lg"
                disabled={!isValidPhone() || paymentStatus === "processing"}
                onClick={handlePayment}
              >
                {paymentStatus === "processing" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay {amount} ETB
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secured by M-Pesa Ethiopia</span>
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <Card className="border-dashed">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Need help?</strong> Make sure your M-Pesa account is active and has sufficient balance. Contact support if you experience any issues.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}

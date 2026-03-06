"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, 
  Phone, 
  Shield, 
  Crown,
  ArrowLeft,
  Loader2,
  Clock,
  Smartphone
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

import { useSearchParams } from "next/navigation"

type PaymentStatus = "idle" | "processing" | "waiting" | "success" | "error"

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    price: 299,
    period: "/month",
    description: "Perfect for trying out premium features",
  },
  {
    id: "quarterly",
    name: "Quarterly",
    price: 799,
    period: "/3 months",
    description: "Save 10% with quarterly billing",
    savings: "Save 10%",
  },
  {
    id: "yearly",
    name: "Yearly",
    price: 2999,
    period: "/year",
    description: "Best value - save 15%",
    savings: "Save 15%",
    popular: true,
  },
]

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const doctorId = searchParams.get("doctor")
  
  const [selectedPlan, setSelectedPlan] = useState("yearly")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle")
  const [transactionId, setTransactionId] = useState("")

  const selectedPlanData = plans.find(p => p.id === selectedPlan)

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
              Your premium subscription is now active. Enjoy unlimited access to all features.
            </p>
            
            <div className="mb-6 w-full space-y-3 rounded-lg bg-muted/50 p-4 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono font-medium">{transactionId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-medium">{selectedPlanData?.price} ETB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{selectedPlanData?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phone Number</span>
                <span className="font-medium">{getFormattedPhone()}</span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2">
              <Link href={doctorId ? `/dashboard/consulting?payment=success&doctor=${doctorId}` : "/dashboard/consulting?payment=success"} className="w-full">
                <Button className="w-full gap-2">
                  <Crown className="h-4 w-4" />
                  {doctorId ? "Start Consultation" : "Go to Consulting"}
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full">
                  Go to Dashboard
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
            Upgrade to Premium
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pay securely with M-Pesa Ethiopia
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan Selection */}
        <div className="space-y-4">
          <h2 className="font-medium">Select Your Plan</h2>
          <div className="space-y-3">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={cn(
                  "cursor-pointer transition-all",
                  selectedPlan === plan.id 
                    ? "border-primary ring-2 ring-primary/20" 
                    : "hover:border-primary/50"
                )}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                    selectedPlan === plan.id 
                      ? "border-primary bg-primary" 
                      : "border-muted-foreground/30"
                  )}>
                    {selectedPlan === plan.id && (
                      <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{plan.name}</span>
                      {plan.popular && (
                        <Badge className="h-5 text-[10px]">Most Popular</Badge>
                      )}
                      {plan.savings && (
                        <Badge variant="secondary" className="h-5 text-[10px]">
                          {plan.savings}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground"> ETB</span>
                    <p className="text-xs text-muted-foreground">{plan.period}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Premium Features */}
          <Card className="border-secondary/30 bg-secondary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="h-5 w-5 text-secondary-foreground" />
                Premium Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Unlimited doctor consultations",
                "Priority chat queue",
                "Personalized health insights",
                "Access to all voice notes",
                "Ad-free experience",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-secondary-foreground" />
                  <span>{feature}</span>
                </div>
              ))}
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
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{selectedPlanData?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span>{selectedPlanData?.period.replace("/", "")}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="text-xl font-bold">{selectedPlanData?.price} ETB</span>
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
                    Pay {selectedPlanData?.price} ETB
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

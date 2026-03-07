import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Shield, BookOpen, MessageCircle, Sparkles, ArrowRight, Stethoscope } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center">
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary/20">
              <Image 
                src="/logo.jpg" 
                alt="EFOY" 
                width={40} 
                height={40} 
                className="h-full w-full object-cover"
              />
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-3xl space-y-6">
              <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                Your trusted companion for{" "}
                <span className="text-primary">women&apos;s health</span>
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                A safe, private space to connect with other women 
                and access expert healthcare guidance from certified professionals.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    Join the sisterhood
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Sign in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border/50 bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-semibold text-foreground">
                Everything you need for your wellness journey
              </h2>
              <p className="mt-4 text-muted-foreground">
                From expert consultations to community support, we&apos;ve got you covered.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Expert Doctors</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Connect with certified healthcare professionals for personalized guidance and support.
                </p>
              </div>

              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/30">
                  <MessageCircle className="h-6 w-6 text-secondary-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Anonymous Forum</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Connect with other women in our safe, anonymous sisterhood forum.
                </p>
              </div>

              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Knowledge Hub</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Access articles and voice notes from certified healthcare professionals.
                </p>
              </div>

              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/30">
                  <Sparkles className="h-6 w-6 text-secondary-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Premium Consulting</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get personalized advice through private chats with our expert doctors.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-8 md:p-12">
              <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    Your privacy is our priority
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    We understand the sensitive nature of women&apos;s health. That&apos;s why we&apos;ve built 
                    EFOY with privacy at its core. Anonymous usernames and encrypted data 
                    ensure your journey stays private and secure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/50 bg-muted/30 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl font-semibold text-foreground">
              Ready to start your wellness journey?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join thousands of Ethiopian women who trust EFOY for their health needs.
            </p>
            <Link href="/register" className="mt-8 inline-block">
              <Button size="lg" className="gap-2">
                Create your free account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center">
              <div className="h-8 w-8 overflow-hidden rounded-full border border-primary/20">
                <Image 
                  src="/logo.jpg" 
                  alt="EFOY" 
                  width={32} 
                  height={32} 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2026 EFOY. All rights reserved. Made with care for Ethiopian women.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

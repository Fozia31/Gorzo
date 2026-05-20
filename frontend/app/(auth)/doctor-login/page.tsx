"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { loginUser } from "@/api/userApi";

export default function DoctorLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await loginUser({
        email: formData.username,
        password: formData.password,
      });
      const backendUser = res.data;

      // Check if user is a doctor
      if (backendUser.role !== "Doctor") {
        setError("Access denied. This portal is for doctors only.");
        setIsLoading(false);
        return;
      }

      // Convert to frontend user shape
      const tier: "premium" | "free" = backendUser.isPremium
        ? "premium"
        : "free";
      const frontendUser = {
        id: backendUser._id,
        username: backendUser.displayName,
        email: backendUser.email,
        role: "doctor" as const,
        tier,
        avatar: backendUser.avatar || "",
      };

      login(frontendUser);
      router.push("/doctor");
    } catch (err: any) {
      console.error("doctor login error", err);
      setError(err?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <div className="mx-auto flex flex-col items-center">
          <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-primary/20">
            <Image
              src="/logo.jpg"
              alt="EFOY"
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground">
          Doctor Portal
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Access your dashboard to manage patients and create content
        </p>
      </div>

      <Card className="border-border/50">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Use the credentials provided by your administrator
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-secondary/50 bg-secondary/10 p-3">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-secondary-foreground mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Secure Access</p>
                  <p className="mt-1">
                    Your credentials are provided by the EFOY admin team. If you
                    need account assistance, please contact your administrator.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in to Dashboard"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Not a doctor?
            </span>
          </div>
        </div>
        <div className="text-center">
          <Link href="/login" className="text-sm text-primary hover:underline">
            Sign in as a user instead
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Protected healthcare provider portal. Unauthorized access is prohibited.
      </p>
    </div>
  );
}

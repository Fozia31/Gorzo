"use client"

import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { getDoctorByUserId, updateDoctorById } from "@/api/doctorApi"
import { updateUserById } from "@/api/userApi"
import { Calendar, Save, Stethoscope, User, Mail, ShieldCheck, Upload } from "lucide-react"

const specialties = [
  "Gynecologist",
  "Nutritionist",
  "Reproductive Health",
  "Endocrinologist",
  "Mental Health",
  "General Practitioner",
]

export default function DoctorProfilePage() {
  const { user, login } = useAuth()
  const [doctorRecordId, setDoctorRecordId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState("")

  const [form, setForm] = useState({
    displayName: "",
    email: "",
    specialization: "Gynecologist",
    bio: "",
    password: "",
    verificationStatus: "Pending",
    createdAt: "",
  })

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const doctor = await getDoctorByUserId(user.id)
        setDoctorRecordId(String(doctor?._id || ""))
        setForm({
          displayName: doctor?.userId?.displayName || user.username || "",
          email: doctor?.userId?.email || user.email || "",
          specialization: doctor?.specialization || "Gynecologist",
          bio: doctor?.bio || "",
          password: "",
          verificationStatus: doctor?.verificationStatus || "Pending",
          createdAt: doctor?.createdAt || "",
        })
        setAvatarPreview(doctor?.userId?.avatar || user.avatar || "")
      } catch {
        // Keep default values if fetch fails.
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfile()
  }, [user?.id, user?.username, user?.email])

  const joinedDateLabel = useMemo(() => {
    if (!form.createdAt) return "N/A"
    return new Date(form.createdAt).toLocaleDateString()
  }, [form.createdAt])

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file")
      return
    }

    const maxSizeBytes = 2 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      alert("Image must be 2MB or smaller")
      return
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ""))
        reader.onerror = () => reject(new Error("Failed to read image"))
        reader.readAsDataURL(file)
      })
      setAvatarPreview(dataUrl)
    } catch {
      alert("Failed to process image")
    }
  }

  const handleSave = async () => {
    if (!user?.id || !doctorRecordId) {
      alert("Unable to save profile. Missing doctor identity.")
      return
    }

    if (!form.displayName.trim()) {
      alert("Display name is required")
      return
    }

    if (form.password && form.password.length < 8) {
      alert("Password must be at least 8 characters")
      return
    }

    setIsSaving(true)
    try {
      await Promise.all([
        updateDoctorById(doctorRecordId, {
          specialization: form.specialization,
          bio: form.bio,
        }),
        updateUserById(user.id, {
          displayName: form.displayName,
          avatar: avatarPreview,
          ...(form.password ? { password: form.password } : {}),
        }),
      ])

      login({
        ...user,
        username: form.displayName,
        avatar: avatarPreview,
      })

      setForm((prev) => ({ ...prev, password: "" }))
      alert("Profile updated successfully")
    } catch (err: any) {
      alert(err?.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">Doctor Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update your professional information and account details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
          <CardDescription>Your public identity and profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="avatarUpload">Profile Photo</Label>
                  <div className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center">
                    <Avatar className="h-16 w-16 border">
                      <AvatarImage src={avatarPreview} alt={form.displayName || "Doctor"} />
                      <AvatarFallback>{(form.displayName || "D").charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Input id="avatarUpload" type="file" accept="image/*" onChange={handleAvatarUpload} />
                      <p className="text-xs text-muted-foreground">
                        Upload JPG/PNG/WebP image up to 2MB.
                      </p>
                    </div>
                    {avatarPreview ? (
                      <Button type="button" variant="outline" onClick={() => setAvatarPreview("")} className="gap-2">
                        <Upload className="h-4 w-4" />
                        Remove
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={form.displayName}
                    onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Dr. Your Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" value={form.email} className="pl-10" disabled />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <select
                    id="specialization"
                    className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm"
                    value={form.specialization}
                    onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))}
                  >
                    {specialties.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={5}
                  value={form.bio}
                  onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell patients about your expertise and care approach..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password (Optional)</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Leave empty to keep current password"
                />
                <p className="text-xs text-muted-foreground">If provided, password must be at least 8 characters.</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <span>Verification: </span>
                  <Badge variant={form.verificationStatus === "Verified" ? "default" : "secondary"}>
                    {form.verificationStatus}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined: {joinedDateLabel}</span>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

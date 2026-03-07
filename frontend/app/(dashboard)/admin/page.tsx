"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { getAdmins } from "@/api/adminApi"
import { createDoctorByAdmin, deleteDoctorById, getDoctorById, getDoctors } from "@/api/doctorApi"
import { 
  UserPlus,
  MoreHorizontal,
  Trash2,
  Mail,
  User,
  Stethoscope,
  Key,
  Search,
  Users,
  FileText,
  Flag,
  Eye,
  Calendar,
  Clock,
  Info
} from "lucide-react"

// Sample doctors
type DoctorRow = {
  id: string
  name: string
  email: string
  specialty: string
  status: string
  articles: number
  joinedAt: string
}

const initialDoctors = [
  {
    id: "1",
    name: "Dr. Amara Bekele",
    email: "amara@efoy.com",
    specialty: "Gynecologist",
    status: "active",
    articles: 12,
    joinedAt: "Jan 2024",
  },
  {
    id: "2",
    name: "Dr. Selam Haile",
    email: "selam@efoy.com",
    specialty: "Nutritionist",
    status: "active",
    articles: 8,
    joinedAt: "Feb 2024",
  },
  {
    id: "3",
    name: "Dr. Hana Tadesse",
    email: "hana@efoy.com",
    specialty: "Reproductive Health",
    status: "active",
    articles: 5,
    joinedAt: "Mar 2024",
  },
]

const specialties = [
  "Gynecologist",
  "Nutritionist",
  "Reproductive Health",
  "Endocrinologist",
  "Mental Health",
  "General Practitioner"
]

export default function AdminDashboardPage() {
  const { user, login } = useAuth()
  const [doctors, setDoctors] = useState<DoctorRow[]>(initialDoctors)
  const [adminId, setAdminId] = useState<string>("")
  const [isSavingDoctor, setIsSavingDoctor] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [selectedDoctorProfile, setSelectedDoctorProfile] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    email: "",
    specialty: "Gynecologist",
    tempPassword: "",
  })

  // Auto-login for demo
  useEffect(() => {
    if (!user) {
      login({
        id: "3",
        username: "Admin User",
        email: "admin@efoy.com",
        role: "admin",
        tier: "premium",
      })
    }
  }, [user, login])

  useEffect(() => {
    const loadAdminAndDoctors = async () => {
      if (!user) return

      try {
        const [adminsRes, doctorsRes] = await Promise.all([
          getAdmins({ limit: 100 }),
          getDoctors({ limit: 100 }),
        ])

        const admins = Array.isArray(adminsRes?.data) ? adminsRes.data : []
        const matchedAdmin = admins.find((item: any) => String(item?.userId?._id) === String(user.id))
          || admins.find((item: any) => String(item?.userId?.email || "").toLowerCase() === String(user.email || "").toLowerCase())
          || admins[0]

        if (matchedAdmin?._id) {
          setAdminId(String(matchedAdmin._id))
        }

        const items = Array.isArray(doctorsRes?.data) ? doctorsRes.data : []
        if (items.length > 0) {
          setDoctors(
            items.map((item: any) => ({
              id: String(item._id),
              name: item?.userId?.displayName || "Unknown",
              email: item?.userId?.email || "",
              specialty: item?.specialization || "N/A",
              status: item?.verificationStatus === "Rejected" ? "inactive" : "active",
              articles: 0,
              joinedAt: item?.createdAt
                ? new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                : "",
            }))
          )
        }
      } catch {
        // Keep fallback sample data when backend is unavailable.
      }
    }

    void loadAdminAndDoctors()
  }, [user])

  const handleAddDoctor = async () => {
    if (!adminId) {
      alert("Admin profile not found. Please log in with a valid admin account.")
      return
    }

    setIsSavingDoctor(true)
    try {
      const created = await createDoctorByAdmin(adminId, {
        displayName: newDoctor.name,
        email: newDoctor.email,
        password: newDoctor.tempPassword,
        specialization: newDoctor.specialty,
      })

      const mapped = {
        id: String(created?.doctor?._id || Date.now()),
        name: created?.user?.displayName || newDoctor.name,
        email: created?.user?.email || newDoctor.email,
        specialty: created?.doctor?.specialization || newDoctor.specialty,
        status: "active",
        articles: 0,
        joinedAt: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      }

      setDoctors((prev) => [mapped, ...prev])
      setNewDoctor({ name: "", email: "", specialty: "Gynecologist", tempPassword: "" })
      setIsAddOpen(false)
      alert("Doctor account created. The doctor can now log in from Doctor Portal using this email/password.")
    } catch (err: any) {
      alert(err?.message || "Failed to create doctor account")
    } finally {
      setIsSavingDoctor(false)
    }
  }

  const handleDeleteDoctor = async (id: string) => {
    if (confirm("Are you sure you want to remove this doctor?")) {
      try {
        await deleteDoctorById(String(id))
        setDoctors(doctors.filter(d => d.id !== id))
      } catch (err: any) {
        alert(err?.message || "Failed to remove doctor")
      }
    }
  }

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleViewProfile = async (doctorId: string | number) => {
    setIsProfileOpen(true)
    setIsLoadingProfile(true)
    setSelectedDoctorProfile(null)
    try {
      const doctor = await getDoctorById(String(doctorId))
      setSelectedDoctorProfile(doctor)
    } catch (err: any) {
      alert(err?.message || "Failed to load doctor profile")
      setIsProfileOpen(false)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const getAvailabilityLabel = (availability: any[] = []) => {
    const activeDays = availability.filter((item) => item?.enabled && Array.isArray(item?.slots) && item.slots.length > 0)
    if (activeDays.length === 0) return "No available hours set"
    return `${activeDays.length} day(s) configured`
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
          Doctor Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage healthcare professionals on the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-primary/10 p-2">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-semibold">{doctors.length}</p>
              <p className="text-xs text-muted-foreground">Total Doctors</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-secondary/30 p-2">
              <FileText className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold">{doctors.reduce((sum, d) => sum + d.articles, 0)}</p>
              <p className="text-xs text-muted-foreground">Articles</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-muted p-2">
              <Flag className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold">3</p>
              <p className="text-xs text-muted-foreground">Pending Reports</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-secondary/30 p-2">
              <Eye className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold">2.4k</p>
              <p className="text-xs text-muted-foreground">Active Users</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search doctors..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add New Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
              <DialogDescription>
                Create a new doctor account. They will receive login credentials via email.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Dr. Full Name"
                    className="pl-10"
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <select
                    id="specialty"
                    className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm"
                    value={newDoctor.specialty}
                    onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                  >
                    {specialties.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@efoy.com"
                    className="pl-10"
                    value={newDoctor.email}
                    onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="text"
                    placeholder="Enter temporary password"
                    className="pl-10"
                    minLength={8}
                    value={newDoctor.tempPassword}
                    onChange={(e) => setNewDoctor({ ...newDoctor, tempPassword: e.target.value })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Use at least 8 characters. The doctor will be required to change this on first login.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddDoctor}
                disabled={!newDoctor.name || !newDoctor.email || newDoctor.tempPassword.length < 8 || isSavingDoctor}
              >
                {isSavingDoctor ? "Creating..." : "Create Account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Doctors Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead className="hidden md:table-cell">Specialty</TableHead>
                <TableHead className="hidden md:table-cell">Articles</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {doctor.name.split(' ').slice(1).map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-sm text-muted-foreground">{doctor.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">{doctor.specialty}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{doctor.articles}</TableCell>
                  <TableCell className="hidden md:table-cell">{doctor.joinedAt}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={doctor.status === "active" ? "default" : "secondary"}
                      className={doctor.status === "active" ? "bg-secondary text-secondary-foreground" : ""}
                    >
                      {doctor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => void handleViewProfile(doctor.id)}>
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>Reset Password</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => void handleDeleteDoctor(doctor.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Doctor
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredDoctors.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">No doctors found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Doctor Profile
            </DialogTitle>
            <DialogDescription>
              View detailed account information and availability settings.
            </DialogDescription>
          </DialogHeader>

          {isLoadingProfile ? (
            <div className="py-6 text-sm text-muted-foreground">Loading profile...</div>
          ) : selectedDoctorProfile ? (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {String(selectedDoctorProfile?.userId?.displayName || "DR")
                      .split(" ")
                      .slice(0, 2)
                      .map((part: string) => part[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedDoctorProfile?.userId?.displayName || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">{selectedDoctorProfile?.userId?.email || ""}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Specialty</p>
                  <p className="mt-1 text-sm font-medium">{selectedDoctorProfile?.specialization || "N/A"}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Verification</p>
                  <p className="mt-1 text-sm font-medium">{selectedDoctorProfile?.verificationStatus || "N/A"}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="mt-1 text-sm font-medium">{selectedDoctorProfile?.userId?.role || "Doctor"}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Availability</p>
                  <p className="mt-1 text-sm font-medium">{getAvailabilityLabel(selectedDoctorProfile?.availability || [])}</p>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Bio</p>
                <p className="mt-1 text-sm">{selectedDoctorProfile?.bio || "No bio added yet."}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Joined: {selectedDoctorProfile?.createdAt ? new Date(selectedDoctorProfile.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Updated: {selectedDoctorProfile?.updatedAt ? new Date(selectedDoctorProfile.updatedAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-sm text-muted-foreground">Profile data unavailable.</div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfileOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

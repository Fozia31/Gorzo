"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { 
  Mic,
  MicOff,
  Trash2,
  PlayCircle,
  PauseCircle,
  Square,
  Clock,
  Send,
  Search,
  Download,
  MoreHorizontal,
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Sample voice notes
const sampleVoiceNotes = [
  {
    id: 1,
    title: "Understanding Your Cycle",
    duration: "3:45",
    createdAt: "2 hours ago",
    type: "article",
    articleTitle: "Menstrual Health 101",
    plays: 156,
  },
  {
    id: 2,
    title: "Response to Selam123",
    duration: "1:20",
    createdAt: "Yesterday",
    type: "patient",
    patientName: "Selam123",
    status: "sent",
  },
  {
    id: 3,
    title: "Nutrition Tips for Fertility",
    duration: "5:12",
    createdAt: "3 days ago",
    type: "article",
    articleTitle: "Fertility & Nutrition Guide",
    plays: 89,
  },
  {
    id: 4,
    title: "Follow-up for HopefulMama",
    duration: "2:30",
    createdAt: "1 week ago",
    type: "patient",
    patientName: "HopefulMama",
    status: "played",
  },
  {
    id: 5,
    title: "Hormonal Balance Explanation",
    duration: "4:05",
    createdAt: "1 week ago",
    type: "article",
    articleTitle: "Hormonal Health Guide",
    plays: 234,
  },
]

// Sample patients for sending voice notes
const patients = [
  { id: 1, username: "Selam123", avatar: "S1" },
  { id: 2, username: "HopefulMama", avatar: "HM" },
  { id: 3, username: "BloomingFlower", avatar: "BF" },
  { id: 4, username: "WellnessJourney", avatar: "WJ" },
]

export default function VoiceNotesPage() {
  const { user, login } = useAuth()
  const [voiceNotes, setVoiceNotes] = useState(sampleVoiceNotes)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasRecording, setHasRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [selectedPatient, setSelectedPatient] = useState("")
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-login for demo
  useEffect(() => {
    if (!user) {
      login({
        id: "2",
        username: "Dr. Amara",
        email: "doctor@efoy.com",
        role: "doctor",
      })
    }
  }, [user, login])

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    setHasRecording(false)
  }

  const stopRecording = () => {
    setIsRecording(false)
    setHasRecording(true)
  }

  const deleteRecording = () => {
    setHasRecording(false)
    setRecordingTime(0)
  }

  const togglePlayback = (id?: number) => {
    if (id !== undefined) {
      if (playingId === id) {
        setIsPlaying(!isPlaying)
      } else {
        setPlayingId(id)
        setIsPlaying(true)
      }
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const handleSendVoiceNote = () => {
    if (!hasRecording || !newNoteTitle || !selectedPatient) return
    
    const patient = patients.find(p => p.id.toString() === selectedPatient)
    const newNote = {
      id: voiceNotes.length + 1,
      title: newNoteTitle,
      duration: formatTime(recordingTime),
      createdAt: "Just now",
      type: "patient" as const,
      patientName: patient?.username || "Unknown",
      status: "sent" as const,
    }
    
    setVoiceNotes([newNote, ...voiceNotes])
    setHasRecording(false)
    setRecordingTime(0)
    setNewNoteTitle("")
    setSelectedPatient("")
    setSendDialogOpen(false)
  }

  const deleteVoiceNote = (id: number) => {
    setVoiceNotes(voiceNotes.filter(note => note.id !== id))
  }

  const filteredNotes = voiceNotes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || note.type === filterType
    return matchesSearch && matchesType
  })

  const articleNotes = voiceNotes.filter(note => note.type === "article")
  const patientNotes = voiceNotes.filter(note => note.type === "patient")

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
            Voice Notes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Record and manage voice notes for patients and articles
          </p>
        </div>
        <Button onClick={() => setSendDialogOpen(true)} className="gap-2">
          <Mic className="h-4 w-4" />
          New Voice Note
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-primary/10 p-2">
              <Mic className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-semibold">{voiceNotes.length}</p>
              <p className="text-xs text-muted-foreground">Total Notes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-secondary/30 p-2">
              <BookOpen className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold">{articleNotes.length}</p>
              <p className="text-xs text-muted-foreground">For Articles</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-muted p-2">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold">{patientNotes.length}</p>
              <p className="text-xs text-muted-foreground">For Patients</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-primary/10 p-2">
              <PlayCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-semibold">
                {articleNotes.reduce((acc, note) => acc + (note.plays || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Plays</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search voice notes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Notes</SelectItem>
            <SelectItem value="article">Articles</SelectItem>
            <SelectItem value="patient">Patients</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Voice Notes List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All ({voiceNotes.length})</TabsTrigger>
          <TabsTrigger value="articles">Articles ({articleNotes.length})</TabsTrigger>
          <TabsTrigger value="patients">Patients ({patientNotes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-3">
          {filteredNotes.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mic className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-center text-muted-foreground">
                  No voice notes found
                </p>
                <Button variant="outline" className="mt-4 gap-2" onClick={() => setSendDialogOpen(true)}>
                  <Mic className="h-4 w-4" />
                  Record Your First Note
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredNotes.map((note) => (
              <VoiceNoteCard
                key={note.id}
                note={note}
                isPlaying={playingId === note.id && isPlaying}
                onPlayToggle={() => togglePlayback(note.id)}
                onDelete={() => deleteVoiceNote(note.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="articles" className="mt-4 space-y-3">
          {articleNotes.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-center text-muted-foreground">
                  No article voice notes yet
                </p>
              </CardContent>
            </Card>
          ) : (
            articleNotes.map((note) => (
              <VoiceNoteCard
                key={note.id}
                note={note}
                isPlaying={playingId === note.id && isPlaying}
                onPlayToggle={() => togglePlayback(note.id)}
                onDelete={() => deleteVoiceNote(note.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="patients" className="mt-4 space-y-3">
          {patientNotes.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-center text-muted-foreground">
                  No patient voice notes yet
                </p>
              </CardContent>
            </Card>
          ) : (
            patientNotes.map((note) => (
              <VoiceNoteCard
                key={note.id}
                note={note}
                isPlaying={playingId === note.id && isPlaying}
                onPlayToggle={() => togglePlayback(note.id)}
                onDelete={() => deleteVoiceNote(note.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* New Voice Note Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Voice Note</DialogTitle>
            <DialogDescription>
              Record a voice note to send to a patient
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Recording Controls */}
            <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-muted/30 p-6">
              {!hasRecording ? (
                <>
                  <div className={cn(
                    "flex h-20 w-20 items-center justify-center rounded-full transition-all",
                    isRecording 
                      ? "bg-destructive/20 animate-pulse" 
                      : "bg-primary/10"
                  )}>
                    {isRecording ? (
                      <Mic className="h-8 w-8 text-destructive" />
                    ) : (
                      <MicOff className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-2xl font-mono font-medium">
                    {formatTime(recordingTime)}
                  </p>
                  <div className="flex gap-2">
                    {isRecording ? (
                      <Button 
                        variant="destructive" 
                        size="lg" 
                        onClick={stopRecording}
                        className="gap-2"
                      >
                        <Square className="h-4 w-4" />
                        Stop Recording
                      </Button>
                    ) : (
                      <Button 
                        size="lg" 
                        onClick={startRecording}
                        className="gap-2"
                      >
                        <Mic className="h-4 w-4" />
                        Start Recording
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/30">
                    <CheckCircle2 className="h-8 w-8 text-secondary-foreground" />
                  </div>
                  <p className="text-lg font-medium">Recording Complete</p>
                  <p className="text-sm text-muted-foreground">
                    Duration: {formatTime(recordingTime)}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => togglePlayback()}
                      className="gap-2"
                    >
                      {isPlaying && playingId === null ? (
                        <PauseCircle className="h-4 w-4" />
                      ) : (
                        <PlayCircle className="h-4 w-4" />
                      )}
                      Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={deleteRecording}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Note Details */}
            {hasRecording && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note-title">Note Title</Label>
                  <Input
                    id="note-title"
                    placeholder="e.g., Response to question about..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Send to Patient</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px]">
                                {patient.avatar}
                              </AvatarFallback>
                            </Avatar>
                            {patient.username}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSendDialogOpen(false)
              setHasRecording(false)
              setRecordingTime(0)
              setNewNoteTitle("")
              setSelectedPatient("")
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendVoiceNote}
              disabled={!hasRecording || !newNoteTitle || !selectedPatient}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Send Voice Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Voice Note Card Component
function VoiceNoteCard({ 
  note, 
  isPlaying, 
  onPlayToggle, 
  onDelete 
}: { 
  note: typeof sampleVoiceNotes[0]
  isPlaying: boolean
  onPlayToggle: () => void
  onDelete: () => void
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-4">
        {/* Play Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-12 w-12 shrink-0 rounded-full",
            isPlaying ? "bg-primary/10 text-primary" : "bg-muted"
          )}
          onClick={onPlayToggle}
        >
          {isPlaying ? (
            <PauseCircle className="h-6 w-6" />
          ) : (
            <PlayCircle className="h-6 w-6" />
          )}
        </Button>

        {/* Note Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{note.title}</p>
            <Badge 
              variant={note.type === "article" ? "default" : "secondary"}
              className="shrink-0"
            >
              {note.type === "article" ? "Article" : "Patient"}
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {note.duration}
            </span>
            <span>{note.createdAt}</span>
            {note.type === "article" && note.plays !== undefined && (
              <span className="flex items-center gap-1">
                <PlayCircle className="h-3 w-3" />
                {note.plays} plays
              </span>
            )}
            {note.type === "patient" && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {note.patientName}
              </span>
            )}
          </div>
          {note.type === "article" && note.articleTitle && (
            <p className="mt-1 text-xs text-muted-foreground">
              Attached to: {note.articleTitle}
            </p>
          )}
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}

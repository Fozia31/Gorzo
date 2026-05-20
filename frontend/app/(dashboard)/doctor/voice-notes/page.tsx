"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import {
  deleteDoctorAdvice,
  getDoctorAdviceByDoctor,
  getDoctorAdviceById,
  updateDoctorAdvice,
  uploadDoctorAdviceAudio,
} from "@/api/doctorAdviceApi";
import { getDoctorByUserId, getDoctorPatients } from "@/api/doctorApi";
import { getChats, getOrCreateDoctorChat } from "@/api/chatApi";
import {
  deleteMessageById,
  getMessagesByChat,
  sendMessage,
} from "@/api/messageApi";
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
  CircleAlert,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type VoiceNoteItem = {
  id: string | number;
  backendId?: string;
  title: string;
  duration: string;
  createdAt: string;
  type: "article" | "patient";
  articleTitle?: string;
  patientName?: string;
  status?: string;
  plays?: number;
  audioUrl?: string;
  category?: string;
  textContent?: string;
};

type PatientOption = {
  id: string;
  username: string;
  avatar: string;
};

type PageMessage = {
  type: "success" | "error";
  text: string;
};

const buildPatientAvatar = (username: string) =>
  username
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "P";

export default function VoiceNotesPage() {
  const { user, login } = useAuth();
  const userId = user?.id;
  const [doctorRecordId, setDoctorRecordId] = useState<string>("");
  const [voiceNotes, setVoiceNotes] = useState<VoiceNoteItem[]>([]);
  const [patientOptions, setPatientOptions] = useState<PatientOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingId, setPlayingId] = useState<string | number | null>(null);
  const [playingUrl, setPlayingUrl] = useState<string>("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<{
    url: string;
    durationSec: number;
  } | null>(null);
  const [pageMessage, setPageMessage] = useState<PageMessage | null>(null);
  const [isEditArticleDialogOpen, setIsEditArticleDialogOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string>("");
  const [isSavingArticleEdit, setIsSavingArticleEdit] = useState(false);
  const [editArticleData, setEditArticleData] = useState({
    title: "",
    category: "Hormones",
    content: "",
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!user) {
      login({
        id: "2",
        username: "Dr. Amara",
        email: "doctor@efoy.com",
        role: "doctor",
      });
    }
  }, [user, login]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    void loadDoctorRecordId();
  }, [userId]);

  useEffect(() => {
    const loadVoiceData = async () => {
      if (!doctorRecordId) return;

      try {
        const [adviceItems, patientResponse, chats] = await Promise.all([
          getDoctorAdviceByDoctor(doctorRecordId, { status: "published" }),
          getDoctorPatients(doctorRecordId, { limit: 100 }),
          getChats({ doctorId: doctorRecordId, sessionStatus: "Active" }),
        ]);

        const articleVoiceNotes: VoiceNoteItem[] = Array.isArray(adviceItems)
          ? adviceItems.map((item: any) => ({
              id: item._id,
              backendId: item._id,
              title: item.title,
              duration: item.audioDuration
                ? formatTime(item.audioDuration)
                : "-",
              createdAt: item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : "N/A",
              type: "article" as const,
              articleTitle: item.title,
              plays: Number(item.viewsCount || 0),
              audioUrl: String(item.voiceUrl || ""),
              category: String(item.category || "Hormones"),
              textContent: String(item.textContent || ""),
            }))
          : [];

        const chatsList = Array.isArray(chats) ? chats : [];
        const patientVoiceResults = await Promise.all(
          chatsList.map(async (chat: any) => {
            try {
              const response = await getMessagesByChat(chat._id, {
                limit: 200,
              });
              const messages = Array.isArray(response?.data)
                ? response.data
                : [];
              const patientName =
                chat?.userId?.displayName ||
                chat?.userId?.username ||
                "Patient";

              return messages
                .filter(
                  (msg: any) =>
                    msg.messageType === "voice" &&
                    msg.senderRole === "Doctor" &&
                    msg.voiceUrl,
                )
                .map((msg: any) => ({
                  id: msg._id,
                  backendId: msg._id,
                  title: msg.messageText || `Insight to ${patientName}`,
                  duration: formatTime(Number(msg.durationSec || 0)),
                  createdAt: msg.createdAt
                    ? new Date(msg.createdAt).toLocaleDateString()
                    : "N/A",
                  type: "patient" as const,
                  patientName,
                  status: msg.isRead ? "played" : "sent",
                  audioUrl: String(msg.voiceUrl || ""),
                }));
            } catch {
              return [] as VoiceNoteItem[];
            }
          }),
        );

        const patientVoiceNotes = patientVoiceResults.flat();
        setVoiceNotes([...patientVoiceNotes, ...articleVoiceNotes]);

        const optionsFromPatientsApi: PatientOption[] = Array.isArray(
          patientResponse?.data,
        )
          ? (patientResponse.data
              .map((item: any) => {
                const id = String(item?.id || "");
                const username = String(item?.username || "").trim();
                if (!id || !username) return null;
                return {
                  id,
                  username,
                  avatar: buildPatientAvatar(username),
                };
              })
              .filter(Boolean) as PatientOption[])
          : [];

        const optionsFromChats: PatientOption[] = chatsList
          .map((chat: any) => {
            const id = String(chat?.userId?._id || "");
            const username = String(
              chat?.userId?.displayName || chat?.userId?.username || "",
            ).trim();
            if (!id || !username) return null;
            return {
              id,
              username,
              avatar: buildPatientAvatar(username),
            };
          })
          .filter(Boolean) as PatientOption[];

        const merged = [...optionsFromPatientsApi, ...optionsFromChats];
        const uniqueById = Array.from(
          new Map(merged.map((item) => [item.id, item])).values(),
        );
        setPatientOptions(uniqueById);
      } catch {
        setPatientOptions([]);
      }
    };

    void loadVoiceData();
  }, [doctorRecordId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    if (!isPlaying || !playingUrl) {
      audioRef.current.pause();
      return;
    }

    audioRef.current.src = playingUrl;
    void audioRef.current.play().catch(() => {
      setIsPlaying(false);
      setPlayingId(null);
    });
  }, [isPlaying, playingUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.start();
      setRecordedAudio(null);
      setHasRecording(false);
      setRecordingTime(0);
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch {
      setPageMessage({
        type: "error",
        text: "Microphone access denied or unavailable.",
      });
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    recorder.onstop = async () => {
      try {
        const blob = new Blob(recordedChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        if (!blob.size) throw new Error("Empty recording");

        setIsUploadingAudio(true);
        const extension = recorder.mimeType.includes("webm") ? "webm" : "wav";
        const file = new window.File(
          [blob],
          `voice-note-${Date.now()}.${extension}`,
          {
            type: recorder.mimeType || "audio/webm",
          },
        );
        const uploaded = await uploadDoctorAdviceAudio(file);

        setRecordedAudio({
          url: String(uploaded?.url || ""),
          durationSec: recordingTime,
        });
        setHasRecording(true);
      } catch {
        setPageMessage({
          type: "error",
          text: "Failed to upload recording. Please try again.",
        });
        setHasRecording(false);
      } finally {
        setIsUploadingAudio(false);
        mediaRecorderRef.current = null;
        recordedChunksRef.current = [];
        if (recordingStreamRef.current) {
          recordingStreamRef.current
            .getTracks()
            .forEach((track) => track.stop());
          recordingStreamRef.current = null;
        }
      }
    };

    recorder.stop();
  };

  const deleteRecording = () => {
    setHasRecording(false);
    setRecordingTime(0);
    setRecordedAudio(null);
  };

  const togglePlayback = (id: string | number, audioUrl?: string) => {
    if (!audioUrl) return;
    if (playingId === id && isPlaying) {
      setIsPlaying(false);
      return;
    }
    setPlayingId(id);
    setPlayingUrl(audioUrl);
    setIsPlaying(true);
  };

  const handleSendVoiceNote = () => {
    if (
      !hasRecording ||
      !newNoteTitle ||
      !selectedPatient ||
      !doctorRecordId ||
      !userId ||
      !recordedAudio?.url
    )
      return;

    const submit = async () => {
      try {
        const patient = patientOptions.find(
          (p) => p.id.toString() === selectedPatient,
        );
        const chat = await getOrCreateDoctorChat({
          doctorId: doctorRecordId,
          userId: selectedPatient,
        });
        const sent = await sendMessage({
          chatId: chat._id,
          senderId: userId,
          senderRole: "Doctor",
          messageType: "voice",
          voiceUrl: recordedAudio.url,
          durationSec: recordedAudio.durationSec,
          messageText: newNoteTitle,
        });

        const newNote = {
          id: sent?._id || voiceNotes.length + 1,
          backendId: sent?._id,
          title: newNoteTitle,
          duration: formatTime(recordedAudio.durationSec),
          createdAt: "Just now",
          type: "patient" as const,
          patientName: patient?.username || "Unknown",
          status: "sent" as const,
          audioUrl: String(sent?.voiceUrl || recordedAudio.url),
        };

        setVoiceNotes([newNote, ...voiceNotes]);
        setHasRecording(false);
        setRecordingTime(0);
        setRecordedAudio(null);
        setNewNoteTitle("");
        setSelectedPatient("");
        setSendDialogOpen(false);
      } catch {
        setPageMessage({
          type: "error",
          text: "Failed to send insight. Please try again.",
        });
      }
    };

    void submit();
  };

  const deleteVoiceNote = (id: number | string) => {
    const remove = async () => {
      try {
        const note = voiceNotes.find((item) => item.id === id);
        if (note?.backendId && note.type === "patient") {
          await deleteMessageById(note.backendId);
        }
        if (note?.backendId && note.type === "article") {
          await deleteDoctorAdvice(note.backendId);
        }
        setVoiceNotes((prev) => prev.filter((item) => item.id !== id));
      } catch {
        setPageMessage({ type: "error", text: "Failed to delete insight." });
      }
    };

    void remove();
  };

  const handleOpenEditArticle = async (note: VoiceNoteItem) => {
    if (note.type !== "article" || !note.backendId) return;

    setEditingArticleId(note.backendId);
    setEditArticleData({
      title: note.title || "",
      category: note.category || "Hormones",
      content: note.textContent || "",
    });
    setIsEditArticleDialogOpen(true);

    try {
      const details = await getDoctorAdviceById(note.backendId);
      setEditArticleData({
        title: details?.title || note.title || "",
        category: details?.category || note.category || "Hormones",
        content: details?.textContent || note.textContent || "",
      });
    } catch {
      // Keep optimistic values if fetch fails.
    }
  };

  const handleSaveArticleEdit = async () => {
    if (!editingArticleId) return;
    const trimmedTitle = editArticleData.title.trim();
    if (!trimmedTitle) {
      setPageMessage({ type: "error", text: "Title is required." });
      return;
    }

    setIsSavingArticleEdit(true);
    try {
      const updated = await updateDoctorAdvice(editingArticleId, {
        title: trimmedTitle,
        category: editArticleData.category,
        textContent: editArticleData.content,
      });

      setVoiceNotes((prev) =>
        prev.map((item) =>
          item.backendId === editingArticleId
            ? {
                ...item,
                title: updated?.title || trimmedTitle,
                articleTitle: updated?.title || trimmedTitle,
                category: updated?.category || editArticleData.category,
                textContent: updated?.textContent || editArticleData.content,
              }
            : item,
        ),
      );

      setIsEditArticleDialogOpen(false);
      setEditingArticleId("");
      setPageMessage({
        type: "success",
        text: "Article updated successfully!",
      });
    } catch {
      setPageMessage({ type: "error", text: "Failed to update article." });
    } finally {
      setIsSavingArticleEdit(false);
    }
  };

  const filteredNotes = voiceNotes.filter((note) => {
    const matchesSearch = note.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || note.type === filterType;
    return matchesSearch && matchesType;
  });

  const articleNotes = voiceNotes.filter((note) => note.type === "article");
  const patientNotes = voiceNotes.filter((note) => note.type === "patient");

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
            Insights
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Record and manage insights for patients and articles
          </p>
        </div>
        <Button onClick={() => setSendDialogOpen(true)} className="gap-2">
          <Mic className="h-4 w-4" />
          New Insight
        </Button>
      </div>

      {pageMessage && (
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
      )}

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
            placeholder="Search insights..."
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

      {/* Insights List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All ({voiceNotes.length})</TabsTrigger>
          <TabsTrigger value="articles">
            Articles ({articleNotes.length})
          </TabsTrigger>
          <TabsTrigger value="patients">
            Patients ({patientNotes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-3">
          {filteredNotes.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mic className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-center text-muted-foreground">
                  No insights found
                </p>
                <Button
                  variant="outline"
                  className="mt-4 gap-2"
                  onClick={() => setSendDialogOpen(true)}
                >
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
                onPlayToggle={() => togglePlayback(note.id, note.audioUrl)}
                onEdit={() => handleOpenEditArticle(note)}
                onDownload={() =>
                  note.audioUrl && window.open(note.audioUrl, "_blank")
                }
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
                  No article insights yet
                </p>
              </CardContent>
            </Card>
          ) : (
            articleNotes.map((note) => (
              <VoiceNoteCard
                key={note.id}
                note={note}
                isPlaying={playingId === note.id && isPlaying}
                onPlayToggle={() => togglePlayback(note.id, note.audioUrl)}
                onEdit={() => handleOpenEditArticle(note)}
                onDownload={() =>
                  note.audioUrl && window.open(note.audioUrl, "_blank")
                }
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
                  No patient insights yet
                </p>
              </CardContent>
            </Card>
          ) : (
            patientNotes.map((note) => (
              <VoiceNoteCard
                key={note.id}
                note={note}
                isPlaying={playingId === note.id && isPlaying}
                onPlayToggle={() => togglePlayback(note.id, note.audioUrl)}
                onEdit={() => handleOpenEditArticle(note)}
                onDownload={() =>
                  note.audioUrl && window.open(note.audioUrl, "_blank")
                }
                onDelete={() => deleteVoiceNote(note.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* New Insight Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Insight</DialogTitle>
            <DialogDescription>
              Record an insight to send to a patient
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Recording Controls */}
            <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-muted/30 p-6">
              {!hasRecording ? (
                <>
                  <div
                    className={cn(
                      "flex h-20 w-20 items-center justify-center rounded-full transition-all",
                      isRecording
                        ? "bg-destructive/20 animate-pulse"
                        : "bg-primary/10",
                    )}
                  >
                    {isRecording ? (
                      <Mic className="h-8 w-8 text-destructive" />
                    ) : (
                      <MicOff className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-2xl font-mono font-medium">
                    {formatTime(recordingTime)}
                  </p>
                  {isUploadingAudio && (
                    <p className="text-xs text-muted-foreground">
                      Uploading audio...
                    </p>
                  )}
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
                      onClick={() =>
                        togglePlayback("preview", recordedAudio?.url)
                      }
                      className="gap-2"
                    >
                      {isPlaying && playingId === "preview" ? (
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
                  <Select
                    value={selectedPatient}
                    onValueChange={setSelectedPatient}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patientOptions.length === 0 ? (
                        <SelectItem value="__no_patient__" disabled>
                          No patients found
                        </SelectItem>
                      ) : null}
                      {patientOptions.map((patient) => (
                        <SelectItem
                          key={patient.id}
                          value={patient.id.toString()}
                        >
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
            <Button
              variant="outline"
              onClick={() => {
                setSendDialogOpen(false);
                setHasRecording(false);
                setRecordingTime(0);
                setRecordedAudio(null);
                setNewNoteTitle("");
                setSelectedPatient("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendVoiceNote}
              disabled={
                !hasRecording ||
                !newNoteTitle ||
                !selectedPatient ||
                isUploadingAudio ||
                patientOptions.length === 0
              }
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Send Insight
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <audio
        ref={audioRef}
        onEnded={() => {
          setIsPlaying(false);
          setPlayingId(null);
        }}
        className="hidden"
      />

      <Dialog
        open={isEditArticleDialogOpen}
        onOpenChange={setIsEditArticleDialogOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
            <DialogDescription>
              Update the article linked to this insight.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-voice-article-title">Title</Label>
              <Input
                id="edit-voice-article-title"
                value={editArticleData.title}
                onChange={(e) =>
                  setEditArticleData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-voice-article-category">Category</Label>
              <Select
                value={editArticleData.category}
                onValueChange={(value) =>
                  setEditArticleData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger id="edit-voice-article-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hormones">Hormones</SelectItem>
                  <SelectItem value="Nutrition">Nutrition</SelectItem>
                  <SelectItem value="Fertility">Fertility</SelectItem>
                  <SelectItem value="Conditions">Conditions</SelectItem>
                  <SelectItem value="Wellness">Wellness</SelectItem>
                  <SelectItem value="Mental Health">Mental Health</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-voice-article-content">Content</Label>
              <Input
                id="edit-voice-article-content"
                value={editArticleData.content}
                onChange={(e) =>
                  setEditArticleData((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditArticleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveArticleEdit}
              disabled={isSavingArticleEdit}
            >
              {isSavingArticleEdit ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Insight Card Component
function VoiceNoteCard({
  note,
  isPlaying,
  onPlayToggle,
  onEdit,
  onDownload,
  onDelete,
}: {
  note: VoiceNoteItem;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  const hasAudio = Boolean(note.audioUrl);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-4">
        {/* Play Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-12 w-12 shrink-0 rounded-full",
            isPlaying ? "bg-primary/10 text-primary" : "bg-muted",
          )}
          onClick={onPlayToggle}
          disabled={!hasAudio}
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
              {hasAudio
                ? `Attached to: ${note.articleTitle}`
                : `No insight yet: ${note.articleTitle}`}
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
            {note.type === "article" && (
              <DropdownMenuItem className="gap-2" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="gap-2"
              onClick={onDownload}
              disabled={!hasAudio}
            >
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
  );
}

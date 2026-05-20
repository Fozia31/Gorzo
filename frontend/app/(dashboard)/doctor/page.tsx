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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import {
  getDoctorAvailability,
  getDoctorByUserId,
  getDoctorDashboardSummary,
  getDoctorPatients,
  getDoctorRatingStats,
  getDoctorRatings,
  updateDoctorAvailability,
} from "@/api/doctorApi";
import {
  createDoctorAdvice,
  deleteDoctorAdvice,
  getDoctorAdviceById,
  getDoctorAdviceByDoctor,
  updateDoctorAdvice,
  uploadDoctorAdviceAudio,
  uploadDoctorAdviceFiles,
} from "@/api/doctorAdviceApi";
import { getOrCreateDoctorChat } from "@/api/chatApi";
import { sendMessage } from "@/api/messageApi";
import {
  FileText,
  Mic,
  MicOff,
  Upload,
  Save,
  Eye,
  Trash2,
  PlayCircle,
  PauseCircle,
  Square,
  Clock,
  Check,
  Users,
  MessageSquare,
  Send,
  Search,
  UserPlus,
  Activity,
  Calendar,
  ChevronRight,
  Star,
  TrendingUp,
  ThumbsUp,
  Plus,
  X,
  File,
  FileImage,
  FileType,
  Download,
  CircleAlert,
  CheckCircle2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type DashboardPatient = {
  id: string;
  username: string;
  avatar: string;
  lastVisit: string;
  status: "active" | "inactive";
  tier: "premium" | "free";
  unreadMessages: number;
  consultations: number;
  joinedDate: string;
};

type PublishedArticle = {
  id: string | number;
  title: string;
  category: string;
  publishedAt: string;
  views: number;
  hasVoiceNote: boolean;
};

type RatingReview = {
  id: string | number;
  user: string;
  rating: number;
  comment: string;
  date: string;
  anonymous: boolean;
};

const categories = [
  "Hormones",
  "Nutrition",
  "Fertility",
  "Conditions",
  "Wellness",
  "Mental Health",
];

const emptyRatingStats = {
  average: 0,
  total: 0,
  distribution: [
    { stars: 5, count: 0, percentage: 0 },
    { stars: 4, count: 0, percentage: 0 },
    { stars: 3, count: 0, percentage: 0 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 },
  ],
  thisMonth: 0,
  lastMonth: 0,
};

type PageMessage = {
  type: "success" | "error";
  text: string;
};

type UploadedFile = {
  name: string;
  size: number;
  type: string;
  url: string;
};

type UploadedAudio = {
  name: string;
  size: number;
  type: string;
  url: string;
};

// Days of the week
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Time slots
const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

type AvailabilitySlot = { start: string; end: string };
type AvailabilityDay = { enabled: boolean; slots: AvailabilitySlot[] };
type AvailabilityRecord = Record<string, AvailabilityDay>;

const initialAvailability: AvailabilityRecord = {
  Monday: {
    enabled: true,
    slots: [
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "17:00" },
    ],
  },
  Tuesday: {
    enabled: true,
    slots: [
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "17:00" },
    ],
  },
  Wednesday: { enabled: true, slots: [{ start: "09:00", end: "12:00" }] },
  Thursday: {
    enabled: true,
    slots: [
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "17:00" },
    ],
  },
  Friday: { enabled: true, slots: [{ start: "09:00", end: "12:00" }] },
  Saturday: { enabled: false, slots: [] },
  Sunday: { enabled: false, slots: [] },
};

const buildAvatar = (username: string) => {
  const parts = username.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const toRelativeTime = (dateValue: string | number | Date | undefined) => {
  if (!dateValue) return "N/A";
  const date = new Date(dateValue);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const availabilityRecordFromApi = (
  apiAvailability: Array<{
    day: string;
    enabled: boolean;
    slots: AvailabilitySlot[];
  }>,
) => {
  const base: AvailabilityRecord = { ...initialAvailability };
  for (const item of apiAvailability || []) {
    if (base[item.day as keyof typeof base]) {
      base[item.day as keyof typeof base] = {
        enabled: Boolean(item.enabled),
        slots: Array.isArray(item.slots) ? item.slots : [],
      };
    }
  }
  return base;
};

const availabilityPayloadFromRecord = (record: AvailabilityRecord) => {
  return daysOfWeek.map((day) => ({
    day,
    enabled: Boolean(record[day]?.enabled),
    slots: Array.isArray(record[day]?.slots) ? record[day].slots : [],
  }));
};

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const [doctorRecordId, setDoctorRecordId] = useState<string>("");
  const [patients, setPatients] = useState<DashboardPatient[]>([]);
  const [publishedArticles, setPublishedArticles] = useState<
    PublishedArticle[]
  >([]);
  const [myRatings, setMyRatings] = useState<RatingReview[]>([]);
  const [ratingStats, setRatingStats] = useState(emptyRatingStats);
  const [dashboardSummary, setDashboardSummary] = useState({
    patients: 0,
    unreadMessages: 0,
    publishedArticles: 0,
    ratingAverage: 0,
    ratingTotal: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] =
    useState<DashboardPatient | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messageToSend, setMessageToSend] = useState("");
  const [sendingVoiceNote, setSendingVoiceNote] = useState(false);
  const [articleData, setArticleData] = useState({
    title: "",
    category: "Hormones",
    content: "",
  });
  const [availability, setAvailability] =
    useState<
      Record<
        string,
        { enabled: boolean; slots: { start: string; end: string }[] }
      >
    >(initialAvailability);
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadedAudio, setUploadedAudio] = useState<UploadedAudio | null>(
    null,
  );
  const [pageMessage, setPageMessage] = useState<PageMessage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<
    string | number | null
  >(null);
  const [editArticleData, setEditArticleData] = useState({
    title: "",
    category: "Hormones",
    content: "",
  });
  const [isEditArticleDialogOpen, setIsEditArticleDialogOpen] = useState(false);
  const [isSavingArticleEdit, setIsSavingArticleEdit] = useState(false);
  const [deletingArticleId, setDeletingArticleId] = useState<
    string | number | null
  >(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const loadDoctorRecordId = async () => {
      if (!userId) return;
      try {
        const doctor = await getDoctorByUserId(userId);
        if (doctor?._id) {
          setDoctorRecordId(String(doctor._id));
        }
      } catch {
        setDoctorRecordId("");
      }
    };

    void loadDoctorRecordId();
  }, [userId, user?.email, user?.username]);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!doctorRecordId) return;

      try {
        const [
          summary,
          patientsResponse,
          apiAvailability,
          stats,
          ratingsResponse,
          adviceItems,
        ] = await Promise.all([
          getDoctorDashboardSummary(doctorRecordId),
          getDoctorPatients(doctorRecordId, { limit: 100 }),
          getDoctorAvailability(doctorRecordId),
          getDoctorRatingStats(doctorRecordId),
          getDoctorRatings(doctorRecordId, { limit: 20 }),
          getDoctorAdviceByDoctor(doctorRecordId, { status: "published" }),
        ]);

        setDashboardSummary({
          patients: Number(summary?.patients || 0),
          unreadMessages: Number(summary?.unreadMessages || 0),
          publishedArticles: Number(summary?.publishedArticles || 0),
          ratingAverage: Number(summary?.rating?.average || 0),
          ratingTotal: Number(summary?.rating?.total || 0),
        });

        const mappedPatients = Array.isArray(patientsResponse?.data)
          ? patientsResponse.data.map((item: any) => ({
              id: item.id,
              username: item.username,
              avatar: buildAvatar(item.username),
              lastVisit: toRelativeTime(item.lastVisitAt),
              status: item.status === "active" ? "active" : "inactive",
              tier: item.tier === "premium" ? "premium" : "free",
              unreadMessages: Number(item.unreadMessages || 0),
              consultations: Number(item.consultations || 0),
              joinedDate: item.joinedDate || "",
            }))
          : [];

        if (mappedPatients.length > 0) {
          setPatients(mappedPatients);
        }

        if (Array.isArray(apiAvailability) && apiAvailability.length > 0) {
          setAvailability(availabilityRecordFromApi(apiAvailability));
        }

        setRatingStats({
          average: Number(stats?.average || 0),
          total: Number(stats?.total || 0),
          distribution: Array.isArray(stats?.distribution)
            ? stats.distribution
            : emptyRatingStats.distribution,
          thisMonth: Number(stats?.thisMonth || 0),
          lastMonth: Number(stats?.lastMonth || 0),
        });

        const mappedRatings = Array.isArray(ratingsResponse?.data)
          ? ratingsResponse.data.map((item: any) => ({
              id: item.id,
              user: item.user,
              rating: item.rating,
              comment: item.comment,
              date: toRelativeTime(item.date),
              anonymous: Boolean(item.anonymous),
            }))
          : [];
        setMyRatings(mappedRatings);

        if (Array.isArray(adviceItems)) {
          setPublishedArticles(
            adviceItems.map((item: any) => ({
              id: item._id,
              title: item.title,
              category: item.category,
              publishedAt: toRelativeTime(item.createdAt),
              views: Number(item.viewsCount || 0),
              hasVoiceNote: Boolean(item.voiceUrl),
            })),
          );
        }
      } catch {
        // Keep already loaded values on API errors.
      }
    };

    void loadDashboard();
  }, [doctorRecordId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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
      setUploadedAudio(null);
      setHasRecording(false);
      setIsRecording(true);
      setRecordingTime(0);
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
        const audioBlob = new Blob(recordedChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        if (!audioBlob.size) throw new Error("Empty audio");

        setIsUploadingAudio(true);
        const extension = recorder.mimeType.includes("webm") ? "webm" : "wav";
        const audioFile = new window.File(
          [audioBlob],
          `recording-${Date.now()}.${extension}`,
          {
            type: recorder.mimeType || "audio/webm",
          },
        );

        const audioMeta = await uploadDoctorAdviceAudio(audioFile);
        setUploadedAudio({
          name: audioMeta?.name || audioFile.name,
          size: Number(audioMeta?.size || audioFile.size || 0),
          type: audioMeta?.mimeType || audioFile.type || "audio/webm",
          url: audioMeta?.url || "",
        });
        setHasRecording(true);
      } catch {
        setPageMessage({
          type: "error",
          text: "Failed to save recorded audio. Please try again.",
        });
        setHasRecording(false);
      } finally {
        setIsUploadingAudio(false);
        recordedChunksRef.current = [];
        mediaRecorderRef.current = null;
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
    setUploadedAudio(null);
    recordedChunksRef.current = [];
    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach((track) => track.stop());
      recordingStreamRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const resolveDoctorRecordId = async () => {
    if (doctorRecordId) return doctorRecordId;
    if (!userId) return "";

    try {
      const doctor = await getDoctorByUserId(userId);
      if (doctor?._id) {
        const resolvedId = String(doctor._id);
        setDoctorRecordId(resolvedId);
        return resolvedId;
      }
    } catch {
      // ignore
    }

    return "";
  };

  const handlePublish = async () => {
    const resolvedDoctorId = await resolveDoctorRecordId();
    if (!resolvedDoctorId) {
      setPageMessage({
        type: "error",
        text: "Doctor profile not found. Please sign in with a doctor account linked by admin.",
      });
      return;
    }

    const trimmedTitle = articleData.title.trim();
    const trimmedContent = articleData.content.trim();
    const hasAudio = Boolean(uploadedAudio?.url);
    const hasFiles = uploadedFiles.length > 0;
    const hasText = Boolean(trimmedContent);

    if (!trimmedTitle) {
      setPageMessage({
        type: "error",
        text: "Please add an article title before publishing.",
      });
      return;
    }

    if (!hasText && !hasAudio && !hasFiles) {
      setPageMessage({
        type: "error",
        text: "Add article content, audio, or file attachment before publishing.",
      });
      return;
    }

    const contentType =
      hasAudio && hasText ? "Mixed" : hasAudio ? "VoiceURL" : "Text";
    const finalTextContent = hasText
      ? trimmedContent
      : hasFiles
        ? "See attached files."
        : "";

    setIsPublishing(true);
    try {
      const created = await createDoctorAdvice({
        doctorId: resolvedDoctorId,
        title: trimmedTitle,
        category: articleData.category,
        contentType,
        textContent: finalTextContent,
        voiceUrl: uploadedAudio?.url || "",
        audioDuration: hasAudio ? recordingTime : 0,
        attachments: uploadedFiles.map((file) => ({
          name: file.name,
          url: file.url,
          mimeType: file.type,
          size: file.size,
        })),
        status: "published",
      });

      setPublishedArticles((prev) => [
        {
          id: created?._id || `${Date.now()}`,
          title: created?.title || articleData.title,
          category: created?.category || articleData.category,
          publishedAt: "just now",
          views: Number(created?.viewsCount || 0),
          hasVoiceNote:
            Boolean(created?.voiceUrl) || Boolean(uploadedAudio?.url),
        },
        ...prev,
      ]);
      setDashboardSummary((prev) => ({
        ...prev,
        publishedArticles: prev.publishedArticles + 1,
      }));
      setArticleData({ title: "", category: "Hormones", content: "" });
      setHasRecording(false);
      setRecordingTime(0);
      setUploadedFiles([]);
      setUploadedAudio(null);
      setPageMessage({
        type: "success",
        text: "Article published successfully!",
      });
    } catch (error: any) {
      const apiMessage =
        error?.message ||
        error?.error ||
        error?.response?.data?.message ||
        "Failed to publish article. Please try again.";
      setPageMessage({ type: "error", text: apiMessage });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      const selectedFiles = Array.from(files);
      const uploaded = await uploadDoctorAdviceFiles(selectedFiles);
      const newFiles: {
        name: string;
        size: number;
        type: string;
        url: string;
      }[] = Array.isArray(uploaded)
        ? uploaded.map((file: any) => ({
            name: file.name,
            size: Number(file.size || 0),
            type: file.mimeType || "application/octet-stream",
            url: String(file.url || ""),
          }))
        : [];
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    } catch {
      setPageMessage({
        type: "error",
        text: "Failed to upload files. Please try again.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingAudio(true);
    try {
      const audioMeta = await uploadDoctorAdviceAudio(files[0]);
      setUploadedAudio({
        name: audioMeta?.name || files[0].name,
        size: Number(audioMeta?.size || files[0].size || 0),
        type: audioMeta?.mimeType || files[0].type || "audio/mpeg",
        url: audioMeta?.url || "",
      });
      setHasRecording(true);
      setRecordingTime(0);
    } catch {
      setPageMessage({
        type: "error",
        text: "Failed to upload audio. Please try again.",
      });
    } finally {
      setIsUploadingAudio(false);
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
    }
  };

  const handleOpenEditArticle = async (article: any) => {
    setEditingArticleId(article.id);
    setEditArticleData({
      title: article.title || "",
      category: article.category || "Hormones",
      content: "",
    });
    setIsEditArticleDialogOpen(true);

    if (typeof article.id !== "string") return;

    try {
      const details = await getDoctorAdviceById(article.id);
      setEditArticleData({
        title: details?.title || article.title || "",
        category: details?.category || article.category || "Hormones",
        content: details?.textContent || "",
      });
    } catch {
      // Keep optimistic values if details fetch fails.
    }
  };

  const handleSaveArticleEdit = async () => {
    if (!editingArticleId) return;
    const trimmedTitle = editArticleData.title.trim();

    if (!trimmedTitle) {
      setPageMessage({ type: "error", text: "Article title is required." });
      return;
    }

    setIsSavingArticleEdit(true);
    try {
      if (typeof editingArticleId === "string") {
        const updated = await updateDoctorAdvice(editingArticleId, {
          title: trimmedTitle,
          category: editArticleData.category,
          textContent: editArticleData.content,
        });

        setPublishedArticles((prev) =>
          prev.map((item: any) =>
            item.id === editingArticleId
              ? {
                  ...item,
                  title: updated?.title || trimmedTitle,
                  category: updated?.category || editArticleData.category,
                  hasVoiceNote: Boolean(updated?.voiceUrl) || item.hasVoiceNote,
                }
              : item,
          ),
        );
      } else {
        setPublishedArticles((prev) =>
          prev.map((item: any) =>
            item.id === editingArticleId
              ? {
                  ...item,
                  title: trimmedTitle,
                  category: editArticleData.category,
                }
              : item,
          ),
        );
      }

      setIsEditArticleDialogOpen(false);
      setEditingArticleId(null);
      setPageMessage({
        type: "success",
        text: "Article updated successfully!",
      });
    } catch {
      setPageMessage({
        type: "error",
        text: "Failed to update article. Please try again.",
      });
    } finally {
      setIsSavingArticleEdit(false);
    }
  };

  const handleDeletePublishedArticle = async (articleId: string | number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this article?",
    );
    if (!confirmed) return;

    setDeletingArticleId(articleId);
    try {
      if (typeof articleId === "string") {
        await deleteDoctorAdvice(articleId);
      }

      setPublishedArticles((prev) =>
        prev.filter((item: any) => item.id !== articleId),
      );
      setDashboardSummary((prev) => ({
        ...prev,
        publishedArticles: Math.max(0, prev.publishedArticles - 1),
      }));
      setPageMessage({
        type: "success",
        text: "Article deleted successfully!",
      });
    } catch {
      setPageMessage({
        type: "error",
        text: "Failed to delete article. Please try again.",
      });
    } finally {
      setDeletingArticleId(null);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return FileImage;
    if (type.includes("pdf")) return FileType;
    return File;
  };

  const handleSendMessage = async (type: "text" | "voice") => {
    if (!selectedPatient || !doctorRecordId || !userId) return;

    try {
      const chat = await getOrCreateDoctorChat({
        doctorId: doctorRecordId,
        userId: String(selectedPatient.id),
      });
      if (!chat?._id) throw new Error("Unable to create/find chat");

      if (type === "text" && messageToSend.trim()) {
        await sendMessage({
          chatId: chat._id,
          senderId: userId,
          senderRole: "Doctor",
          messageType: "text",
          messageText: messageToSend,
        });
        setPageMessage({
          type: "success",
          text: `Message sent to ${selectedPatient.username}`,
        });
        setMessageToSend("");
      } else if (type === "voice" && hasRecording) {
        await sendMessage({
          chatId: chat._id,
          senderId: userId,
          senderRole: "Doctor",
          messageType: "voice",
          voiceUrl: "local://voice-note",
          durationSec: recordingTime,
        });
        setPageMessage({
          type: "success",
          text: `Insight sent to ${selectedPatient.username}`,
        });
        setHasRecording(false);
        setRecordingTime(0);
        setSendingVoiceNote(false);
      }
    } catch {
      setPageMessage({
        type: "error",
        text: "Failed to send message. Please try again.",
      });
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleDayEnabled = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
        slots: !prev[day].enabled
          ? [{ start: "09:00", end: "17:00" }]
          : prev[day].slots,
      },
    }));
  };

  const addTimeSlot = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { start: "09:00", end: "17:00" }],
      },
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== index),
      },
    }));
  };

  const updateTimeSlot = (
    day: string,
    index: number,
    field: "start" | "end",
    value: string,
  ) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot,
        ),
      },
    }));
  };

  const handleSaveAvailability = () => {
    setIsSavingAvailability(true);
    // Simulate API call
    setTimeout(() => {
      setIsSavingAvailability(false);
      alert("Availability saved successfully!");
    }, 1000);
  };

  const getTotalHours = () => {
    let total = 0;
    Object.values(availability).forEach((day) => {
      if (day.enabled) {
        day.slots.forEach((slot) => {
          const start =
            parseInt(slot.start.split(":")[0]) +
            parseInt(slot.start.split(":")[1]) / 60;
          const end =
            parseInt(slot.end.split(":")[0]) +
            parseInt(slot.end.split(":")[1]) / 60;
          total += end - start;
        });
      }
    });
    return total.toFixed(1);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
          Doctor Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your patients and create educational content
        </p>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-primary/10 p-2">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-semibold">
                {dashboardSummary.patients}
              </p>
              <p className="text-xs text-muted-foreground">Patients</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-secondary/30 p-2">
              <MessageSquare className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold">
                {dashboardSummary.unreadMessages}
              </p>
              <p className="text-xs text-muted-foreground">Unread</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-muted p-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold">
                {dashboardSummary.publishedArticles}
              </p>
              <p className="text-xs text-muted-foreground">Articles</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-primary/10 p-2">
              <Star className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <p className="text-xl font-semibold">
                  {dashboardSummary.ratingAverage || ratingStats.average}
                </p>
                <Star className="h-3 w-3 fill-primary text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardSummary.ratingTotal || ratingStats.total} reviews
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patients" className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-2xl">
          <TabsTrigger value="patients" className="gap-2">
            <Users className="h-4 w-4" />
            Patients
          </TabsTrigger>
          <TabsTrigger value="availability" className="gap-2">
            <Calendar className="h-4 w-4" />
            Availability
          </TabsTrigger>
          <TabsTrigger value="ratings" className="gap-2">
            <Star className="h-4 w-4" />
            My Ratings
          </TabsTrigger>
          <TabsTrigger value="create" className="gap-2">
            <FileText className="h-4 w-4" />
            Info
          </TabsTrigger>
          <TabsTrigger value="published" className="gap-2">
            <Eye className="h-4 w-4" />
            Published
          </TabsTrigger>
        </TabsList>

        {/* Patients Tab */}
        <TabsContent value="patients" className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <Card
                key={patient.id}
                className="overflow-hidden transition-all hover:shadow-md"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-border">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {patient.avatar}
                          </AvatarFallback>
                        </Avatar>
                        {patient.status === "active" && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {patient.username}
                          </span>
                          <Badge
                            variant={
                              patient.tier === "premium" ? "default" : "outline"
                            }
                            className="h-5 text-[10px]"
                          >
                            {patient.tier}
                          </Badge>
                          {patient.unreadMessages > 0 && (
                            <Badge
                              variant="destructive"
                              className="h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center"
                            >
                              {patient.unreadMessages}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {patient.lastVisit}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {patient.consultations} consultations
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPatient(patient)}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Message
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>
                              Send Message to {patient.username}
                            </DialogTitle>
                            <DialogDescription>
                              Send a text message or insight to your patient
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Tabs defaultValue="text" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="text">
                                  Text Message
                                </TabsTrigger>
                                <TabsTrigger
                                  value="voice"
                                  onClick={() => setSendingVoiceNote(true)}
                                >
                                  Insight
                                </TabsTrigger>
                              </TabsList>
                              <TabsContent value="text" className="mt-4">
                                <Textarea
                                  placeholder="Type your message..."
                                  rows={4}
                                  value={messageToSend}
                                  onChange={(e) =>
                                    setMessageToSend(e.target.value)
                                  }
                                />
                              </TabsContent>
                              <TabsContent value="voice" className="mt-4">
                                <div className="flex flex-col items-center gap-4 rounded-xl bg-muted/50 p-6">
                                  {!hasRecording ? (
                                    <>
                                      {isRecording ? (
                                        <div className="flex flex-col items-center gap-4">
                                          <div className="relative">
                                            <div className="h-16 w-16 animate-pulse rounded-full bg-destructive/20" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                              <MicOff className="h-6 w-6 text-destructive" />
                                            </div>
                                          </div>
                                          <div className="text-center">
                                            <p className="text-xl font-mono font-semibold">
                                              {formatTime(recordingTime)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              Recording...
                                            </p>
                                          </div>
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={stopRecording}
                                          >
                                            <Square className="mr-2 h-4 w-4" />
                                            Stop
                                          </Button>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                            <Mic className="h-6 w-6 text-primary" />
                                          </div>
                                          <Button
                                            onClick={startRecording}
                                            size="sm"
                                          >
                                            <Mic className="mr-2 h-4 w-4" />
                                            Start Recording
                                          </Button>
                                        </>
                                      )}
                                    </>
                                  ) : (
                                    <div className="flex flex-col items-center gap-3">
                                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/30">
                                        <Check className="h-6 w-6 text-secondary-foreground" />
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        Duration: {formatTime(recordingTime)}
                                      </p>
                                      <div className="flex gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            setIsPlaying(!isPlaying)
                                          }
                                        >
                                          {isPlaying ? (
                                            <PauseCircle className="mr-2 h-4 w-4" />
                                          ) : (
                                            <PlayCircle className="mr-2 h-4 w-4" />
                                          )}
                                          {isPlaying ? "Pause" : "Preview"}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={deleteRecording}
                                          className="text-destructive"
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </TabsContent>
                            </Tabs>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() =>
                                handleSendMessage(
                                  sendingVoiceNote && hasRecording
                                    ? "voice"
                                    : "text",
                                )
                              }
                              disabled={!messageToSend.trim() && !hasRecording}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Send
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No patients found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery
                  ? "Try a different search term"
                  : "Your patients will appear here"}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Set Your Availability</CardTitle>
                  <CardDescription>
                    Define when you are available for consultations
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {getTotalHours()}h
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total weekly hours
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {daysOfWeek.map((day) => (
                <div key={day} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={availability[day]?.enabled || false}
                        onCheckedChange={() => toggleDayEnabled(day)}
                      />
                      <span
                        className={cn(
                          "font-medium",
                          !availability[day]?.enabled &&
                            "text-muted-foreground",
                        )}
                      >
                        {day}
                      </span>
                    </div>
                    {availability[day]?.enabled && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addTimeSlot(day)}
                        className="gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Slot
                      </Button>
                    )}
                  </div>

                  {availability[day]?.enabled &&
                    availability[day].slots.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {availability[day].slots.map((slot, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="flex items-center gap-2 flex-1">
                              <select
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={slot.start}
                                onChange={(e) =>
                                  updateTimeSlot(
                                    day,
                                    index,
                                    "start",
                                    e.target.value,
                                  )
                                }
                              >
                                {timeSlots.map((time) => (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                              <span className="text-muted-foreground">to</span>
                              <select
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={slot.end}
                                onChange={(e) =>
                                  updateTimeSlot(
                                    day,
                                    index,
                                    "end",
                                    e.target.value,
                                  )
                                }
                              >
                                {timeSlots.map((time) => (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {availability[day].slots.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => removeTimeSlot(day, index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                  {availability[day]?.enabled &&
                    availability[day].slots.length === 0 && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        No time slots added. Click &quot;Add Slot&quot; to set
                        your hours.
                      </p>
                    )}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveAvailability}
              disabled={isSavingAvailability}
            >
              {isSavingAvailability ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Availability
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Ratings Tab */}
        <TabsContent value="ratings" className="mt-6 space-y-6">
          {/* Rating Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">
                      {ratingStats.average}
                    </span>
                    <span className="text-2xl text-muted-foreground">/5</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-5 w-5",
                          i < Math.floor(ratingStats.average)
                            ? "fill-secondary-foreground text-secondary-foreground"
                            : "text-muted",
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Based on {ratingStats.total} reviews
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-secondary-foreground" />
                    <span className="text-secondary-foreground font-medium">
                      +{ratingStats.thisMonth - ratingStats.lastMonth} reviews
                      this month
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ratingStats.distribution.map((item) => (
                  <div key={item.stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm font-medium">{item.stars}</span>
                      <Star className="h-3 w-3 fill-secondary-foreground text-secondary-foreground" />
                    </div>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-secondary-foreground rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Reviews */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <ThumbsUp className="h-5 w-5 text-primary" />
                Recent Reviews
              </h2>
              <Badge variant="outline" className="gap-1">
                {ratingStats.thisMonth} this month
              </Badge>
            </div>

            <div className="space-y-3">
              {myRatings.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback
                            className={cn(
                              "text-sm",
                              review.anonymous
                                ? "bg-muted"
                                : "bg-primary/10 text-primary",
                            )}
                          >
                            {review.anonymous
                              ? "?"
                              : review.user.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{review.user}</p>
                          <p className="text-xs text-muted-foreground">
                            {review.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < review.rating
                                ? "fill-secondary-foreground text-secondary-foreground"
                                : "text-muted",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {myRatings.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No ratings yet.
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="text-center">
              <Button variant="outline" className="gap-2">
                View All Reviews
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Create Content Tab */}
        <TabsContent value="create" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>New Article</CardTitle>
              <CardDescription>
                Write educational content for the Knowledge Hub
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Article Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter article title..."
                    value={articleData.title}
                    onChange={(e) =>
                      setArticleData({ ...articleData, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={articleData.category}
                    onChange={(e) =>
                      setArticleData({
                        ...articleData,
                        category: e.target.value,
                      })
                    }
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your article content here..."
                  rows={10}
                  value={articleData.content}
                  onChange={(e) =>
                    setArticleData({ ...articleData, content: e.target.value })
                  }
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* File Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Files
              </CardTitle>
              <CardDescription>
                Upload documents, PDFs, or images to include with your article
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Drop zone / Upload button */}
              <div
                className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 transition-colors hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Upload className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Uploading...
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Click to upload files</p>
                      <p className="text-sm text-muted-foreground">
                        PDF, DOC, DOCX, PNG, JPG, or GIF (max 10MB)
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Uploaded files list */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files ({uploadedFiles.length})</Label>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => {
                      const FileIcon = getFileIcon(file.type);
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                              <FileIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium truncate max-w-[200px]">
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" />
                Insight
              </CardTitle>
              <CardDescription>
                Record or upload an audio summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4 rounded-xl bg-muted/50 p-6">
                {!hasRecording ? (
                  <>
                    {isRecording ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="h-20 w-20 animate-pulse rounded-full bg-destructive/20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <MicOff className="h-8 w-8 text-destructive" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-mono font-semibold">
                            {formatTime(recordingTime)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Recording...
                          </p>
                        </div>
                        <Button variant="destructive" onClick={stopRecording}>
                          <Square className="mr-2 h-4 w-4" />
                          Stop Recording
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                          <Mic className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button onClick={startRecording} className="gap-2">
                            <Mic className="h-4 w-4" />
                            Start Recording
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => audioInputRef.current?.click()}
                            disabled={isUploadingAudio}
                          >
                            <Upload className="h-4 w-4" />
                            {isUploadingAudio ? "Uploading..." : "Upload Audio"}
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex w-full flex-col items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/30">
                      <Check className="h-8 w-8 text-secondary-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Insight recorded</p>
                      <p className="text-sm text-muted-foreground">
                        Duration: {formatTime(recordingTime)}
                      </p>
                      {uploadedAudio?.name && (
                        <p className="text-xs text-muted-foreground">
                          {uploadedAudio.name}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? (
                          <PauseCircle className="mr-2 h-4 w-4" />
                        ) : (
                          <PlayCircle className="mr-2 h-4 w-4" />
                        )}
                        {isPlaying ? "Pause" : "Preview"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={deleteRecording}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button
              onClick={handlePublish}
              disabled={!articleData.title.trim() || isPublishing}
            >
              <Check className="mr-2 h-4 w-4" />
              {isPublishing ? "Publishing..." : "Publish Article"}
            </Button>
          </div>
        </TabsContent>

        {/* Published Tab */}
        <TabsContent value="published" className="mt-6 space-y-4">
          {publishedArticles.map((article) => (
            <Card key={article.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{article.title}</h3>
                      {article.hasVoiceNote && (
                        <Badge variant="secondary" className="gap-1">
                          <Mic className="h-3 w-3" />
                          Voice
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Badge variant="outline">{article.category}</Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.publishedAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views} views
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditArticle(article)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeletePublishedArticle(article.id)}
                      disabled={deletingArticleId === article.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog
        open={isEditArticleDialogOpen}
        onOpenChange={setIsEditArticleDialogOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
            <DialogDescription>
              Update article details and save changes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-article-title">Title</Label>
              <Input
                id="edit-article-title"
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
              <Label htmlFor="edit-article-category">Category</Label>
              <select
                id="edit-article-category"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editArticleData.category}
                onChange={(e) =>
                  setEditArticleData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-article-content">Content</Label>
              <Textarea
                id="edit-article-content"
                rows={8}
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

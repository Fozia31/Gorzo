"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { getDoctorChatQueue } from "@/api/chatApi"
import { getDoctorByUserId } from "@/api/doctorApi"
import { getMessagesByChat, markChatMessagesRead, sendMessage } from "@/api/messageApi"
import { 
  MessageCircle,
  Send,
  Clock,
  Crown,
  Search,
  ArrowLeft,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"

type QueueChatItem = {
  id: string | number
  chatId?: string
  username: string
  avatar?: string
  lastMessage: string
  lastMessageTime: string
  unread: number
  priority: "high" | "normal"
}

type ChatMessage = {
  id: string | number
  sender: "user" | "doctor"
  content: string
  time: string
  messageType?: "text" | "voice"
  voiceUrl?: string
}

const buildAvatar = (username: string) => {
  const parts = username.trim().split(" ").filter(Boolean)
  if (parts.length === 0) return "U"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

// Fallback sample chat queue
const sampleChatQueue: QueueChatItem[] = [
  {
    id: 1,
    username: "WellnessSeeker",
    avatar: "WS",
    lastMessage: "Hello Dr. Amara, I've been experiencing irregular cycles for the past 3 months.",
    lastMessageTime: "2h ago",
    unread: 2,
    priority: "high",
  },
  {
    id: 2,
    username: "BloomingFlower",
    avatar: "BF",
    lastMessage: "Thank you for your response. I have another question about...",
    lastMessageTime: "5h ago",
    unread: 1,
    priority: "normal",
  },
  {
    id: 3,
    username: "HopefulMama",
    avatar: "HM",
    lastMessage: "The supplements you recommended are working great!",
    lastMessageTime: "1d ago",
    unread: 0,
    priority: "normal",
  },
  {
    id: 4,
    username: "StrongSister",
    avatar: "SS",
    lastMessage: "I'm feeling much better after following your advice.",
    lastMessageTime: "2d ago",
    unread: 0,
    priority: "normal",
  },
]

function ChatView({
  chat,
  messages,
  onBack,
  onSend,
  isSending,
}: {
  chat: QueueChatItem
  messages: ChatMessage[]
  onBack: () => void
  onSend: (text: string) => Promise<void>
  isSending: boolean
}) {
  const [message, setMessage] = useState("")

  const handleSend = async () => {
    if (message.trim() && !isSending) {
      await onSend(message.trim())
      setMessage("")
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-border p-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary">
            {chat.avatar}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{chat.username}</h3>
            <Crown className="h-3 w-3 text-secondary-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">Premium Member</p>
        </div>
        <Badge variant={chat.priority === "high" ? "default" : "secondary"}>
          {chat.priority === "high" ? "Priority" : "Normal"}
        </Badge>
      </div>

      {/* Privacy Notice */}
      <div className="border-b border-border px-4 py-2 bg-muted/30">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Chat history is managed by the patient for their privacy
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex", msg.sender === "doctor" ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-2",
              msg.sender === "doctor" 
                ? "bg-primary text-primary-foreground rounded-br-sm" 
                : "bg-muted rounded-bl-sm"
            )}>
              <p className="text-sm">{msg.content}</p>
              <p className={cn(
                "mt-1 text-[10px]",
                msg.sender === "doctor" ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type your response..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handleSend()}
            className="flex-1"
            disabled={isSending}
          />
          <Button onClick={() => void handleSend()} disabled={!message.trim() || isSending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function DoctorChatsPage() {
  const { user } = useAuth()
  const userId = user?.id
  const [doctorRecordId, setDoctorRecordId] = useState<string>("")
  const [chatQueue, setChatQueue] = useState<QueueChatItem[]>(sampleChatQueue)
  const [selectedChat, setSelectedChat] = useState<QueueChatItem | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoadingQueue, setIsLoadingQueue] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadDoctorRecordId = async () => {
      if (!userId) return
      try {
        const doctor = await getDoctorByUserId(userId)
        if (doctor?._id) setDoctorRecordId(String(doctor._id))
      } catch {
        setDoctorRecordId("")
      }
    }

    void loadDoctorRecordId()
  }, [userId])

  useEffect(() => {
    const loadQueue = async () => {
      if (!doctorRecordId) return
      setIsLoadingQueue(true)
      try {
        const queue = await getDoctorChatQueue(doctorRecordId)
        if (Array.isArray(queue) && queue.length > 0) {
          setChatQueue(
            queue.map((item) => ({
              id: item.id,
              chatId: item.chatId,
              username: item.username,
              avatar: buildAvatar(item.username),
              lastMessage: item.lastMessage || "",
              lastMessageTime: item.lastMessageTime || "N/A",
              unread: Number(item.unread || 0),
              priority: item.priority === "high" ? "high" : "normal",
            }))
          )
        } else {
          setChatQueue([])
        }
      } catch {
        setChatQueue(sampleChatQueue)
      } finally {
        setIsLoadingQueue(false)
      }
    }

    void loadQueue()
  }, [doctorRecordId])

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat?.chatId) {
        setMessages([])
        return
      }

      setIsLoadingMessages(true)
      try {
        const response = await getMessagesByChat(selectedChat.chatId)
        const data = Array.isArray(response?.data) ? response.data : []

        const mapped = data.map((item: any) => ({
          id: item._id,
          sender: item.senderRole === "Doctor" ? "doctor" : "user",
          content: item.messageType === "voice" ? "Voice note" : item.messageText,
          time: new Date(item.createdAt).toLocaleString(),
          messageType: item.messageType,
          voiceUrl: item.voiceUrl,
        }))
        setMessages(mapped)
        await markChatMessagesRead(selectedChat.chatId, "Doctor")
      } catch {
        setMessages([])
      } finally {
        setIsLoadingMessages(false)
      }
    }

    void loadMessages()
  }, [selectedChat])

  const filteredChats = useMemo(
    () => chatQueue.filter((chat) => chat.username.toLowerCase().includes(searchQuery.toLowerCase())),
    [chatQueue, searchQuery]
  )

  const pendingChats = filteredChats.filter(c => c.unread > 0)
  const resolvedChats = filteredChats.filter(c => c.unread === 0)

  const handleSendMessage = async (text: string) => {
    if (!selectedChat?.chatId || !userId) return

    setIsSending(true)
    try {
      const sent = await sendMessage({
        chatId: selectedChat.chatId,
        senderId: userId,
        senderRole: "Doctor",
        messageType: "text",
        messageText: text,
      })

      setMessages((prev) => [
        ...prev,
        {
          id: sent?._id || `${Date.now()}`,
          sender: "doctor",
          content: text,
          time: sent?.createdAt ? new Date(sent.createdAt).toLocaleString() : "Just now",
          messageType: "text",
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  if (selectedChat) {
    return (
      <ChatView
        chat={selectedChat}
        messages={isLoadingMessages ? [] : messages}
        onBack={() => setSelectedChat(null)}
        onSend={handleSendMessage}
        isSending={isSending}
      />
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
          Premium Chat Queue
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Private consultations with premium members
        </p>
      </div>

      {isLoadingQueue && (
        <p className="text-sm text-muted-foreground">Loading conversations...</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-primary/10 p-2">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-semibold">{pendingChats.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-secondary/30 p-2">
              <Clock className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold">-</p>
              <p className="text-xs text-muted-foreground">Avg Response</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-muted p-2">
              <Crown className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold">{chatQueue.length}</p>
              <p className="text-xs text-muted-foreground">Total Chats</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Pending Messages */}
      {pendingChats.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Needs Response ({pendingChats.length})
          </h2>
          {pendingChats.map((chat) => (
            <Card 
              key={chat.id} 
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                chat.priority === "high" && "border-primary/30"
              )}
              onClick={() => setSelectedChat(chat)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {chat.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{chat.username}</h3>
                        <Crown className="h-3 w-3 text-secondary-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{chat.lastMessageTime}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <Badge className="shrink-0">{chat.unread}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resolved Chats */}
      {resolvedChats.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Recent Conversations
          </h2>
          {resolvedChats.map((chat) => (
            <Card 
              key={chat.id} 
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => setSelectedChat(chat)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {chat.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{chat.username}</h3>
                        <Crown className="h-3 w-3 text-secondary-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{chat.lastMessageTime}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredChats.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">No conversations found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery ? "Try a different search term" : "You're all caught up!"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

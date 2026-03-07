"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Flag,
  FileText,
  Trash2,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { deletePost, getModerationQueuePosts } from "@/api/postApi"

type QueuePost = {
  _id: string
  title: string
  content: string
  reports: number
  createdAt: string
  userId?: { displayName?: string } | string
}

type ModerationItem = {
  id: string
  postId: string
  type: "post"
  content: string
  author: string
  authorAvatar: string
  reportedBy: string
  reason: string
  reportedAt: string
  status: "pending" | "resolved"
  resolution?: "deleted" | "ignored"
  context: string
  reportsCount: number
}

const REPORT_THRESHOLD = 5

export default function ModerationPage() {
  const [reports, setReports] = useState<ModerationItem[]>([])
  const [selectedReport, setSelectedReport] = useState<ModerationItem | null>(null)
  const [actionType, setActionType] = useState<"delete" | "ignore" | null>(null)
  const [filter, setFilter] = useState("pending")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const pendingReports = reports.filter((r) => r.status === "pending")
  const resolvedReports = reports.filter((r) => r.status === "resolved")

  useEffect(() => {
    const loadQueue = async () => {
      try {
        setIsLoading(true)
        setErrorMessage("")
        const items = await getModerationQueuePosts({ threshold: REPORT_THRESHOLD })
        const mapped: ModerationItem[] = (items || []).map((post: QueuePost) => {
          const authorName =
            typeof post.userId === "object" && post.userId?.displayName
              ? post.userId.displayName
              : "Anonymous"

          return {
            id: post._id,
            postId: post._id,
            type: "post",
            content: post.title,
            author: authorName,
            authorAvatar: authorName.slice(0, 2).toUpperCase(),
            reportedBy: "System",
            reason: "Reported by community members",
            reportedAt: new Date(post.createdAt).toLocaleString(),
            status: "pending",
            context: post.content,
            reportsCount: post.reports || 0,
          }
        })
        setReports(mapped)
      } catch (error: any) {
        setErrorMessage(error?.message || "Failed to load moderation queue")
      } finally {
        setIsLoading(false)
      }
    }

    loadQueue()
  }, [])

  const handleAction = async (action: "delete" | "ignore") => {
    if (!selectedReport) return

    try {
      if (action === "delete") {
        await deletePost(selectedReport.postId)
      }

      setReports((prev) =>
        prev.map((r) => {
          if (r.id === selectedReport.id) {
            return {
              ...r,
              status: "resolved",
              resolution: action === "delete" ? "deleted" : "ignored",
            }
          }
          return r
        })
      )
    } catch (error: any) {
      alert(error?.message || "Failed to apply moderation action")
    } finally {
      setSelectedReport(null)
      setActionType(null)
    }
  }

  const openActionDialog = (report: ModerationItem, action: "delete" | "ignore") => {
    setSelectedReport(report)
    setActionType(action)
  }

  const filteredReports = filter === "pending" ? pendingReports : resolvedReports

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
          Moderation Queue
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and moderate reported content
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-destructive/10 p-2">
              <Flag className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-xl font-semibold">{pendingReports.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-secondary/30 p-2">
              <CheckCircle className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold">{resolvedReports.length}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-muted p-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold">2h</p>
              <p className="text-xs text-muted-foreground">Avg Response</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Pending ({pendingReports.length})
          </TabsTrigger>
          <TabsTrigger value="resolved" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Resolved
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6 space-y-4">
          {isLoading && (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Loading moderation queue...
              </CardContent>
            </Card>
          )}

          {!isLoading && errorMessage && (
            <Card className="border-destructive/30">
              <CardContent className="py-10 text-center text-sm text-destructive">
                {errorMessage}
              </CardContent>
            </Card>
          )}

          {!isLoading && !errorMessage && (
            filteredReports.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Flag className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium">
                    {filter === "pending" ? "No pending reports" : "No resolved reports"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {filter === "pending" ? "You're all caught up!" : "Resolved reports will appear here"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredReports.map((report) => (
                <Card
                  key={report.id}
                  className={cn(
                    "overflow-hidden",
                    report.status === "pending" && "border-destructive/30"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Report Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {report.type}
                              </Badge>
                              <Badge
                                variant={report.status === "pending" ? "destructive" : "secondary"}
                                className="text-xs"
                              >
                                {report.status === "resolved"
                                  ? (report as any).resolution === "deleted" ? "Deleted" : "Ignored"
                                  : "Pending"
                                }
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Reported {report.reportedAt}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Total reports: <span className="font-medium text-foreground">{report.reportsCount}</span>
                            </p>
                          </div>
                        </div>
                        {report.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openActionDialog(report, "ignore")}
                            >
                              <EyeOff className="mr-2 h-4 w-4" />
                              Ignore
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openActionDialog(report, "delete")}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Content Preview */}
                      <div className="rounded-lg bg-muted/50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary/10 text-xs text-primary">
                              {report.authorAvatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{report.author}</span>
                        </div>
                        <p className="text-sm text-foreground">{report.context}</p>
                      </div>

                      {/* Report Details */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Flag className="h-4 w-4 text-destructive" />
                          <span>Reason: <span className="font-medium text-foreground">{report.reason}</span></span>
                        </div>
                        <div className="text-muted-foreground">
                          Reported by: <span className="font-medium text-foreground">{report.reportedBy}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <AlertDialog open={!!actionType} onOpenChange={() => { setActionType(null); setSelectedReport(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "delete" ? "Delete this content?" : "Ignore this report?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "delete" 
                ? "This will permanently remove the content from the platform. The author will be notified."
                : "This will dismiss the report. The content will remain visible on the platform."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction(actionType!)}
              className={actionType === "delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {actionType === "delete" ? "Delete Content" : "Ignore Report"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

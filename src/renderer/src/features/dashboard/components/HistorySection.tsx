import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, X, Pencil, Trash2, Loader2, Calendar as CalendarIcon, History } from "lucide-react"
import { getSessions, updateSessionComment, deleteSession, deleteSessions, type Session } from "@lib/supabase/database"
import { formatSecondsToHuman } from "@lib/time"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function HistorySection() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filterCategory, setFilterCategory] = useState("all")
    const [filterDate, setFilterDate] = useState("all")
    const [dateRange, setDateRange] = useState<DateRange | undefined>()

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingComment, setEditingComment] = useState("")
    
    // Selection state
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    
    // Delete state
    const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null)
    const [isBulkDeleting, setIsBulkDeleting] = useState(false)
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)

    useEffect(() => {
        fetchSessions()
    }, [])

    const fetchSessions = async () => {
        try {
            setIsLoading(true)
            const data = await getSessions()
            setSessions(data || [])
            setSelectedIds([]) // Reset selection on refresh
        } catch (err) {
            console.error("Failed to fetch sessions:", err)
            toast.error("Failed to load sessions")
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateComment = async (id: string) => {
        try {
            await updateSessionComment(id, editingComment)
            setEditingId(null)
            toast.success("Comment updated")
            // Optimistic update or refetch
            setSessions(prev => prev.map(s => s.id === id ? { ...s, comment: editingComment } : s))
        } catch (err) {
            console.error("Failed to update comment:", err)
            toast.error("Failed to update comment")
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteSession(id)
            setSessions(prev => prev.filter(s => s.id !== id))
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id))
            toast.success("Session deleted")
        } catch (err) {
            console.error("Failed to delete session:", err)
            toast.error("Failed to delete session")
        } finally {
            setSessionToDelete(null)
        }
    }

    const handleBulkDelete = async () => {
        setIsBulkDeleting(true)
        try {
            await deleteSessions(selectedIds)
            setSessions(prev => prev.filter(s => !selectedIds.includes(s.id)))
            toast.success(`${selectedIds.length} sessions deleted`)
            setSelectedIds([])
        } catch (err) {
            console.error("Failed to bulk delete:", err)
            toast.error("Failed to delete sessions")
        } finally {
            setIsBulkDeleting(false)
            setShowBulkDeleteConfirm(false)
        }
    }

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = (filteredIds: string[]) => {
        if (selectedIds.length === filteredIds.length && filteredIds.every(id => selectedIds.includes(id))) {
            setSelectedIds([])
        } else {
            setSelectedIds(filteredIds)
        }
    }

    // Filter logic
    const uniqueCategories = Array.from(new Set(sessions.map(s => s.Category?.name).filter(Boolean)))

    const isDateInFilter = (dateString: string, filter: string) => {
        if (filter === "all") return true

        const date = new Date(dateString)
        const now = new Date()

        if (filter === "custom") {
            if (!dateRange?.from) return true
            const from = new Date(dateRange.from)
            from.setHours(0, 0, 0, 0)

            const to = dateRange.to ? new Date(dateRange.to) : new Date(from)
            to.setHours(23, 59, 59, 999)

            return date.getTime() >= from.getTime() && date.getTime() <= to.getTime()
        }

        if (filter === "today") {
            return date.getDate() === now.getDate() &&
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear()
        }

        if (filter === "week") {
            const day = now.getDay() || 7
            const startOfWeek = new Date(now)
            startOfWeek.setHours(-24 * (day - 1), 0, 0, 0)
            return date.getTime() >= startOfWeek.getTime()
        }

        if (filter === "month") {
            return date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear()
        }

        return true
    }

    const filteredSessions = sessions.filter(s => {
        const matchesCategory = filterCategory === "all" || s.Category?.name === filterCategory
        const matchesDate = isDateInFilter(s.created_at, filterDate)
        return matchesCategory && matchesDate
    })

    const filteredIds = filteredSessions.map(s => s.id)
    const isAllSelected = filteredIds.length > 0 && filteredIds.every(id => selectedIds.includes(id))

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "dd/MM/yyyy HH:mm")
    }

    const getDifferenceColor = (diff: number) => {
        if (diff > 0) return "text-red-600"
        if (diff < 0) return "text-green-600"
        return "text-zinc-600"
    }

    return (
        <div className="space-y-6">
            <Card className="border-zinc-200 shadow-none bg-white">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-zinc-100 p-2 rounded-lg">
                                <History className="w-5 h-5 text-zinc-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-zinc-900">Session History</h2>
                                <p className="text-xs text-zinc-500">Track and manage your past productivity sessions</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            {selectedIds.length > 0 && (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-100 px-2 py-1 rounded-md border border-zinc-200">
                                        {selectedIds.length} Selected
                                    </span>
                                    <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        className="h-9 px-4 text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                                        onClick={() => setShowBulkDeleteConfirm(true)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                                        Delete Sessions
                                    </Button>
                                    <div className="w-px h-6 bg-zinc-200 mx-1" />
                                </div>
                            )}

                            <Select
                                value={filterDate}
                                onValueChange={(val) => {
                                    setFilterDate(val)
                                    if (val !== 'custom') setDateRange(undefined)
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs">
                                    <SelectValue placeholder="Date Range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="week">This Week</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                    <SelectItem value="custom">Custom Range</SelectItem>
                                </SelectContent>
                            </Select>

                            {filterDate === 'custom' && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                                "h-9 text-xs justify-start text-left font-normal w-full sm:w-[220px]",
                                                !dateRange && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                            {dateRange?.from ? (
                                                dateRange.to ? (
                                                    <>{format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd, y")}</>
                                                ) : (
                                                    format(dateRange.from, "LLL dd, y")
                                                )
                                            ) : (
                                                <span>Pick a range</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={dateRange?.from}
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            numberOfMonths={2}
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}

                            <Select
                                value={filterCategory}
                                onValueChange={setFilterCategory}
                            >
                                <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {uniqueCategories.map((cat) => (
                                        <SelectItem key={cat as string} value={cat as string}>
                                            {cat as string}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
                            <p className="text-sm text-zinc-400 font-medium">Retrieving sessions...</p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-zinc-100 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-zinc-50/50">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[40px]">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                                                checked={isAllSelected}
                                                onChange={() => toggleSelectAll(filteredIds)}
                                            />
                                        </TableHead>
                                        <TableHead className="w-[160px] text-xs font-bold uppercase tracking-wider text-zinc-500">Date</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">Category</TableHead>
                                        <TableHead className="w-[120px] text-xs font-bold uppercase tracking-wider text-zinc-500">Duration</TableHead>
                                        <TableHead className="w-[120px] text-xs font-bold uppercase tracking-wider text-zinc-500">Target</TableHead>
                                        <TableHead className="w-[120px] text-xs font-bold uppercase tracking-wider text-zinc-500">Diff</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">Comment</TableHead>
                                        <TableHead className="w-[80px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSessions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center text-zinc-400 py-20 font-medium italic">
                                                No productivity sessions found for the current filters.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredSessions.map((session) => {
                                            const hasTarget = session.Category?.target_time !== null && session.Category?.target_time !== undefined
                                            const targetSeconds = hasTarget ? session.Category!.target_time! : 0
                                            const difference = session.duration - targetSeconds
                                            const isEditing = editingId === session.id
                                            const isSelected = selectedIds.includes(session.id)

                                            return (
                                                <TableRow key={session.id} className={cn(
                                                    "hover:bg-zinc-50/30 transition-colors group",
                                                    isSelected && "bg-blue-50/30 hover:bg-blue-50/50"
                                                )}>
                                                    <TableCell>
                                                        <input 
                                                            type="checkbox" 
                                                            className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                                                            checked={isSelected}
                                                            onChange={() => toggleSelection(session.id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium text-zinc-600">
                                                        {formatDate(session.created_at)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-bold text-zinc-600 ring-1 ring-inset ring-zinc-200/50">
                                                            {session.Category?.name || 'Uncategorized'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="font-bold text-zinc-900">
                                                        {formatSecondsToHuman(session.duration)}
                                                    </TableCell>
                                                    <TableCell className="text-zinc-400 font-medium">
                                                        {hasTarget ? formatSecondsToHuman(session.Category!.target_time!) : "--"}
                                                    </TableCell>
                                                    <TableCell className={cn("font-bold", hasTarget ? getDifferenceColor(difference) : "text-zinc-300")}>
                                                        {hasTarget ? (
                                                            <div className="flex items-center">
                                                                {difference > 0 ? "+" : ""}
                                                                {formatSecondsToHuman(Math.abs(difference))}
                                                            </div>
                                                        ) : "--"}
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px]">
                                                        {isEditing ? (
                                                            <Input
                                                                value={editingComment}
                                                                onChange={(e) => setEditingComment(e.target.value)}
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault()
                                                                        handleUpdateComment(session.id)
                                                                    } else if (e.key === 'Escape') {
                                                                        setEditingId(null)
                                                                    }
                                                                }}
                                                                className="h-8 text-sm focus-visible:ring-zinc-900"
                                                            />
                                                        ) : (
                                                            session.comment ? (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <span className="text-zinc-500 text-sm truncate block cursor-help max-w-full">
                                                                                {session.comment}
                                                                            </span>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="bottom" className="bg-zinc-900 text-white border-zinc-800 max-w-sm">
                                                                            <p>{session.comment}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            ) : (
                                                                <span className="text-zinc-200 italic text-xs">No notes</span>
                                                            )
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {isEditing ? (
                                                                <>
                                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleUpdateComment(session.id)}>
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setEditingId(null)}>
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-7 w-7 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                                                                        onClick={() => {
                                                                            setEditingId(session.id)
                                                                            setEditingComment(session.comment || "")
                                                                        }}
                                                                    >
                                                                        <Pencil className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-7 w-7 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                                                                        onClick={() => setSessionToDelete(session)}
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Focus Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This session from <span className="font-bold text-zinc-900">{sessionToDelete && formatDate(sessionToDelete.created_at)}</span> will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-zinc-200">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => sessionToDelete && handleDelete(sessionToDelete.id)}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
                        >
                            Delete Session
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Multiple Sessions?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to delete <span className="font-bold text-red-600">{selectedIds.length}</span> sessions. This action is permanent and cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-zinc-200">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleBulkDelete}
                            disabled={isBulkDeleting}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
                        >
                            {isBulkDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Delete All Selected
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

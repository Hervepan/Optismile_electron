import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
    Calendar as CalendarIcon,
    ArrowLeft,
    CalendarDays
} from "lucide-react"
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"
import { useMemo } from "react"

interface StatsHeaderProps {
    isGlobal: boolean
    selectedCategory: string
    onCategoryChange: (value: string) => void
    categories: { id: string; name: string }[]
    filterDate: string
    onFilterDateChange: (value: string) => void
    dateRange: DateRange | undefined
    onDateRangeChange: (range: DateRange | undefined) => void
}

export function StatsHeader({
    isGlobal,
    selectedCategory,
    onCategoryChange,
    categories,
    filterDate,
    onFilterDateChange,
    dateRange,
    onDateRangeChange
}: StatsHeaderProps) {
    // Generate last 12 months for quick selection
    const recentMonths = useMemo(() => {
        const end = new Date()
        const start = subMonths(end, 11)
        return eachMonthOfInterval({ start, end }).reverse()
    }, [])

    const handleMonthSelect = (monthStr: string) => {
        const date = new Date(monthStr)
        onDateRangeChange({
            from: startOfMonth(date),
            to: endOfMonth(date)
        })
    }

    const selectedMonthValue = useMemo(() => {
        if (!dateRange?.from || !dateRange?.to) return ""
        const start = startOfMonth(dateRange.from).getTime()
        const end = endOfMonth(dateRange.from).getTime()
        if (dateRange.from.getTime() === start && dateRange.to.getTime() === end) {
            return startOfMonth(dateRange.from).toISOString()
        }
        return ""
    }, [dateRange])

    return (
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="bg-primary/5 p-2 rounded-lg">
                    <CalendarDays className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-lg font-bold tracking-tight text-zinc-900">Performance Analytics</h2>
                    <p className="text-xs text-zinc-500 font-medium">Analyze your focus sessions and trends</p>
                </div>
                {!isGlobal && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCategoryChange("all")}
                        className="h-8 text-xs font-bold border-zinc-200"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                        GLOBAL VIEW
                    </Button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Select
                        value={filterDate === 'custom' && selectedMonthValue ? 'month_select' : filterDate}
                        onValueChange={(val) => {
                            if (val === 'month_select') {
                                onFilterDateChange('custom')
                            } else {
                                onFilterDateChange(val)
                                if (val !== 'custom') onDateRangeChange(undefined)
                            }
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs font-semibold">
                            <SelectValue placeholder="Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="month_select">Specific Month</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                    </Select>

                    {filterDate === 'custom' && (
                        <div className="flex gap-2 w-full sm:w-auto">
                             {(selectedMonthValue || filterDate === 'custom') && (
                                <Select 
                                    value={selectedMonthValue} 
                                    onValueChange={handleMonthSelect}
                                >
                                    <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs font-medium bg-zinc-50 border-zinc-200">
                                        <SelectValue placeholder="Select Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {recentMonths.map((m) => (
                                            <SelectItem key={m.toISOString()} value={m.toISOString()}>
                                                {format(m, "MMMM yyyy")}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                             )}

                            {!selectedMonthValue && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                                "h-9 text-xs justify-start text-left font-normal w-full sm:w-[220px] border-zinc-200",
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
                                            onSelect={onDateRangeChange}
                                            numberOfMonths={2}
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>
                    )}
                </div>

                <Select value={selectedCategory} onValueChange={onCategoryChange}>
                    <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs font-semibold">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(c => (
                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

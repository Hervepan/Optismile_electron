import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    TrendingDown,
    TrendingUp,
    TrendingUpDown,
    Target,
    Trophy,
    Minus,
    HelpCircle,
    ChevronRight
} from "lucide-react"
import { formatSecondsToHuman } from "@lib/time"
import type { CategoryStat } from "@lib/stats-utils"
import { cn } from "@/lib/utils"

interface CategoryLeaderboardProps {
    stats: CategoryStat[]
    onSelectCategory: (categoryName: string) => void
}

export function CategoryLeaderboard({ stats, onSelectCategory }: CategoryLeaderboardProps) {
    const getTrendIcon = (stat: CategoryStat) => {
        if (stat.total_sessions < 3) return <Minus className="h-4 w-4 text-zinc-300" />
        // Note: For duration, "Lower" is often better (fasterActe), so TrendingDown might be Green
        const diff = stat.average_duration_seconds - stat.recent_average_seconds
        const threshold = 10 // 10 seconds difference
        
        if (diff > threshold) return <TrendingDown className="h-4 w-4 text-green-600" /> // Improving (faster)
        if (diff < -threshold) return <TrendingUp className="h-4 w-4 text-red-600" /> // Getting slower
        return <TrendingUpDown className="h-4 w-4 text-zinc-400" />
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider px-1">Category Breakdown</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <TooltipProvider>
                    {stats.map((stat) => (
                        <Card
                            key={stat.category_id}
                            className="border-zinc-200 shadow-none bg-white hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                            onClick={() => onSelectCategory(stat.category_name)}
                        >
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                 <CardTitle className="text-lg font-bold text-zinc-900 truncate pr-2 group-hover:text-blue-700 transition-colors leading-tight mt-1" title={stat.category_name}>
                                    {stat.category_name}
                                </CardTitle>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-600 bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100 cursor-help">
                                                <Target className="h-3 w-3 text-zinc-400" />
                                                <span>{stat.target_time ? formatSecondsToHuman(stat.target_time) : "None"}</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Defined target time for this category</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="cursor-help" onClick={(e) => e.stopPropagation()}>
                                                {getTrendIcon(stat)}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Recent Average (last 5) vs Overall Average over the period</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="pt-2">
                                <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                                    <StatItem 
                                        label="Avg Time" 
                                        value={formatSecondsToHuman(stat.average_duration_seconds)} 
                                        tooltip="Average session duration over the period"
                                    />
                                    <StatItem 
                                        label="Recent Avg" 
                                        value={formatSecondsToHuman(stat.recent_average_seconds)} 
                                        tooltip="Average of the last 5 sessions over the period"
                                    />
                                    <StatItem 
                                        label="Sessions" 
                                        value={stat.total_sessions.toString()} 
                                        tooltip="Total session count over the period"
                                    />
                                    <StatItem 
                                        label="Best" 
                                        value={formatSecondsToHuman(stat.best_session_seconds)} 
                                        tooltip="Shortest session over the period"
                                        isBest
                                    />
                                    <div className="col-span-2 pt-2 mt-1 border-t border-dashed border-zinc-100 flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Success Rate</p>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-2.5 w-2.5 text-zinc-300 cursor-help" onClick={(e) => e.stopPropagation()} />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Percentage of sessions meeting target over the period</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <p className={`text-sm font-bold ${stat.target_time ? ((stat.target_hit_rate || 0) >= 80 ? 'text-green-600' : (stat.target_hit_rate || 0) >= 50 ? 'text-yellow-600' : 'text-red-600') : 'text-zinc-300'}`}>
                                            {stat.target_time ? `${stat.target_hit_rate}%` : "--"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TooltipProvider>
            </div>
        </div>
    )
}

function StatItem({ label, value, tooltip, isBest }: { label: string, value: string, tooltip: string, isBest?: boolean }) {
    return (
        <div>
            <div className="flex items-center gap-1">
                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{label}</p>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="h-2.5 w-2.5 text-zinc-300 cursor-help" onClick={(e) => e.stopPropagation()} />
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-900 text-white text-[10px]">
                        <p>{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </div>
            <div className="flex items-center gap-1">
                {isBest && <Trophy className="h-3 w-3 text-yellow-500" />}
                <p className="text-sm font-bold text-zinc-800">{value}</p>
            </div>
        </div>
    )
}

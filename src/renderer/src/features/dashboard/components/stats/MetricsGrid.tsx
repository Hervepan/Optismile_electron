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
    Activity,
    Target,
    Trophy,
    Clock,
    Repeat,
    HelpCircle,
    Zap
} from "lucide-react"
import { formatSecondsToHuman } from "@lib/time"
import { cn } from "@/lib/utils"

interface MetricsGridProps {
    isGlobal: boolean
    // Global Data
    totalVolume?: number
    totalTime?: number
    mostFrequent?: string
    mostFrequentCount?: number
    globalHitRate?: number
    // Single Data
    avgTime?: number
    bestTime?: number
    stdDev?: number
    hitRate?: number
}

export function MetricsGrid({
    isGlobal,
    totalVolume,
    totalTime,
    mostFrequent,
    mostFrequentCount,
    globalHitRate,
    avgTime,
    bestTime,
    stdDev,
    hitRate
}: MetricsGridProps) {
    return (
        <TooltipProvider>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {isGlobal ? (
                    <>
                        <MetricCard 
                            title="Total Volume" 
                            value={totalVolume?.toString() || "0"} 
                            subValue="Recorded sessions"
                            icon={<Activity className="w-4 h-4 text-zinc-400" />}
                            tooltip="Total number of sessions over the period"
                        />
                        <MetricCard 
                            title="Total Time" 
                            value={formatSecondsToHuman(totalTime || 0)} 
                            subValue="Total chair time"
                            icon={<Clock className="w-4 h-4 text-zinc-400" />}
                            tooltip="Cumulative duration over the period"
                        />
                        <MetricCard 
                            title="Most Frequent" 
                            value={mostFrequent || "--"} 
                            subValue={`${mostFrequentCount} ${mostFrequentCount === 1 ? 'session' : 'sessions'}`}
                            icon={<Repeat className="w-4 h-4 text-blue-500" />}
                            tooltip="The activity performed most often over the period"
                        />
                        <MetricCard 
                            title="Global Success" 
                            value={`${globalHitRate}%`} 
                            subValue="Target hit rate"
                            icon={<Target className="w-4 h-4 text-green-600" />}
                            tooltip="Overall target hit rate over the period"
                        />
                    </>
                ) : (
                    <>
                        <MetricCard 
                            title="Average Time" 
                            value={formatSecondsToHuman(avgTime || 0)} 
                            subValue="Typical duration"
                            icon={<Clock className="w-4 h-4 text-zinc-400" />}
                            tooltip="Average session duration over the period"
                        />
                        <MetricCard 
                            title="Personal Best" 
                            value={formatSecondsToHuman(bestTime || 0)} 
                            subValue="Fastest valid session"
                            icon={<Trophy className="w-4 h-4 text-yellow-500" />}
                            tooltip="Shortest valid session over the period"
                        />
                        <MetricCard 
                            title="Consistency" 
                            value={`±${formatSecondsToHuman(Math.round(stdDev || 0))}`} 
                            subValue="Variation (Std Dev)"
                            icon={<Activity className="w-4 h-4 text-purple-500" />}
                            tooltip="Variation in session length over the period"
                        />
                        <MetricCard 
                            title="Success Rate" 
                            value={`${hitRate}%`} 
                            subValue="Sessions within target"
                            icon={<Target className="w-4 h-4 text-green-600" />}
                            tooltip="Percentage of sessions meeting target over the period"
                        />
                    </>
                )}
            </div>
        </TooltipProvider>
    )
}

function MetricCard({ title, value, subValue, icon, tooltip }: { title: string, value: string, subValue: string, icon: React.ReactNode, tooltip: string }) {
    return (
        <Card className="border-zinc-200 shadow-none bg-white overflow-hidden group hover:border-zinc-300 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-1.5">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">{title}</CardTitle>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircle className="h-3 w-3 text-zinc-300 cursor-help opacity-0 group-hover:opacity-100 transition-opacity" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-900 text-white text-[10px]">
                            <p>{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight text-zinc-900 truncate">{value}</div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mt-0.5">{subValue}</p>
            </CardContent>
        </Card>
    )
}

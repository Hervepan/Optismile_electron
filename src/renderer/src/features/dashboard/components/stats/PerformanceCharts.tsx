import { useMemo, useState, useEffect } from 'react'
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
    Cell
} from 'recharts'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { format, isValid } from "date-fns"
import { Inbox, LineChart as ChartIcon, BarChart3 } from "lucide-react"
import type { CategoryStat } from "@lib/stats-utils"
import { type Session } from "@lib/supabase/database"

interface PerformanceChartsProps {
    isGlobal: boolean
    calculatedStats: CategoryStat[]
    singleCatSessions: Session[]
    singleTarget: number | null
}

export function PerformanceCharts({ isGlobal, calculatedStats, singleCatSessions, singleTarget }: PerformanceChartsProps) {
    const [hasMounted, setHasMounted] = useState(false)

    useEffect(() => {
        setHasMounted(true)
    }, [])

    const barChartData = useMemo(() => {
        if (!calculatedStats) return []
        return calculatedStats
            .filter(s => s.total_sessions > 0)
            .map(s => ({
                name: s.category_name || "Unknown",
                "All-time Avg": Math.round((s.average_duration_seconds || 0) / 60),
                "Recent Avg": Math.round((s.recent_average_seconds || 0) / 60),
                "Target": s.target_time ? Math.round(s.target_time / 60) : 0,
            }))
    }, [calculatedStats])

    const lineChartData = useMemo(() => {
        if (!singleCatSessions) return []
        return singleCatSessions.map((s, index) => {
            const dateObj = new Date(s.created_at)
            return {
                date: isValid(dateObj) ? format(dateObj, "MMM dd") : "N/A",
                sessionIndex: index + 1,
                duration: Math.round((s.duration || 0) / 60),
            }
        })
    }, [singleCatSessions])

    if (!hasMounted) {
        return (
            <Card className="border-zinc-200 shadow-none bg-white">
                <CardHeader>
                    <CardTitle>{isGlobal ? "Category Comparison" : "Learning Curve"}</CardTitle>
                    <CardDescription>Loading statistics...</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <div className="h-full w-full bg-zinc-50/50 animate-pulse rounded-xl border border-dashed border-zinc-100" />
                </CardContent>
            </Card>
        )
    }

    const hasData = isGlobal ? barChartData.length > 0 : lineChartData.length > 0

    return (
        <Card className="border-zinc-200 shadow-none bg-white overflow-hidden">
            <CardHeader className="border-b border-zinc-50 pb-4">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                        {isGlobal ? "Category Comparison" : "Learning Curve"}
                    </CardTitle>
                </div>
                <CardDescription className="text-xs font-medium">
                    {isGlobal
                        ? "Compare performance against targets (Minutes)"
                        : "Track your improvement over time (Session History)"}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
                {!hasData ? (
                    <div className="flex h-[350px] flex-col items-center justify-center text-zinc-300 space-y-3">
                        <div className="bg-zinc-50 p-4 rounded-full">
                            <Inbox className="h-10 w-10 stroke-[1.5]" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-tighter">Insufficient Data</p>
                    </div>
                ) : (
                    <div className="h-[400px] w-full min-w-0">
                        <ResponsiveContainer 
                            width="100%" 
                            height="100%"
                            initialDimension={{ width: 300, height: 300 }}
                        >
                            {isGlobal ? (
                                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8f8f8" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        interval={0}
                                        tick={{ fontSize: 10, fontWeight: 600, fill: '#71717a' }}
                                        stroke="#e4e4e7"
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 11, fontWeight: 600, fill: '#a1a1aa' }} 
                                        stroke="#e4e4e7"
                                    />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #f4f4f5', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                                        cursor={{ fill: '#fafafa' }}
                                    />
                                    <Legend 
                                        verticalAlign="top" 
                                        height={36} 
                                        wrapperStyle={{ fontSize: '12px', paddingBottom: '20px' }} 
                                    />
                                    <Bar dataKey="All-time Avg" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Recent Avg" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Target" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            ) : (
                                <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8f8f8" />
                                    <XAxis
                                        dataKey="sessionIndex"
                                        tick={{ fontSize: 11, fontWeight: 600, fill: '#a1a1aa' }}
                                        stroke="#e4e4e7"
                                        label={{ value: 'Sessions', position: 'insideBottom', offset: -5, fontSize: 12, fill: '#71717a' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fontWeight: 600, fill: '#a1a1aa' }}
                                        stroke="#e4e4e7"
                                        label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 12 }}
                                    />
                                    <RechartsTooltip
                                        labelFormatter={(val) => `Session #${val}`}
                                        formatter={(value: any) => [`${value} min`, 'Duration']}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #f4f4f5', fontWeight: 'bold' }}
                                    />
                                    <Legend 
                                        verticalAlign="top" 
                                        height={36} 
                                        wrapperStyle={{ fontSize: '12px', paddingBottom: '20px' }} 
                                    />
                                    {singleTarget && (
                                        <ReferenceLine
                                            y={Math.round(singleTarget / 60)}
                                            label={{ value: 'Target', position: 'right', fill: '#ef4444', fontSize: 10 }}
                                            stroke="#ef4444"
                                            strokeDasharray="3 3"
                                        />
                                    )}
                                    <Line
                                        type="monotone"
                                        dataKey="duration"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: '#2563eb' }}
                                        activeDot={{ r: 6 }}
                                        name="Duration"
                                    />
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

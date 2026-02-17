import { useSessionsFetch } from "@/features/dashboard/hooks/useSessionsFetch"
import { useStatistics } from "@/features/dashboard/hooks/useStatistics"
import { StatsHeader } from "./StatsHeader"
import { MetricsGrid } from "./MetricsGrid"
import { CategoryLeaderboard } from "./CategoryLeaderboard"
import { PerformanceCharts } from "./PerformanceCharts"
import { Skeleton } from "@/components/ui/skeleton"

export function StatisticsSection() {
    const { sessions, isLoading: isFetching } = useSessionsFetch()
    
    const {
        isGlobal,
        selectedCategory,
        setSelectedCategory,
        filterDate,
        setFilterDate,
        dateRange,
        setDateRange,
        uniqueCategoryNames,
        calculatedStats,
        globalMetrics,
        singleCategoryData
    } = useStatistics({ rawSessions: sessions })

    if (isFetching) {
        return <StatisticsSkeleton />
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <StatsHeader
                isGlobal={isGlobal}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                categories={uniqueCategoryNames}
                filterDate={filterDate}
                onFilterDateChange={setFilterDate}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
            />

            <MetricsGrid
                isGlobal={isGlobal}
                // Global
                totalVolume={globalMetrics.totalVolume}
                totalTime={globalMetrics.totalTime}
                mostFrequent={globalMetrics.mostFrequent}
                mostFrequentCount={globalMetrics.mostFrequentCount}
                globalHitRate={globalMetrics.globalHitRate}
                // Single
                avgTime={singleCategoryData?.stats?.average_duration_seconds}
                bestTime={singleCategoryData?.stats?.best_session_seconds}
                stdDev={singleCategoryData?.stdDev}
                hitRate={singleCategoryData?.stats?.target_hit_rate || 0}
            />

            <div className="grid grid-cols-1 gap-8">
                {isGlobal && (
                    <CategoryLeaderboard
                        stats={calculatedStats}
                        onSelectCategory={setSelectedCategory}
                    />
                )}

                <PerformanceCharts
                    isGlobal={isGlobal}
                    calculatedStats={calculatedStats}
                    singleCatSessions={singleCategoryData?.sessions || []}
                    singleTarget={singleCategoryData?.stats?.target_time || null}
                />
            </div>
        </div>
    )
}

function StatisticsSkeleton() {
    return (
        <div className="space-y-8">
            <Skeleton className="h-20 w-full rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
    )
}

import { useState, useMemo } from "react";
import { 
  filterSessionsByDate, 
  calculateCategoryStats, 
  calculateStdDev,
  type CategoryStat 
} from "@lib/stats-utils";
import { type Session } from "@lib/supabase/database";
import type { DateRange } from "react-day-picker";

interface UseStatisticsProps {
  rawSessions: Session[];
}

export function useStatistics({ rawSessions }: UseStatisticsProps) {
  // --- Filter State ---
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filterDate, setFilterDate] = useState("month");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // --- 1. Date Filtering ---
  const filteredByDate = useMemo(() => {
    return filterSessionsByDate(rawSessions, filterDate, dateRange);
  }, [rawSessions, filterDate, dateRange]);

  // --- 2. Aggregate Stats (Ranked Categories) ---
  const calculatedStats = useMemo(() => {
    return calculateCategoryStats(filteredByDate);
  }, [filteredByDate]);

  // --- 3. Global Derived Metrics ---
  const isGlobal = selectedCategory === "all";
  
  const globalMetrics = useMemo(() => {
    const totalVolume = filteredByDate.length;
    const totalTime = filteredByDate.reduce((sum, s) => sum + s.duration, 0);
    const mostFrequent = calculatedStats[0]?.category_name || "--";
    const mostFrequentCount = calculatedStats[0]?.total_sessions || 0;

    const sessionsWithTargets = filteredByDate.filter(s => s.Category?.target_time);
    const totalHits = sessionsWithTargets.filter(s => s.duration <= (s.Category?.target_time || 0)).length;
    const globalHitRate = sessionsWithTargets.length > 0 ? Math.round((totalHits / sessionsWithTargets.length) * 100) : 0;

    return { totalVolume, totalTime, mostFrequent, mostFrequentCount, globalHitRate };
  }, [filteredByDate, calculatedStats]);

  // --- 4. Single Category Detail Metrics ---
  const singleCategoryData = useMemo(() => {
    if (isGlobal) return null;
    
    const stats = calculatedStats.find(s => s.category_name === selectedCategory);
    const sessions = filteredByDate
      .filter(s => s.Category?.name === selectedCategory)
      // Line charts need chronological order
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const durations = sessions.map(s => s.duration);
    const avg = stats?.average_duration_seconds || 0;
    const stdDev = calculateStdDev(durations, avg);

    return {
      stats,
      sessions,
      stdDev
    };
  }, [isGlobal, selectedCategory, calculatedStats, filteredByDate]);

  // --- 5. Helper for Category Selectors ---
  const uniqueCategoryNames = useMemo(() => 
    calculatedStats.map(s => ({ id: s.category_name, name: s.category_name })),
  [calculatedStats]);

  return {
    // State control
    selectedCategory,
    setSelectedCategory,
    filterDate,
    setFilterDate,
    dateRange,
    setDateRange,

    // Data
    isGlobal,
    uniqueCategoryNames,
    calculatedStats,
    globalMetrics,
    singleCategoryData
  };
}

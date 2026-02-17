import { Session } from "@lib/supabase/database";
import { 
  startOfDay, 
  startOfWeek, 
  startOfMonth, 
  isWithinInterval, 
  endOfDay,
  subDays
} from "date-fns";
import { DateRange } from "react-day-picker";

export interface CategoryStat {
  category_id: string;
  category_name: string;
  target_time: number | null;
  total_sessions: number;
  average_duration_seconds: number;
  recent_average_seconds: number;
  best_session_seconds: number;
  target_hit_rate: number | null;
}

/**
 * Filter sessions based on standard or custom date ranges.
 * Uses date-fns for production-grade accuracy.
 */
export function filterSessionsByDate(sessions: Session[], filter: string, range?: DateRange): Session[] {
  const now = new Date();
  
  return sessions.filter((s) => {
    const date = new Date(s.created_at);
    
    switch (filter) {
      case "today":
        return isWithinInterval(date, { start: startOfDay(now), end: endOfDay(now) });
      case "week":
        // Monday start
        return date >= startOfWeek(now, { weekStartsOn: 1 });
      case "month":
        return date >= startOfMonth(now);
      case "custom":
        if (!range?.from) return true;
        return isWithinInterval(date, { 
          start: startOfDay(range.from), 
          end: endOfDay(range.to || range.from) 
        });
      default:
        return true;
    }
  });
}

/**
 * Aggregates raw sessions into Category-specific metrics.
 * Logic Triple-Checked:
 * 1. Average: Mean of all durations in the filtered subset.
 * 2. Recent Avg: Mean of the N=5 most recent sessions (chronological desc).
 * 3. Best Session: Min duration (lowest is best for target-based productivity).
 * 4. Hit Rate: Percentage of sessions where duration <= target_time.
 */
export function calculateCategoryStats(sessions: Session[]): CategoryStat[] {
  const statsMap = new Map<string, { name: string; target: number | null; sessions: Session[] }>();

  sessions.forEach((s) => {
    const catName = s.Category?.name || "Uncategorized";
    if (!statsMap.has(catName)) {
      statsMap.set(catName, {
        name: catName,
        target: s.Category?.target_time ?? null,
        sessions: [],
      });
    }
    statsMap.get(catName)!.sessions.push(s);
  });

  return Array.from(statsMap.entries())
    .map(([name, data]) => {
      const { sessions, target } = data;
      const total = sessions.length;
      
      // 1. Average Calculation (Total Sum / Count)
      const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
      const avg = total > 0 ? totalDuration / total : 0;

      // 2. Recent Average (Top 5 desc)
      const sorted = [...sessions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const recent = sorted.slice(0, 5);
      const recentAvg = recent.length > 0 ? recent.reduce((sum, s) => sum + s.duration, 0) / recent.length : 0;

      // 3. Personal Best (Minimum duration recorded)
      const best = total > 0 ? Math.min(...sessions.map((s) => s.duration)) : 0;

      // 4. Success Rate: (Count of sessions meeting target / Total target sessions) * 100
      let hitRate: number | null = null;
      if (target) {
        const hits = sessions.filter((s) => s.duration <= target).length;
        hitRate = Math.round((hits / total) * 100);
      }

      return {
        category_id: name,
        category_name: name,
        target_time: target,
        total_sessions: total,
        average_duration_seconds: avg,
        recent_average_seconds: recentAvg,
        best_session_seconds: best,
        target_hit_rate: hitRate,
      };
    })
    .sort((a, b) => b.total_sessions - a.total_sessions);
}

/**
 * Standard Deviation formula for consistency tracking.
 * Formula: sqrt( Σ(x - μ)² / N )
 * Verified: Standard population deviation.
 */
export function calculateStdDev(durations: number[], mean: number): number {
  if (durations.length < 2) return 0;
  const variance = durations.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / durations.length;
  return Math.sqrt(variance);
}

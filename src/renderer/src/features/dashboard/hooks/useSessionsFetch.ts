import { useState, useEffect, useCallback } from "react";
import { getSessions, type Session } from "@lib/supabase/database";
import { toast } from "sonner";

export function useSessionsFetch() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (isMounted: { current: boolean }) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSessions();
      if (isMounted.current) {
        setSessions(data || []);
      }
    } catch (err) {
      if (isMounted.current) {
        const error = err instanceof Error ? err : new Error("Failed to fetch sessions");
        setError(error);
        toast.error(error.message);
      }
      console.error("useSessionsFetch:", err);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const isMounted = { current: true };
    fetchData(isMounted);

    // Live refresh: Listen for saved sessions to trigger a refetch
    const removeListener = window.api.auth.onSessionSaved(() => {
      fetchData(isMounted);
    });

    return () => {
      isMounted.current = false;
      removeListener();
    };
  }, [fetchData]);

  return { sessions, isLoading, error, refetch: () => fetchData({ current: true }) };
}

import { useState, useEffect, useCallback } from "react";
import { getSessions, type Session } from "@lib/supabase/database";
import { toast } from "sonner";

export function useSessionsFetch() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSessions();
      setSessions(data || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch sessions");
      setError(error);
      toast.error(error.message);
      console.error("useSessionsFetch:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { sessions, isLoading, error, refetch: fetchData };
}

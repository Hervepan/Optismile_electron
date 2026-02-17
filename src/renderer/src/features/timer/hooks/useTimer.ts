import { useState, useRef, useEffect, useCallback } from "react";

interface UseTimerReturn {
  seconds: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  stop: () => number;
  formatTime: (totalSeconds: number) => string;
}

export function useTimer(initialTime: number = 0): UseTimerReturn {
  const [seconds, setSeconds] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);

  const start = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const timePassed = Math.floor((now - startTimeRef.current) / 1000);
      const totalSeconds = timePassed + accumulatedRef.current;

      setSeconds((prev) => {
        if (prev !== totalSeconds) return totalSeconds;
        return prev;
      });
    }, 100);
  }, [isRunning]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    accumulatedRef.current = seconds;
  }, [isRunning, seconds]);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const finalTime = seconds;
    setSeconds(0);
    accumulatedRef.current = 0;
    startTimeRef.current = 0;

    return finalTime;
  }, [seconds]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const m = minutes.toString().padStart(2, "0");
    const s = secs.toString().padStart(2, "0");

    return hours > 0 ? `${hours}:${m}:${s}` : `${m}:${s}`;
  }, []);

  useEffect(() => {
    window.api.timer.updateStatus(isRunning);
  }, [isRunning]);

  return { seconds, isRunning, start, pause, stop, formatTime };
}

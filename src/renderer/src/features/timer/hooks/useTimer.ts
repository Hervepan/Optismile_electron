import { useState, useRef, useEffect, useCallback } from "react";

interface UseTimerReturn {
  seconds: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  stop: () => number;
  formatTime: (totalSeconds: number) => string;
}

/**
 * High-Precision Sleep-Proof Timer
 * Logic:
 * 1. Uses absolute timestamps (Date.now()) to prevent drift during system sleep.
 * 2. Tracks milliseconds internally to prevent time loss on pause/resume ("Pause-Tax").
 * 3. Only updates React state when the second digit actually changes.
 */
export function useTimer(initialTime: number = 0): UseTimerReturn {
  const [seconds, setSeconds] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const startTimeRef = useRef<number>(0);
  const accumulatedMsRef = useRef<number>(initialTime * 1000);

  const start = useCallback(() => {
    if (isRunning) return;
    startTimeRef.current = Date.now();
    setIsRunning(true);
  }, [isRunning]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    
    // Capture precise elapsed time before stopping the clock
    const elapsedSinceStart = Date.now() - startTimeRef.current;
    accumulatedMsRef.current += elapsedSinceStart;
    
    setIsRunning(false);
    setSeconds(Math.floor(accumulatedMsRef.current / 1000));
  }, [isRunning]);

  const stop = useCallback(() => {
    let totalMs = accumulatedMsRef.current;
    if (isRunning) {
      totalMs += (Date.now() - startTimeRef.current);
    }

    const finalSeconds = Math.floor(totalMs / 1000);

    setIsRunning(false);
    setSeconds(0);
    accumulatedMsRef.current = 0;
    startTimeRef.current = 0;

    return finalSeconds;
  }, [isRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      const initialMs = accumulatedMsRef.current;
      
      interval = setInterval(() => {
        const now = Date.now();
        const totalMs = (now - startTimeRef.current) + initialMs;
        
        const currentTotalSeconds = Math.floor(totalMs / 1000);
        // Performance optimization: Only trigger re-render if the second actually flips
        setSeconds(prev => prev !== currentTotalSeconds ? currentTotalSeconds : prev);
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

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

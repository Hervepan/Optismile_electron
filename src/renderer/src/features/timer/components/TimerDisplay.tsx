import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button'
import { useTimer } from '@/features/timer/hooks/useTimer'
import { Play, Pause, Square, AlertTriangle, Bell, X as CloseIcon } from 'lucide-react'

interface TimerProps {
    onFinish: (duration: number) => void;
    isAuthenticated: boolean;
}

export function TimerDisplay({ onFinish, isAuthenticated }: TimerProps) {
    const { seconds, isRunning, start, pause, stop, formatTime } = useTimer();
    const [nudgeType, setNudgeType] = useState<string | null>(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('nudge');
    });
    const [nudgeCountdown, setNudgeCountdown] = useState<number | null>(null);
    const hasStarted = seconds > 0;

    // Fetch nudge duration on mount
    useEffect(() => {
        if (nudgeType) {
            window.api.settings.getNudgeDuration().then((mins: number) => {
                setNudgeCountdown(mins * 60);
            });
        }
    }, [nudgeType]);

    // Live countdown logic
    useEffect(() => {
        if (nudgeCountdown !== null && nudgeCountdown > 0) {
            const timer = setTimeout(() => setNudgeCountdown(nudgeCountdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (nudgeCountdown === 0) {
            setNudgeType(null);
            setNudgeCountdown(null);
        }
        return undefined;
    }, [nudgeCountdown]);

    const formatCountdown = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // --- STOP LOGIC ---
    const stopRef = useRef(stop);
    const onFinishRef = useRef(onFinish);

    useEffect(() => {
        stopRef.current = stop;
        onFinishRef.current = onFinish;
    }, [stop, onFinish]);

    const handleStop = () => {
        if (seconds === 0) return;
        const finalTime = stopRef.current();
        onFinishRef.current(finalTime);
    }

    const handleStopRef = useRef(handleStop);
    useEffect(() => {
        handleStopRef.current = handleStop;
    }, [handleStop]);

    // Handle initial start only if not nudging
    useEffect(() => { 
        if (!nudgeType) start();
    }, [start, nudgeType]);

    // --- NUDGE LOGIC ---
    useEffect(() => {
        const removeNudgeListener = window.api.timer.onNudge((type: string) => {
            if (!isRunning && seconds === 0) {
                setNudgeType(type);
                window.api.settings.getNudgeDuration().then((mins: number) => {
                    setNudgeCountdown(mins * 60);
                });
            }
        });

        return () => removeNudgeListener();
    }, [isRunning, seconds]);

    const handleStartFromNudge = () => {
        setNudgeType(null);
        setNudgeCountdown(null);
        start();
    }

    // --- PRO EVENT LISTENER ---
    // Instead of hacky props, we listen to the bridge event directly
    useEffect(() => {
        const removeListener = window.api.auth.onShortcutPressed(() => {
            console.log("Global shortcut pressed - current state:", { isRunning, isNudging: !!nudgeType });
            
            if (nudgeType) {
                // If we are nudging, the shortcut should START the timer
                handleStartFromNudge();
            } else if (isRunning) {
                // If running, it should STOP
                handleStopRef.current();
            } else {
                // If idle (not nudging, not running), just start
                start();
            }
        });

        return () => removeListener();
    }, [isRunning, nudgeType, start]); 

    if (nudgeType) {
        return (
            <div className="flex flex-col h-full bg-white text-zinc-900 overflow-hidden font-sans border-2 border-lime-400">
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-3">
                    <div className="bg-lime-100 p-2 rounded-full">
                        <Bell className="w-5 h-5 text-lime-600 animate-bounce" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-zinc-900">
                            {nudgeType === 'ready-for-next' ? 'Ready for next patient?' : 'Start a new session?'}
                        </h3>
                        {nudgeCountdown !== null && (
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                                Closing in {formatCountdown(nudgeCountdown)}
                            </p>
                        )}
                    </div>
                </div>
                <footer className="p-3 bg-zinc-50 border-t border-zinc-100">
                    <Button 
                        onClick={handleStartFromNudge}
                        className="w-full h-11 bg-lime-400 text-lime-950 font-bold text-sm hover:bg-lime-500 shadow-sm transition-all active:scale-[0.98]"
                    >
                        START NEXT SESSION
                    </Button>
                </footer>
            </div>
        )
    }
    return (
        <div className="flex flex-col h-full bg-white text-zinc-900 overflow-hidden font-sans">
            {!isAuthenticated && (
                <div className="flex items-center gap-2 bg-yellow-100 border-b border-yellow-200 text-yellow-800 text-xs text-center p-2 uppercase font-bold tracking-tight">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Not logged in. Session won't be saved.</span>
                </div>
            )}

            <div className="flex items-center justify-end px-4 pt-4 h-6">
                {isRunning && (
                    <span className="flex h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
                )}
            </div>

            <main className="flex-1 flex items-center justify-center">
                <div className={`text-7xl font-bold tracking-tighter tabular-nums transition-colors duration-300 ${isRunning ? 'text-zinc-900' : 'text-zinc-300'}`}>
                    {formatTime(seconds)}
                </div>
            </main>

            <footer className="p-4 bg-zinc-50 border-t border-zinc-100">
                <div className="flex gap-2">
                    <Button
                        onClick={handleStop}
                        disabled={!hasStarted}
                        variant="outline"
                        className={`transition-all duration-300 flex-1 h-14 border-zinc-200 text-zinc-600 hover:bg-red-50 hover:text-red-600 ${!hasStarted ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
                    >
                        <Square className="w-4 h-4 fill-current" />
                    </Button>

                    <Button
                        onClick={isRunning ? pause : start}
                        className={`h-14 flex-[2] font-bold text-lg transition-all duration-200 active:scale-95 shadow-sm ${isRunning
                            ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                            : 'bg-lime-400 text-lime-950 hover:bg-lime-500'
                            }`}
                    >
                        {isRunning ? (
                            <><Pause className="w-4 h-4 mr-2 fill-current" /> PAUSE</>
                        ) : (
                            <><Play className="w-4 h-4 mr-2 fill-current" /> {hasStarted ? 'RESUME' : 'START'}</>
                        )}
                    </Button>
                </div>
            </footer>
        </div>
    )
}

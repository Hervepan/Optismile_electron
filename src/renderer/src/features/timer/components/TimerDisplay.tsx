import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button'
import { useTimer } from '@/features/timer/hooks/useTimer'
import { Play, Pause, Square, AlertTriangle } from 'lucide-react'

interface TimerProps {
    onFinish: (duration: number) => void;
    isAuthenticated: boolean;
}

export function TimerDisplay({ onFinish, isAuthenticated }: TimerProps) {
    const { seconds, isRunning, start, pause, stop, formatTime } = useTimer();
    const hasStarted = seconds > 0;
    
    // Use refs to ensure the event listener always has access to the latest functions
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

    useEffect(() => { 
        start() 
    }, [start])

    // --- PRO EVENT LISTENER ---
    // Instead of hacky props, we listen to the bridge event directly
    useEffect(() => {
        const removeListener = window.api.auth.onShortcutPressed(() => {
            console.log("Timer stop triggered via global shortcut");
            handleStopRef.current();
        });

        return () => removeListener();
    }, []); 

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

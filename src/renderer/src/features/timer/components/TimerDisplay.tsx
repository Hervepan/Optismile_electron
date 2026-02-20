import { useState, useEffect, useRef, useCallback } from 'react';
import { useTimer } from '@/features/timer/hooks/useTimer'
import { NormalView } from './views/NormalView';
import { CamouflageView } from './views/CamouflageView';
import { NudgeView } from './views/NudgeView';

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
    const [isCamouflaged, setIsCamouflaged] = useState(false);
    
    const hasStarted = seconds > 0;
    const hasAutoStarted = useRef(false);

    // Stable references for handlers to prevent listener re-registration
    const onFinishRef = useRef(onFinish);
    useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

    // --- NUDGE LIFECYCLE ---
    
    // Fetch nudge timeout (auto-dismiss) duration on mount if nudging
    useEffect(() => {
        if (nudgeType) {
            const fetchTimeout = async () => {
                try {
                    const secs = await window.api.settings.getNudgeTimeout();
                    setNudgeCountdown(secs || 300);
                } catch (e) {
                    setNudgeCountdown(300);
                }
            };
            fetchTimeout();
        }
    }, [nudgeType]);

    // Live countdown for auto-dismiss
    useEffect(() => {
        if (nudgeCountdown !== null && nudgeCountdown > 0) {
            const timer = setTimeout(() => setNudgeCountdown(nudgeCountdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (nudgeCountdown === 0) {
            window.api.timer.close();
        }
        return undefined;
    }, [nudgeCountdown]);

    const formatCountdown = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // --- LOGIC HANDLERS ---

    const handleStop = useCallback(() => {
        const finalTime = stop();
        if (finalTime > 0) {
            onFinishRef.current(finalTime);
        }
    }, [stop]);

    const handleStartFromNudge = useCallback(() => {
        setNudgeType(null);
        setNudgeCountdown(null);
        start();
    }, [start]);

    // --- IPC LISTENERS (STABLE) ---

    useEffect(() => {
        const removeNudgeListener = window.api.timer.onNudge((type: string) => {
            // We can check state here using a functional update pattern if needed,
            // but for simple triggers, just set the state.
            setNudgeType(type);
            window.api.settings.getNudgeTimeout().then((secs: number) => {
                setNudgeCountdown(secs || 300);
            });
        });

        const removeCamouflageListener = window.api.timer.onToggleCamouflage(() => {
            setIsCamouflaged(prev => !prev);
        });

        return () => {
            removeNudgeListener();
            removeCamouflageListener();
        };
    }, []);

    // Shortcut listener needs fresh access to handlers
    useEffect(() => {
        const removeShortcutListener = window.api.auth.onShortcutPressed(() => {
            if (nudgeType) {
                handleStartFromNudge();
            } else if (isRunning) {
                handleStop();
            } else {
                start();
            }
        });
        return () => removeShortcutListener();
    }, [isRunning, nudgeType, start, handleStop, handleStartFromNudge]);

    // Initial Auto-Start logic
    useEffect(() => {
        if (!nudgeType && !hasAutoStarted.current) {
            hasAutoStarted.current = true;
            start();
        }
    }, [start, nudgeType]);

    // --- VIEW RENDERING ---

    return (
        <div className="relative h-full w-full">
            {/* Nudge View Overlay */}
            {nudgeType && (
                <div className="absolute inset-0 z-50">
                    <NudgeView 
                        nudgeType={nudgeType}
                        countdown={nudgeCountdown}
                        onStart={handleStartFromNudge}
                        formatCountdown={formatCountdown}
                    />
                </div>
            )}

            {/* Camouflage View */}
            <div className={`absolute inset-0 z-40 transition-opacity duration-300 ${isCamouflaged && !nudgeType ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <CamouflageView 
                    isRunning={isRunning}
                    hasStarted={hasStarted}
                    onExitCamouflage={() => setIsCamouflaged(false)}
                    onStop={handleStop}
                />
            </div>

            {/* Normal View */}
            <div className={`absolute inset-0 z-30 transition-opacity duration-300 ${!isCamouflaged && !nudgeType ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <NormalView 
                    seconds={seconds}
                    isRunning={isRunning}
                    isAuthenticated={isAuthenticated}
                    hasStarted={hasStarted}
                    formatTime={formatTime}
                    onStart={start}
                    onPause={pause}
                    onStop={handleStop}
                    onCamouflage={() => setIsCamouflaged(true)}
                />
            </div>
        </div>
    );
}

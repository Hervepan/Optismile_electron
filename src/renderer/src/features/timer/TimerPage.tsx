import { TimerDisplay } from './components/TimerDisplay'
import { X } from 'lucide-react'

export function TimerPage({ user }: { user: any }) {
    const handleTimerFinish = (duration: number) => {
        // MIRROR EXTENSION: PIP window closes and Save window opens
        window.api.timer.finish(duration);
    };

    return (
        <div className="app-container group">
            {/* Ultra-slim Drag handle & Close button */}
            <div className="drag-handle h-6 w-full flex justify-end items-center px-2 bg-zinc-50/50 border-b border-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => window.close()} 
                    className="no-drag p-0.5 hover:bg-zinc-200 rounded text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                    <X size={12} />
                </button>
            </div>

            <div className="flex-1 no-drag overflow-hidden">
                <TimerDisplay 
                    onFinish={handleTimerFinish} 
                    isAuthenticated={!!user}
                />
            </div>
        </div>
    )
}

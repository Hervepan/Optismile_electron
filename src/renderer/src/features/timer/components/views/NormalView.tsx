import { Button } from "@/components/ui/button";
import { Play, Pause, Square, AlertTriangle, EyeOff } from "lucide-react";

interface NormalViewProps {
  seconds: number;
  isRunning: boolean;
  isAuthenticated: boolean;
  hasStarted: boolean;
  formatTime: (totalSeconds: number) => string;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onCamouflage: () => void;
}

export function NormalView({
  seconds,
  isRunning,
  isAuthenticated,
  hasStarted,
  formatTime,
  onStart,
  onPause,
  onStop,
  onCamouflage,
}: NormalViewProps) {
  return (
    <div className="flex flex-col h-full bg-white text-zinc-900 overflow-hidden font-sans relative">
      <button
        onClick={onCamouflage}
        className="absolute top-2.5 right-3 p-1.5 text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-all z-10"
        title="Camouflage Mode (Alt+K)"
      >
        <EyeOff className="w-4 h-4" />
      </button>

      {!isAuthenticated && (
        <div className="flex items-center gap-2 bg-yellow-100 border-b border-yellow-200 text-yellow-800 text-[10px] text-center p-1.5 uppercase font-bold tracking-tight">
          <AlertTriangle className="w-3 h-3" />
          <span>Not logged in. Session won't be saved.</span>
        </div>
      )}

      <div className="flex items-center justify-end px-4 pt-4 h-6" />

      <main className="flex-1 flex items-center justify-center">
        <div
          className={`text-7xl font-bold tracking-tighter tabular-nums transition-colors duration-300 ${
            isRunning ? "text-zinc-900" : "text-zinc-300"
          }`}
        >
          {formatTime(seconds)}
        </div>
      </main>

      <footer className="p-4 bg-zinc-50 border-t border-zinc-100">
        <div className="flex gap-2">
          <Button
            onClick={onStop}
            disabled={!hasStarted}
            variant="outline"
            title="Stop Session (Alt+J)"
            className={`transition-all duration-300 flex-1 h-14 border-zinc-200 text-zinc-600 hover:bg-red-50 hover:text-red-600 ${
              !hasStarted ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"
            }`}
          >
            <Square className="w-4 h-4 fill-current" />
          </Button>

          <Button
            onClick={isRunning ? onPause : onStart}
            title={isRunning ? "Pause (Alt+J)" : "Start (Alt+J)"}
            className={`h-14 flex-[2] font-bold text-lg transition-all duration-200 active:scale-95 shadow-sm ${
              isRunning ? "bg-zinc-900 text-white hover:bg-zinc-800" : "bg-lime-400 text-lime-950 hover:bg-lime-500"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2 fill-current" /> PAUSE
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2 fill-current" /> {hasStarted ? "RESUME" : "START"}
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}

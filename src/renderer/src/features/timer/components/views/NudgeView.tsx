import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

interface NudgeViewProps {
  nudgeType: string | null;
  countdown: number | null;
  onStart: () => void;
  formatCountdown: (totalSeconds: number) => string;
}

export function NudgeView({ nudgeType, countdown, onStart, formatCountdown }: NudgeViewProps) {
  return (
    <div className="flex flex-col h-full bg-white text-zinc-900 overflow-hidden font-sans border-2 border-lime-400">
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-3">
        <div className="bg-lime-100 p-2 rounded-full">
          <Bell className="w-5 h-5 text-lime-600 animate-bounce" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-zinc-900">
            {nudgeType === "ready-for-next" ? "Ready for next patient?" : "Start a new session?"}
          </h3>
          {countdown !== null && (
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
              Closing in {formatCountdown(countdown)}
            </p>
          )}
        </div>
      </div>
      <footer className="p-3 bg-zinc-50 border-t border-zinc-100">
        <Button
          onClick={onStart}
          className="w-full h-11 bg-lime-400 text-lime-950 font-bold text-sm hover:bg-lime-500 shadow-sm transition-all active:scale-[0.98]"
        >
          START NEXT SESSION
        </Button>
      </footer>
    </div>
  );
}

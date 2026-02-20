import { Button } from "@/components/ui/button";
import { Square, Eye } from "lucide-react";

interface CamouflageViewProps {
    isRunning: boolean;
    hasStarted: boolean;
    onExitCamouflage: () => void;
    onStop: () => void;
}

export function CamouflageView({
    isRunning,
    hasStarted,
    onExitCamouflage,
    onStop,
}: CamouflageViewProps) {
    return (
        <div className="flex flex-col h-full bg-white text-zinc-900 overflow-hidden font-sans relative">
            {isRunning && (
                <div className="absolute top-4 left-4 flex items-center justify-center">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white border-2 border-lime-500"></span>
                    </span>
                </div>
            )}
            <button
                onClick={onExitCamouflage}
                className="absolute top-2.5 right-3 p-1.5 text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-all z-10"
                title="Exit Camouflage (Alt+K)"
            >
                <Eye className="w-4 h-4" />
            </button>

            <main className="flex-1 flex flex-col items-center justify-center p-2 gap-4">
                <div
                    className={`${isRunning ? "opacity-100" : "opacity-60"
                        } transition-none`}
                >
                    <img src="icons/optismile.png" alt="Optismile" className="w-14 h-14 object-contain" />
                </div>
                {isRunning && (
                    <div className="flex flex-col items-center gap-2 transition-none">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[12px] font-black text-zinc-400 uppercase">
                                Running
                            </span>
                            <span className="text-[10px] font-bold text-zinc-300 italic">
                                "Don't forget to stop me..."
                            </span>
                        </div>
                    </div>
                )}
            </main>

            <footer className="px-6 py-2.5 bg-white border-t border-zinc-50 flex flex-col items-center">
                <Button
                    onClick={onStop}
                    disabled={!hasStarted}
                    variant="ghost"
                    className={`w-full h-11 border border-zinc-100 transition-all font-bold text-xs uppercase ${!hasStarted ? "opacity-30" : "text-zinc-300 hover:text-red-600 hover:bg-red-50 hover:border-red-100"
                        }`}
                >
                    <Square className="w-3 h-3 mr-2 fill-current" />
                    Stop Session
                </Button>
            </footer>
        </div>
    );
}

import { useState, useEffect, useCallback } from 'react'
import { Keyboard, Bell, Shield, Info } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { cn } from "@lib/utils"
import { TimeInput } from "@/components/ui/time-input"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"

export function SettingsSection() {
    // Primary Shortcut
    const [shortcut, setShortcut] = useState<string>("Alt+J")
    const [newShortcut, setNewShortcut] = useState("")
    const [isRecordingPrimary, setIsRecordingPrimary] = useState(false)

    // Camouflage Shortcut
    const [camouflageShortcut, setCamouflageShortcut] = useState<string>("Alt+K")
    const [newCamouflageShortcut, setNewCamouflageShortcut] = useState("")
    const [isRecordingCamouflage, setIsRecordingCamouflage] = useState(false)

    // Nudge Settings
    const [nudgeDelay, setNudgeDelay] = useState<number>(300) // 5m in seconds
    const [nudgeTimeout, setNudgeTimeout] = useState<number>(300) // 5m in seconds

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = () => {
        window.api.settings.getShortcut().then((s: string) => s && setShortcut(s))
        window.api.settings.getCamouflageShortcut().then((s: string) => s && setCamouflageShortcut(s))
        // getNudgeSeconds returns seconds for full precision
        window.api.settings.getNudgeSeconds().then((secs: number) => setNudgeDelay(secs || 300))
        window.api.settings.getNudgeTimeout().then((secs: number) => setNudgeTimeout(secs || 60))
    }

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isRecordingPrimary && !isRecordingCamouflage) return;

        e.preventDefault();
        e.stopPropagation();

        const modifiers: string[] = [];
        if (e.ctrlKey || e.metaKey) modifiers.push('CmdOrCtrl');
        if (e.altKey) modifiers.push('Alt');
        if (e.shiftKey) modifiers.push('Shift');

        const key = e.key;
        const isModifier = ['Control', 'Alt', 'Shift', 'Meta'].includes(key);

        if (isModifier) {
            const modString = modifiers.join('+');
            if (isRecordingPrimary) setNewShortcut(modString);
            else setNewCamouflageShortcut(modString);
            return;
        }

        let finalKey = key;
        if (key === ' ') finalKey = 'Space';
        else if (key === 'ArrowUp') finalKey = 'Up';
        else if (key === 'ArrowDown') finalKey = 'Down';
        else if (key === 'ArrowLeft') finalKey = 'Left';
        else if (key === 'ArrowRight') finalKey = 'Right';
        else if (key === 'Escape') finalKey = 'Esc';
        else if (key === 'Insert') finalKey = 'Insert';
        else if (key === 'Delete') finalKey = 'Delete';
        else if (key === 'Home') finalKey = 'Home';
        else if (key === 'End') finalKey = 'End';
        else if (key === 'PageUp') finalKey = 'PageUp';
        else if (key === 'PageDown') finalKey = 'PageDown';
        else if (key.length === 1) finalKey = key.toUpperCase();

        const fullShortcut = [...new Set(modifiers), finalKey].join('+');
        
        if (isRecordingPrimary) {
            setNewShortcut(fullShortcut);
            setIsRecordingPrimary(false);
        } else {
            setNewCamouflageShortcut(fullShortcut);
            setIsRecordingCamouflage(false);
        }
    }, [isRecordingPrimary, isRecordingCamouflage]);

    useEffect(() => {
        if (isRecordingPrimary || isRecordingCamouflage) {
            window.addEventListener('keydown', handleKeyDown);
        } else {
            window.removeEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isRecordingPrimary, isRecordingCamouflage, handleKeyDown]);

    const formatShortcutDisplay = (s: string) => {
        if (!s) return "";
        return s.split('+').map(part => {
            if (part.length === 1) return part.toUpperCase();
            return part.charAt(0).toUpperCase() + part.slice(1);
        }).join('+');
    }

    const handleUpdatePrimary = async () => {
        if (!newShortcut.trim()) return
        const success = await window.api.settings.updateShortcut(newShortcut)
        if (success) {
            setShortcut(newShortcut)
            setNewShortcut('')
            toast.success("Primary shortcut updated")
        } else {
            toast.error("Invalid shortcut format")
        }
    }

    const handleUpdateCamouflage = async () => {
        if (!newCamouflageShortcut.trim()) return
        const success = await window.api.settings.updateCamouflageShortcut(newCamouflageShortcut)
        if (success) {
            setCamouflageShortcut(newCamouflageShortcut)
            setNewCamouflageShortcut('')
            toast.success("Camouflage shortcut updated")
        } else {
            toast.error("Invalid shortcut format")
        }
    }

    const saveNudgeSettings = async () => {
        try {
            await window.api.settings.updateNudgeSeconds(Math.max(1, nudgeDelay));
            await window.api.settings.updateNudgeTimeout(Math.max(1, nudgeTimeout));
            toast.success("Nudge preferences saved");
        } catch (e) {
            toast.error("Failed to save preferences");
        }
    }

    const handleResetNudges = async () => {
        try {
            await window.api.settings.resetNudgeSettings();
            await fetchSettings();
            toast.success("Nudge preferences restored to defaults");
        } catch (e) {
            toast.error("Failed to reset preferences");
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Application Settings</h2>
                <p className="text-sm text-zinc-500 font-medium">Configure global shortcuts and behavioral preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Primary Shortcut */}
                <Card className="border-zinc-200 shadow-none bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-900">Primary Shortcut</CardTitle>
                            <CardDescription className="text-xs">Start/Stop session</CardDescription>
                        </div>
                        <Keyboard className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex items-center justify-center">
                            <span className="text-2xl font-black text-zinc-900 tracking-tight">
                                {formatShortcutDisplay(newShortcut || shortcut)}
                            </span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                variant={isRecordingPrimary ? "secondary" : "outline"}
                                size="sm"
                                className={cn(
                                    "w-full text-xs h-10 border-dashed transition-all font-bold",
                                    isRecordingPrimary && "border-blue-500 bg-blue-50 text-blue-600 animate-pulse"
                                )}
                                onClick={() => {
                                    setIsRecordingPrimary(true);
                                    setIsRecordingCamouflage(false);
                                    setNewShortcut("");
                                }}
                            >
                                <Keyboard className="w-3 h-3 mr-2" />
                                {isRecordingPrimary ? "Press keys..." : "Record New"}
                            </Button>
                            
                            {newShortcut && !isRecordingPrimary && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="flex-1 text-xs h-9 bg-zinc-900 font-bold"
                                        onClick={handleUpdatePrimary}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs h-9 font-bold"
                                        onClick={() => setNewShortcut("")}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Camouflage Shortcut */}
                <Card className="border-zinc-200 shadow-none bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-900">Camouflage</CardTitle>
                            <CardDescription className="text-xs">Toggle discrete mode</CardDescription>
                        </div>
                        <Shield className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex items-center justify-center">
                            <span className="text-2xl font-black text-zinc-900 tracking-tight">
                                {formatShortcutDisplay(newCamouflageShortcut || camouflageShortcut)}
                            </span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                variant={isRecordingCamouflage ? "secondary" : "outline"}
                                size="sm"
                                className={cn(
                                    "w-full text-xs h-10 border-dashed transition-all font-bold",
                                    isRecordingCamouflage && "border-blue-500 bg-blue-50 text-blue-600 animate-pulse"
                                )}
                                onClick={() => {
                                    setIsRecordingCamouflage(true);
                                    setIsRecordingPrimary(false);
                                    setNewCamouflageShortcut("");
                                }}
                            >
                                <Shield className="w-3 h-3 mr-2" />
                                {isRecordingCamouflage ? "Press keys..." : "Record New"}
                            </Button>
                            
                            {newCamouflageShortcut && !isRecordingCamouflage && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="flex-1 text-xs h-9 bg-zinc-900 font-bold"
                                        onClick={handleUpdateCamouflage}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs h-9 font-bold"
                                        onClick={() => setNewCamouflageShortcut("")}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Nudge Settings */}
                <Card className="border-zinc-200 shadow-none bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-900">Smart Nudge</CardTitle>
                            <CardDescription className="text-xs">Behavioral reminders</CardDescription>
                        </div>
                        <Bell className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <TimeInput 
                                label="Inactivity Delay" 
                                value={nudgeDelay} 
                                onChange={setNudgeDelay}
                                id="nudge-delay"
                                description="Time to wait before asking to start a new session."
                            />
                            
                            <TimeInput 
                                label="Auto-Dismiss" 
                                value={nudgeTimeout} 
                                onChange={setNudgeTimeout}
                                id="nudge-timeout"
                                description="How long the reminder window stays visible."
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={handleResetNudges}
                                className="flex-1 h-10 border-red-50 text-red-500 hover:bg-red-50 font-bold text-[10px] uppercase tracking-widest"
                            >
                                Reset
                            </Button>
                            <Button
                                onClick={saveNudgeSettings}
                                className="flex-[2] h-10 bg-zinc-900 text-white font-bold text-[10px] uppercase tracking-widest"
                            >
                                Save Prefs
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

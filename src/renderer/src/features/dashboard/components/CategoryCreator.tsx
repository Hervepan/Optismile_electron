import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { parseHumanToSeconds, formatSecondsToHuman } from "../../../lib/time"

interface CategoryCreatorProps {
    onSubmit: (name: string, targetTime: number | null) => Promise<void>
    className?: string
}

export function CategoryCreator({ onSubmit, className }: CategoryCreatorProps) {
    const [name, setName] = useState("")
    const [target, setTarget] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Parse target to seconds
    const targetSeconds = target.trim() ? parseHumanToSeconds(target) : null

    // Validation: Name is required. Target is optional, but if provided, must be > 0
    const isTargetInputValid = !target.trim() || (targetSeconds !== null && targetSeconds > 0)

    const handleSubmit = async () => {
        if (!name || !isTargetInputValid) return

        setIsSubmitting(true)
        try {
            await onSubmit(name, targetSeconds)
            setName("")
            setTarget("")
        } catch (err) {
            console.error("Failed to create category:", err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <Card className={`border-zinc-200 shadow-none bg-white ${className || ''}`}>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="category-name" className="text-sm font-medium">Category Name</Label>
                        <Input
                            id="category-name"
                            value={name}
                            placeholder='Acte: Détartrage'
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="border-zinc-200 h-10"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="category-target" className="text-sm font-medium">Target Time <span className="text-zinc-400 font-normal">(Optional)</span></Label>
                        <Input
                            id="category-target"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Format: 1h30, 90"
                            className={`border-zinc-200 h-10 ${!isTargetInputValid ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        />
                        <div className="flex justify-between items-center h-5">
                            <p className={`text-[10px] uppercase font-bold tracking-tight ${!isTargetInputValid ? 'text-red-500' : 'text-zinc-400'}`}>
                                {!isTargetInputValid ? 'Invalid format' : ''}
                            </p>
                            {targetSeconds !== null && targetSeconds > 0 && (
                                <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-sm tracking-tight">
                                    {formatSecondsToHuman(targetSeconds)}
                                </span>
                            )}
                        </div>
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={!name || !isTargetInputValid || isSubmitting}
                        className="w-full bg-zinc-900 text-white hover:bg-zinc-800 flex items-center justify-center gap-2 h-10 shadow-sm"
                    >
                        <div className="flex items-center text-sm font-semibold">
                            <Plus className="h-4 w-4 mr-2" />
                            {isSubmitting ? 'Adding...' : 'Add Category'}
                        </div>
                        {!isSubmitting && (
                            <span className="text-[10px] text-white/50 bg-white/10 px-1.5 py-0.5 rounded border border-white/5 font-medium">Enter</span>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

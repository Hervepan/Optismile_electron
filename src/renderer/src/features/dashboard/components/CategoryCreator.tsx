import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TimeInput } from "@/components/ui/time-input"
import { saveCategory } from "@lib/supabase/database"

interface CategoryCreatorProps {
    onSubmit: (name: string, targetTime: number | null) => Promise<void>
    className?: string
}

export function CategoryCreator({ onSubmit, className }: CategoryCreatorProps) {
    const [name, setName] = useState("")
    const [targetSeconds, setTargetSeconds] = useState<number>(0)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!name) return

        setIsSubmitting(true)
        try {
            await onSubmit(name, targetSeconds > 0 ? targetSeconds : null)
            setName("")
            setTargetSeconds(0)
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
                <div className="space-y-4 pt-6">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="category-name" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Category Name</Label>
                        <Input
                            id="category-name"
                            value={name}
                            placeholder='Acte: Détartrage'
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="border-zinc-200 h-10 text-sm font-bold focus-visible:ring-zinc-900"
                        />
                    </div>
                    
                    <TimeInput 
                        label="Target Time (Optional)"
                        value={targetSeconds}
                        onChange={setTargetSeconds}
                        placeholder="Format: 1h30, 90"
                        id="category-target"
                    />

                    <Button
                        onClick={handleSubmit}
                        disabled={!name || isSubmitting}
                        className="w-full bg-zinc-900 text-white hover:bg-zinc-800 flex items-center justify-center gap-2 h-10 shadow-sm mt-2"
                    >
                        <div className="flex items-center text-sm font-bold uppercase tracking-widest">
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

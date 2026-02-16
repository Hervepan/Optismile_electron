import { useState, useEffect } from 'react'
import { getCategories, saveSession, saveCategory, type Category } from '../../../lib/supabase/database'
import { Loader2, X, Plus, ArrowLeft } from 'lucide-react'
import { Button } from "../../../components/ui/button"
import { Textarea } from "../../../components/ui/textarea"
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from "../../../components/ui/combobox"
import { CategoryCreator } from "../../dashboard/components/CategoryCreator"

export function CategorySelector({ duration, onSaved, isAuthenticated }: any) {
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [isLoadingCategories, setIsLoadingCategories] = useState(true)

    const fetchCategories = async () => {
        try {
            setIsLoadingCategories(true)
            const data = await getCategories()
            setCategories(data)
            return data
        } catch (err) {
            console.error(err)
            return []
        } finally {
            setIsLoadingCategories(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleSaveSession = async () => {
        if (!selectedCategory || !isAuthenticated || loading) return
        setLoading(true)
        try {
            await saveSession(duration, selectedCategory.id, comment)
            onSaved()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateCategory = async (name: string, targetTime: number | null) => {
        try {
            const newCat = await saveCategory(name, targetTime)
            const updated = await fetchCategories() // This updates the 'categories' state
            
            if (newCat) {
                // Important: Find the matching object from the REFRESHED list
                // to ensure strict equality in the Combobox
                const match = updated.find((c: Category) => c.id === newCat.id)
                setSelectedCategory(match || newCat)
            }
            setIsCreating(false) // Go back to the selection view
        } catch (err) {
            console.error("Failed to create and assign category:", err)
        }
    }

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault()
                handleSaveSession()
            }
        }
        window.addEventListener('keydown', handleGlobalKeyDown)
        return () => window.removeEventListener('keydown', handleGlobalKeyDown)
    }, [selectedCategory, comment, duration, isAuthenticated, loading])

    if (isCreating) {
        return (
            <div className="flex flex-col h-full bg-white text-zinc-900 font-sans">
                <header className="drag-handle p-4 border-b border-zinc-100 flex items-center gap-2 cursor-default select-none">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCreating(false)}
                        className="no-drag h-8 w-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="font-semibold text-sm uppercase tracking-tight text-zinc-400">New Category</h2>
                </header>
                <div className="flex-1 p-6 overflow-y-auto no-drag">
                    <CategoryCreator
                        onSubmit={handleCreateCategory}
                        className="border-none shadow-none p-0"
                    />
                </div>
            </div>
        )
    }
    
    return (
        <div className="flex flex-col h-full bg-white text-zinc-900 font-sans">
             <header className="drag-handle p-4 border-b border-zinc-100 flex items-center justify-between cursor-default select-none">
                <div className="flex items-center gap-3">
                    <h2 className="font-semibold text-sm uppercase tracking-tight text-zinc-400">Save Session</h2>
                    <div className="px-2 py-1 bg-zinc-100 rounded text-[10px] font-bold text-zinc-500">
                        {Math.floor(duration / 60)}m {duration % 60}s
                    </div>
                </div>
                <button 
                    onClick={() => window.close()} 
                    className="no-drag p-1.5 hover:bg-zinc-100 rounded-md text-zinc-400 hover:text-zinc-900 transition-colors"
                    title="Close"
                >
                    <X size={18} />
                </button>
            </header>
            
            <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Category</label>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-zinc-500 hover:text-zinc-900 h-6 px-2 no-drag"
                            onClick={() => setIsCreating(true)}
                        >
                            <Plus className="w-3 h-3 mr-1" />
                            New
                        </Button>
                    </div>

                    {isLoadingCategories ? (
                        <div className="h-12 border border-zinc-200 rounded-md flex items-center px-4 gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                            <span className="text-sm text-zinc-400">Loading categories...</span>
                        </div>
                    ) : (
                        <Combobox
                            items={categories}
                            itemToStringLabel={(category: Category) => category.name}
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                            autoHighlight
                            defaultOpen={true}
                        >
                            <ComboboxInput placeholder="Select category..." autoFocus className="no-drag" />
                            <ComboboxContent className="no-drag">
                                <ComboboxEmpty>No category found.</ComboboxEmpty>
                                <ComboboxList>
                                    {(item: Category) => (
                                        <ComboboxItem key={item.id} value={item}>
                                            {item.name}
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Comment</label>
                    <Textarea 
                        placeholder="Comment (Optional) (Shift+Enter to save)" 
                        value={comment} 
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full min-h-32 p-4 border border-zinc-200 rounded-md focus-visible:ring-zinc-900 transition-all text-sm font-medium no-drag"
                    />
                </div>
            </div>

            <footer className="p-4 bg-zinc-50 border-t border-zinc-100 flex gap-3">
                <Button 
                    variant="outline"
                    onClick={() => window.close()} 
                    className="flex-1 h-12 bg-white text-zinc-600 rounded-md font-bold tracking-wide hover:bg-zinc-100 transition-all active:scale-[0.98] no-drag border-zinc-200"
                >
                    CANCEL
                </Button>
                <Button 
                    onClick={handleSaveSession} disabled={!selectedCategory || loading}
                    className="flex-[2] h-12 bg-zinc-900 text-white rounded-md font-bold tracking-wide hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 no-drag"
                >
                    {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'SAVE SESSION'}
                </Button>
            </footer>
        </div>
    )
}

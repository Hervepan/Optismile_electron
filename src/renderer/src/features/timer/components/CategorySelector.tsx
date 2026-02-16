import { useState, useEffect } from 'react'
import { getCategories, saveSession, type Category } from '../../../lib/supabase/database'
import { ChevronDown, Loader2, X } from 'lucide-react'

export function CategorySelector({ duration, onSaved, isAuthenticated }: any) {
    const [categories, setCategories] = useState<Category[]>([])
    const [selected, setSelected] = useState<Category | null>(null)
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getCategories().then(setCategories)
    }, [])

    const handleSave = async () => {
        if (!selected || !isAuthenticated) return
        setLoading(true)
        try {
            await saveSession(duration, selected.id, comment)
            onSaved()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
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
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Category</label>
                    <div className="relative group">
                        <select 
                            className="w-full h-12 px-4 appearance-none rounded-md border border-zinc-200 bg-white text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all cursor-pointer"
                            onChange={(e) => setSelected(categories.find(c => c.id === e.target.value) || null)}
                            value={selected?.id || ''}
                        >
                            <option value="" disabled>Select a category...</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none transition-colors" size={16} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Comment</label>
                    <textarea 
                        placeholder="What did you achieve?" value={comment} onChange={(e) => setComment(e.target.value)}
                        className="w-full h-32 p-4 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all text-sm font-medium resize-none"
                    />
                </div>
            </div>

            <footer className="p-4 bg-zinc-50 border-t border-zinc-100 flex gap-3">
                <button 
                    onClick={() => window.close()} 
                    className="flex-1 h-12 bg-zinc-100 text-zinc-600 rounded-md font-bold tracking-wide hover:bg-zinc-200 transition-all active:scale-[0.98]"
                >
                    CANCEL
                </button>
                <button 
                    onClick={handleSave} disabled={!selected || loading}
                    className="flex-[2] h-12 bg-zinc-900 text-white rounded-md font-bold tracking-wide hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
                >
                    {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'SAVE SESSION'}
                </button>
            </footer>
        </div>
    )
}

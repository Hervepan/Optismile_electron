import { useState, useEffect } from 'react'
import { Pencil, Trash2, Check, X, Loader2, FolderPlus, Keyboard } from 'lucide-react'
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../../components/ui/alert-dialog"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../../components/ui/card"
import {
    saveCategory,
    getCategories,
    deleteCategory,
    updateCategory,
    formatSecondsToHuman,
    parseHumanToSeconds,
    type Category
} from "@lib/supabase/database"
import { CategoryCreator } from "./CategoryCreator"

export function CategoryManager() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [shortcut, setShortcut] = useState<string>("Alt+J")
    const [newShortcut, setNewShortcut] = useState("")

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState("")
    const [editingTarget, setEditingTarget] = useState("")
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

    useEffect(() => {
        fetchCategories()
        fetchShortcut()
    }, [])

    const fetchShortcut = () => {
        window.api.settings.getShortcut().then((s: string) => {
            if (s) setShortcut(s)
        })
    }

    const formatShortcutDisplay = (s: string) => {
        if (!s) return "";
        return s.split('+').map(part => {
            if (part.length === 1) return part.toUpperCase();
            return part.charAt(0).toUpperCase() + part.slice(1);
        }).join('+');
    }

    const handleUpdateShortcut = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newShortcut.trim()) return
        
        const success = await window.api.settings.updateShortcut(newShortcut)
        if (success) {
            setShortcut(newShortcut)
            setNewShortcut('')
            toast.success("Shortcut updated successfully")
        } else {
            toast.error("Invalid shortcut format")
        }
    }

    const fetchCategories = async () => {
        try {
            const data = await getCategories()
            setCategories(data || [])
        } catch (err) {
            console.error("Failed to fetch categories:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreate = async (name: string, targetTime: number | null) => {
        try {
            await saveCategory(name, targetTime)
            toast.success(`Category "${name}" created`)
            await fetchCategories()
        } catch (err) {
            toast.error("Failed to create category")
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteCategory(id)
            toast.success("Category deleted")
            fetchCategories()
        } catch (err) {
            toast.error("Failed to delete category")
            console.error("Failed to delete category:", err)
        } finally {
            setCategoryToDelete(null)
        }
    }

    const handleUpdate = async (id: string) => {
        try {
            const targetSeconds = editingTarget.trim() ? parseHumanToSeconds(editingTarget) : null
            await updateCategory(id, editingName, targetSeconds)
            toast.success("Category updated")
            setEditingId(null)
            fetchCategories()
        } catch (err) {
            toast.error("Failed to update category")
            console.error("Failed to update category:", err)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <CategoryCreator onSubmit={handleCreate} />

                 <Card className="border-zinc-200 shadow-none bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Global Shortcut</CardTitle>
                        <Keyboard className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mb-4">{formatShortcutDisplay(shortcut)}</div>
                        <p className="text-xs text-zinc-500 mb-4">Launch acquisition session</p>
                        
                        <form onSubmit={handleUpdateShortcut} className="space-y-3">
                            <Input 
                                placeholder="e.g. Alt+J" 
                                value={newShortcut}
                                onChange={(e) => setNewShortcut(e.target.value)}
                                className="h-9 text-sm border-zinc-200"
                            />
                            <Button 
                                type="submit"
                                variant="outline" 
                                size="sm" 
                                className="w-full text-xs h-8"
                            >
                                <Keyboard className="w-3 h-3 mr-2" />
                                Update
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-2">
                {isLoading ? (
                    <div className="flex items-center justify-center min-h-[200px] border border-zinc-200 rounded-xl bg-white/50">
                        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.length > 0 ? (
                            categories.map((cat) => {
                                const editingTargetSeconds = editingId === cat.id && editingTarget.trim() 
                                    ? parseHumanToSeconds(editingTarget) 
                                    : null;

                                return (
                                    <Card key={cat.id} className="border-zinc-200 shadow-none bg-white transition-all hover:border-blue-300 hover:shadow-sm group">
                                        {editingId === cat.id ? (
                                            <div className="p-4 flex flex-col gap-3">
                                                <div className="flex flex-col gap-2">
                                                     <label className="text-xs font-medium text-zinc-500">Name</label>
                                                     <Input
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                        className="h-8 text-sm"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                     <label className="text-xs font-medium text-zinc-500">Target Time</label>
                                                     <Input
                                                        value={editingTarget}
                                                        onChange={(e) => setEditingTarget(e.target.value)}
                                                        className="h-8 text-sm"
                                                        placeholder="e.g. 25m"
                                                    />
                                                    {editingTargetSeconds !== null && editingTargetSeconds > 0 && (
                                                        <div className="flex justify-end">
                                                            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded-sm tracking-tight">
                                                                {formatSecondsToHuman(editingTargetSeconds)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingId(null)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" className="h-7 w-7 p-0" onClick={() => handleUpdate(cat.id)}>
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-xl font-bold text-zinc-900 truncate pr-2" title={cat.name}>
                                                        {cat.name}
                                                    </CardTitle>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                         <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-6 w-6 text-zinc-400 hover:text-blue-600"
                                                            onClick={() => {
                                                                setEditingId(cat.id)
                                                                setEditingName(cat.name)
                                                                setEditingTarget(cat.target_time ? formatSecondsToHuman(cat.target_time) : "")
                                                            }}
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                        </Button>
                                                         <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-6 w-6 text-zinc-400 hover:text-red-600"
                                                            onClick={() => setCategoryToDelete(cat)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-sm text-zinc-500 font-medium">
                                                        Target: <span className="text-zinc-900">{cat.target_time ? formatSecondsToHuman(cat.target_time) : "None"}</span>
                                                    </div>
                                                </CardContent>
                                            </>
                                        )}
                                    </Card>
                                );
                            })
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-200 rounded-xl bg-slate-50/50">
                                <div className="bg-blue-50 p-3 rounded-full mb-3 shadow-sm border border-blue-100">
                                    <FolderPlus className="h-6 w-6 text-blue-400" />
                                </div>
                                <p className="text-sm text-zinc-600 font-medium">No categories yet</p>
                                <p className="text-xs text-zinc-400 mt-1">Create your first activity category.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the <span className="font-bold text-zinc-900">"{categoryToDelete?.name}"</span> category and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => categoryToDelete && handleDelete(categoryToDelete.id)}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

import { Pencil, Trash2, Check, X, Loader2, FolderPlus } from 'lucide-react'
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { toast } from 'sonner'
import { TimeInput } from "@/components/ui/time-input"
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
    countSessionsByCategory,
    type Category
} from "@lib/supabase/database"
import { formatSecondsToHuman } from "@lib/time"
import { CategoryCreator } from "./CategoryCreator"
import { useState, useEffect } from "react";

export function CategoryManager() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState("")
    const [editingTargetSeconds, setEditingTargetSeconds] = useState<number>(0)
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
    const [associatedSessionsCount, setAssociatedSessionsCount] = useState<number>(0)
    const [isCheckingSessions, setIsCheckingSessions] = useState(false)

    useEffect(() => {
        fetchCategories()
    }, [])

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

    const handlePrepareDelete = async (cat: Category) => {
        setIsCheckingSessions(true)
        try {
            const count = await countSessionsByCategory(cat.id)
            setAssociatedSessionsCount(count)
            setCategoryToDelete(cat)
        } catch (err) {
            toast.error("Error checking category sessions")
        } finally {
            setIsCheckingSessions(false)
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
            await updateCategory(id, editingName, editingTargetSeconds > 0 ? editingTargetSeconds : null)
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
                                return (
                                    <Card key={cat.id} className="border-zinc-200 shadow-none bg-white transition-all hover:border-blue-300 hover:shadow-sm group">
                                        {editingId === cat.id ? (
                                            <div className="p-4 flex flex-col gap-3">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Name</label>
                                                    <Input
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                        className="h-9 text-sm font-bold border-zinc-200 focus-visible:ring-zinc-900"
                                                        autoFocus
                                                    />
                                                </div>
                                                
                                                <TimeInput 
                                                    label="Target Time"
                                                    value={editingTargetSeconds}
                                                    onChange={setEditingTargetSeconds}
                                                    placeholder="e.g. 25m"
                                                    id={`edit-target-${cat.id}`}
                                                />

                                                <div className="flex justify-end gap-2 mt-2">
                                                    <Button size="sm" variant="ghost" className="h-8 font-bold text-xs uppercase tracking-widest text-zinc-500" onClick={() => setEditingId(null)}>
                                                        Cancel
                                                    </Button>
                                                    <Button size="sm" className="h-8 bg-zinc-900 font-bold text-xs uppercase tracking-widest" onClick={() => handleUpdate(cat.id)}>
                                                        Save
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
                                                                setEditingTargetSeconds(cat.target_time || 0)
                                                            }}
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            disabled={isCheckingSessions}
                                                            className="h-6 w-6 text-zinc-400 hover:text-red-600"
                                                            onClick={() => handlePrepareDelete(cat)}
                                                        >
                                                            {isCheckingSessions ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                                        </Button>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-xs text-zinc-400 font-bold uppercase tracking-widest">
                                                        Target: <span className="text-zinc-900 font-black">{cat.target_time ? formatSecondsToHuman(cat.target_time) : "None"}</span>
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
                        <AlertDialogTitle>
                            {associatedSessionsCount > 0 ? "Category is Locked" : "Are you absolutely sure?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {associatedSessionsCount > 0 ? (
                                <>
                                    The category <span className="font-bold text-zinc-900">"{categoryToDelete?.name}"</span> has <span className="font-bold text-red-600">{associatedSessionsCount} sessions</span> associated with it.
                                    <br /><br />
                                    To maintain data integrity, you must delete these sessions in the <span className="font-medium text-zinc-900">History</span> tab before this category can be removed.
                                </>
                            ) : (
                                <>
                                    This will permanently delete the <span className="font-bold text-zinc-900">"{categoryToDelete?.name}"</span> category. This action cannot be undone.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {associatedSessionsCount > 0 ? "Close" : "Cancel"}
                        </AlertDialogCancel>
                        {associatedSessionsCount === 0 && (
                            <AlertDialogAction
                                onClick={() => categoryToDelete && handleDelete(categoryToDelete.id)}
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
                            >
                                Delete
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

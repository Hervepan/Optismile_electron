import { useEffect, useState } from 'react'
import { supabase } from '@lib/supabase/client'
import { CategoryManager } from '@/features/dashboard/components/CategoryManager'
import { HistorySection } from '@/features/dashboard/components/HistorySection'
import { User } from '@supabase/supabase-js'
import { 
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger 
} from "@/components/ui/tabs"
import { 
    LayoutDashboard, 
    History, 
    BarChart3, 
    LogOut
} from 'lucide-react'

export function DashboardPage({ user }: { user: User }) {
    // Initialize tab from localStorage, default to 'activities'
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('optismile_dashboard_tab') || 'activities')

    const handleTabChange = (value: string) => {
        setActiveTab(value)
        localStorage.setItem('optismile_dashboard_tab', value)
    }

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans select-none">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container max-w-[1400px] mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <img src="icons/optismile.png" alt="OptiSmile" className="h-8 w-8" />
                                <span className="text-xl font-bold tracking-tight text-primary">OptiSmile</span>
                            </div>
                            
                            <TabsList className="hidden md:flex bg-transparent p-0 gap-2">
                                <TabsTrigger 
                                    value="activities" 
                                    className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-blue-100 rounded-md px-3 transition-all"
                                >
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Activities
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="history" 
                                    className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-blue-100 rounded-md px-3 transition-all"
                                >
                                    <History className="w-4 h-4 mr-2" />
                                    History
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="statistics" 
                                    className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-blue-100 rounded-md px-3 transition-all"
                                >
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Statistics
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end mr-2">
                                <span className="text-sm font-semibold text-zinc-900 leading-none mb-1">{user.email?.split('@')[0]}</span>
                                <span className="text-[10px] text-zinc-400 font-medium">{user.email}</span>
                            </div>
                            <button 
                                onClick={() => supabase.auth.signOut()}
                                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all active:scale-95"
                                title="Sign Out"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="container max-w-[1400px] mx-auto p-4 sm:p-8 space-y-6">
                    <TabsContent value="activities" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                        <CategoryManager />
                    </TabsContent>
                    
                    <TabsContent value="history" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                        <HistorySection />
                    </TabsContent>

                    <TabsContent value="statistics" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 border border-dashed border-zinc-200 rounded-xl bg-white/50">
                            <div className="rounded-full bg-primary/5 p-6">
                                <BarChart3 className="h-12 w-12 text-zinc-300" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">Performance Statistics</h2>
                            <p className="text-muted-foreground max-w-md text-sm">Porting from extension in the next step.</p>
                        </div>
                    </TabsContent>
                </main>
            </Tabs>
        </div>
    )
}

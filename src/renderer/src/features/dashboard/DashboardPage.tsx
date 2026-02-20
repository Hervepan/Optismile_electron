import { useState } from 'react'
import { supabase } from '@lib/supabase/client'
import { CategoryManager } from '@/features/dashboard/components/CategoryManager'
import { HistorySection } from '@/features/dashboard/components/HistorySection'
import { StatisticsSection } from '@/features/dashboard/components/stats/StatisticsSection'
import { SettingsSection } from '@/features/dashboard/components/SettingsSection'
import { useSessionsFetch } from '@/features/dashboard/hooks/useSessionsFetch'
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
    LogOut,
    Settings2,
    Loader2
} from 'lucide-react'

export function DashboardPage({ user }: { user: User }) {
    // Initialize tab from localStorage, default to 'activities'
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('optismile_dashboard_tab') || 'activities')
    
    // Centralized session data for the entire dashboard
    const { sessions, isLoading, refetch } = useSessionsFetch()

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
                                <TabsTrigger 
                                    value="settings" 
                                    className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-blue-100 rounded-md px-3 transition-all"
                                >
                                    <Settings2 className="w-4 h-4 mr-2" />
                                    Settings
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex items-center gap-4">
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />}
                            <div className="flex items-center gap-2 py-1 px-3 bg-zinc-50 rounded-full border border-zinc-100">
                                <div className="h-6 w-6 rounded-full bg-white border border-zinc-200 flex items-center justify-center">
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase">{user.email?.[0]}</div>
                                </div>
                                <span className="text-xs font-semibold text-zinc-600 truncate max-w-[200px]">
                                    {user.email}
                                </span>
                            </div>
                            <button 
                                onClick={() => supabase.auth.signOut()}
                                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-95"
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
                        <HistorySection sessions={sessions} isLoading={isLoading} onRefresh={refetch} />
                    </TabsContent>

                    <TabsContent value="statistics" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                        <StatisticsSection sessions={sessions} isLoading={isLoading} />
                    </TabsContent>

                    <TabsContent value="settings" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                        <SettingsSection />
                    </TabsContent>
                </main>
            </Tabs>
        </div>
    )
}

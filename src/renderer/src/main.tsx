import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { supabase } from './lib/supabase/client'
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  handleAuthCallback 
} from './lib/supabase/auth'
import { Clock, LayoutDashboard, History, BarChart3, LogOut, Play, Square } from 'lucide-react'

/**
 * PIP VIEW: Optimized for the small timer window.
 * This is the view that stays on top.
 */
function PipView() {
    return (
        <div className="h-screen w-screen bg-zinc-900/95 text-white flex items-center justify-between p-4 rounded-3xl border border-white/10 overflow-hidden select-none" style={{ WebkitAppRegion: 'drag' } as any}>
            <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' } as any}>
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Clock size={20} className="text-white" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter leading-none mb-1">Deep Work</span>
                    <span className="text-2xl font-black tabular-nums leading-none">25:00</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
                <button className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90 text-zinc-400 hover:text-white">
                    <Play size={18} fill="currentColor" />
                </button>
                <button className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90 text-zinc-400 hover:text-white">
                    <Square size={16} fill="currentColor" />
                </button>
            </div>
        </div>
    )
}

/**
 * MAIN DASHBOARD: Full-screen options/dashboard view.
 * This is where the user manages activities and views history.
 */
function MainDashboard({ user }: { user: any }) {
    const [activeTab, setActiveTab] = useState('activities')

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans select-none">
            <header className="h-20 border-b bg-white flex items-center justify-between px-10 sticky top-0 z-10">
                <div className="flex items-center gap-12">
                    <div className="flex items-center gap-3">
                        <img src="icons/optismile.png" alt="Logo" className="w-10 h-10" />
                        <span className="text-2xl font-black tracking-tighter text-zinc-900">OPTISMILE</span>
                    </div>
                    
                    <nav className="flex items-center gap-2">
                        {[
                            { id: 'activities', label: 'Activities', icon: LayoutDashboard },
                            { id: 'history', label: 'History', icon: History },
                            { id: 'statistics', label: 'Statistics', icon: BarChart3 },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                    activeTab === tab.id 
                                    ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-900/20' 
                                    : 'text-zinc-500 hover:bg-zinc-100'
                                }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-5">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-zinc-900 leading-none mb-1 uppercase tracking-tight">{user.email?.split('@')[0]}</span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{user.email}</span>
                    </div>
                    <button 
                        onClick={() => supabase.auth.signOut()}
                        className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-95"
                    >
                        <LogOut size={22} />
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-12">
                <div className="mb-12">
                    <h2 className="text-5xl font-black text-zinc-900 capitalize tracking-tighter mb-2">{activeTab}</h2>
                    <p className="text-zinc-500 text-lg font-medium">Monitor your productivity flow and task history.</p>
                </div>

                <div className="bg-white rounded-[48px] border border-zinc-100 shadow-sm min-h-[500px] flex flex-col items-center justify-center text-center p-20">
                    <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-8 text-zinc-200">
                        {activeTab === 'activities' && <LayoutDashboard size={48} />}
                        {activeTab === 'history' && <History size={48} />}
                        {activeTab === 'statistics' && <BarChart3 size={48} />}
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Empty {activeTab}</h3>
                    <p className="text-zinc-400 max-w-sm mt-3 text-base font-semibold leading-relaxed">
                        It looks like you haven't started any focus sessions yet. Use <kbd className="bg-zinc-100 px-2 py-1 rounded text-zinc-600 font-bold">Alt+V</kbd> to open the timer.
                    </p>
                </div>
            </main>
        </div>
    )
}

/**
 * AUTH VIEW: Shared login/signup screen with Email and Google support.
 */
function AuthView({ isSignUp, setIsSignUp, email, setEmail, password, setPassword, error, handleAuth }: any) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 font-sans">
            <div className="w-full max-w-sm flex flex-col items-center">
                <header className="mb-12 text-center">
                    <div className="w-28 h-28 bg-white rounded-[40px] shadow-2xl flex items-center justify-center p-5 mb-8 mx-auto border border-zinc-100">
                        <img src="icons/optismile.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">OPTISMILE</h1>
                    <p className="text-zinc-500 text-lg font-medium mt-2">{isSignUp ? 'Create your account' : 'Welcome back'}</p>
                </header>

                <form onSubmit={handleAuth} className="w-full space-y-4">
                    <input 
                        type="email" placeholder="Email" value={email} required
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-16 px-6 rounded-[24px] border-2 border-zinc-100 bg-white text-lg font-medium focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-300"
                    />
                    <input 
                        type="password" placeholder="Password" value={password} required
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-16 px-6 rounded-[24px] border-2 border-zinc-100 bg-white text-lg font-medium focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-300"
                    />
                    {error && <p className="text-red-500 text-sm text-center font-bold px-4">{error}</p>}
                    <button type="submit" className="w-full h-16 bg-zinc-900 text-white rounded-[24px] font-black text-xl hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-xl shadow-zinc-900/20">
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <div className="flex items-center w-full my-10 px-4">
                    <div className="flex-1 h-0.5 bg-zinc-100" />
                    <span className="px-6 text-zinc-300 text-xs font-black tracking-[0.2em] uppercase">or</span>
                    <div className="flex-1 h-0.5 bg-zinc-100" />
                </div>

                <button 
                    type="button"
                    onClick={() => signInWithGoogle()} 
                    className="w-full h-16 bg-white border-2 border-zinc-100 text-zinc-900 rounded-[24px] font-bold text-lg hover:bg-zinc-50 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-4"
                >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                <p className="mt-12 text-zinc-400 text-base font-medium">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button onClick={() => setIsSignUp(!isSignUp)} className="text-zinc-900 font-black hover:underline ml-1">
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    )
}

function App() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const params = new URLSearchParams(window.location.search);
    const isPip = params.get('mode') === 'pip';

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user ?? null)
        })

        const removeListener = (window as any).api.auth.onCallback((url: string) => {
            handleAuthCallback(url);
        });

        return () => {
            subscription.unsubscribe()
            removeListener()
        }
    }, [])

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        try {
            if (isSignUp) {
                const { data, error: signupError } = await signUpWithEmail(email, password)
                if (signupError) throw signupError;
                if (!data.session && data.user) {
                   setError("Confirmation email sent. Please check your inbox.")
                }
            } else {
                await signInWithEmail(email, password)
            }
        } catch (err: any) {
            setError(err.message)
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center text-lg font-black text-zinc-300 tracking-tighter">OPTISMILE...</div>

    if (isPip) return <PipView />

    if (user) return <MainDashboard user={user} />

    return (
        <AuthView 
            isSignUp={isSignUp} 
            setIsSignUp={setIsSignUp}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            error={error}
            handleAuth={handleAuth}
        />
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)

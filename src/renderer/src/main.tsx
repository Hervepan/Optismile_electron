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

function App() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user ?? null)
        })

        const removeListener = (window as any).api.auth.onCallback((url: string) => {
            console.log("Deep link received in renderer:", url);
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
                await signUpWithEmail(email, password)
                alert("Check your email!")
            } else {
                await signInWithEmail(email, password)
            }
        } catch (err: any) {
            setError(err.message)
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center text-lg font-medium text-zinc-400">Loading Optismile...</div>

    if (user) return (
        <div className="flex h-screen flex-col items-center justify-center bg-zinc-50 p-6 text-center">
            <h1 className="text-2xl font-bold mb-6">Hello, {user.email}</h1>
            <p className="mb-6 text-zinc-500">You are successfully logged in.</p>
            <button onClick={() => supabase.auth.signOut()} className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-medium">
                Sign Out
            </button>
        </div>
    )

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 font-sans">
            <div className="w-full max-w-sm flex flex-col items-center">
                
                <header className="mb-10 text-center">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center p-4 mb-6 mx-auto border border-zinc-100">
                        <img src="icons/optismile.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Optismile</h1>
                    <p className="text-zinc-500 text-base mt-2">{isSignUp ? 'Create account' : 'Welcome back'}</p>
                </header>

                <form onSubmit={handleAuth} className="w-full space-y-4">
                    <input 
                        type="email" placeholder="Email" value={email} required
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-14 px-5 rounded-2xl border border-zinc-200 bg-white text-base focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all"
                    />
                    <input 
                        type="password" placeholder="Password" value={password} required
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-14 px-5 rounded-2xl border border-zinc-200 bg-white text-base focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all"
                    />
                    {error && <p className="text-red-500 text-sm text-center font-medium px-2">{error}</p>}
                    <button type="submit" className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-semibold text-lg hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-md">
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <div className="flex items-center w-full my-8 px-2">
                    <div className="flex-1 h-px bg-zinc-200" />
                    <span className="px-4 text-zinc-400 text-xs font-bold tracking-widest uppercase">or</span>
                    <div className="flex-1 h-px bg-zinc-200" />
                </div>

                <button 
                    type="button"
                    onClick={() => signInWithGoogle()} 
                    className="w-full h-14 bg-white border border-zinc-200 text-zinc-900 rounded-2xl font-semibold text-base hover:bg-zinc-50 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-3"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                <p className="mt-10 text-zinc-500 text-sm">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button onClick={() => setIsSignUp(!isSignUp)} className="text-zinc-900 font-bold hover:underline ml-1">
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>

            </div>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)

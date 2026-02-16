import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { handleAuthCallback, signUpWithEmail, signInWithEmail } from './lib/supabase/auth'
import { AuthSection } from './features/auth/AuthSection'
import { TimerPage } from './features/timer/TimerPage'
import { SaveSessionPage } from './features/timer/SaveSessionPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { Toaster, toast } from 'sonner'

export default function App() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => { 
            setUser(session?.user ?? null) 
        })
        const removeListener = window.api.auth.onCallback((url: string) => { 
            handleAuthCallback(url); 
        });
        return () => { 
            subscription.unsubscribe(); 
            removeListener(); 
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
                    toast.info("Confirmation email sent. Please check your inbox.")
                } else {
                    toast.success("Account created successfully")
                }
            } else { 
                await signInWithEmail(email, password) 
                toast.success("Welcome back!")
            }
        } catch (err: any) { 
            setError(err.message) 
            toast.error(err.message || "Authentication failed")
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center text-lg font-black text-zinc-300 tracking-tighter uppercase font-sans">OptiSmile...</div>
    
    if (mode === 'pip') return <TimerPage user={user} />
    if (mode === 'save') return <SaveSessionPage user={user} />
    
    if (user) return <DashboardPage user={user} />
    
    return (
        <>
            <Toaster position="bottom-right" richColors closeButton />
            <AuthSection 
                isSignUp={isSignUp} 
                setIsSignUp={setIsSignUp} 
                email={email} 
                setEmail={setEmail} 
                password={password} 
                setPassword={setPassword} 
                error={error} 
                handleAuth={handleAuth} 
            />
        </>
    )
}

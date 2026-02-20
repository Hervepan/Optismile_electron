import { useEffect, useState, Component, ReactNode } from 'react'
import { supabase } from '@lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { handleAuthCallback, signUpWithEmail, signInWithEmail } from '@lib/supabase/auth'
import { AuthSection } from '@/features/auth/AuthSection'
import { TimerPage } from '@/features/timer/TimerPage'
import { SaveSessionPage } from '@/features/timer/SaveSessionPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { Toaster, toast } from 'sonner'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Simple Production Error Boundary
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
    state = { hasError: false };
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen flex flex-col items-center justify-center bg-zinc-50 p-6 text-center gap-4 font-sans">
                    <div className="bg-red-50 p-4 rounded-full">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-xl font-black text-zinc-900 uppercase tracking-tighter">Something went wrong</h1>
                    <p className="text-zinc-500 text-sm max-w-xs">The application encountered an unexpected error. Your data is safe.</p>
                    <Button onClick={() => window.location.reload()} variant="default" className="bg-zinc-900">
                        <RefreshCcw className="w-4 h-4 mr-2" /> Reload Application
                    </Button>
                </div>
            );
        }
        return this.props.children;
    }
}

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
        // Handle Session & Startup
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Check for buffered deep links (Cold Start)
        window.api.auth.getPendingDeepLink().then((url: string | null) => {
            if (url) handleAuthCallback(url);
        });

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

    const renderContent = () => {
        if (loading) return <div className="flex h-screen items-center justify-center text-lg font-black text-zinc-300 tracking-tighter uppercase font-sans">OptiSmile...</div>

        if (mode === 'pip') return <TimerPage user={user} />
        if (mode === 'save') return <SaveSessionPage user={user} />

        if (user) return <DashboardPage user={user} />

        return (
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
        )
    }

    return (
        <ErrorBoundary>
            <Toaster position="bottom-right" richColors closeButton />
            {renderContent()}
        </ErrorBoundary>
    )
}

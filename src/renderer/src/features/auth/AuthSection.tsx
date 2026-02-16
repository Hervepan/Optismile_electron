import React from 'react'
import { signInWithGoogle } from '@lib/supabase/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AuthSectionProps {
    isSignUp: boolean
    setIsSignUp: (val: boolean) => void
    email: string
    setEmail: (val: string) => void
    password: string
    setPassword: (val: string) => void
    error: string | null
    handleAuth: (e: React.FormEvent) => void
}

export function AuthSection({ 
    isSignUp, 
    setIsSignUp, 
    email, 
    setEmail, 
    password, 
    setPassword, 
    error, 
    handleAuth 
}: AuthSectionProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50/50 p-6 font-sans">
            <div className="w-full max-w-sm flex flex-col items-center">
                <header className="mb-10 text-center">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center p-4 mb-6 mx-auto border border-zinc-200">
                        <img src="icons/optismile.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">OptiSmile</h1>
                    <p className="text-zinc-500 text-base mt-2">{isSignUp ? 'Create your account' : 'Welcome back'}</p>
                </header>

                <form onSubmit={handleAuth} className="w-full space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email"
                            type="email" 
                            placeholder="name@example.com" 
                            value={email} 
                            required 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="h-11 border-zinc-200 bg-white" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                            id="password"
                            type="password" 
                            placeholder="••••••••" 
                            value={password} 
                            required 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="h-11 border-zinc-200 bg-white" 
                        />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center font-medium px-4">{error}</p>}
                    
                    <Button type="submit" className="w-full h-11 bg-zinc-900 text-white font-semibold text-base shadow-sm">
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </Button>
                </form>

                <div className="flex items-center w-full my-8 px-4">
                    <div className="flex-1 h-px bg-zinc-200" />
                    <span className="px-4 text-zinc-400 text-[10px] font-bold tracking-widest uppercase">OR</span>
                    <div className="flex-1 h-px bg-zinc-200" />
                </div>

                <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => signInWithGoogle()} 
                    className="w-full h-11 bg-white border-zinc-200 text-zinc-900 font-semibold text-base shadow-xs flex items-center justify-center gap-3"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </Button>

                <p className="mt-10 text-zinc-500 text-sm font-medium">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button onClick={() => setIsSignUp(!isSignUp)} className="text-zinc-900 font-bold hover:underline ml-1">
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    )
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Loader2 } from 'lucide-react';
import AntigravityParticles from '../components/AntigravityParticles';
import WorldPinGlobe from '../components/WorldPinGlobe';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({ pass: false, confirm: false });
    const { signup, googleSignIn } = useAuth();
    const navigate = useNavigate();

    const passMismatch = touched.confirm && password !== confirmPassword && confirmPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await signup(email, password);
            toast.success('Account created successfully!');
            navigate('/my-globe');
        } catch (error) {
            toast.error('Failed to create account');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await googleSignIn();
            toast.success('Welcome!');
            navigate('/my-globe');
        } catch (error) {
            toast.error('Failed to sign up with Google');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden p-4">
            {/* subtle particle field */}
            <AntigravityParticles />

            {/* single soft spotlight, less color noise */}
            <div className="pointer-events-none absolute -top-40 -right-40 w-72 h-72 rounded-full bg-teal-500/15 blur-3xl" />

            <div className="relative w-full max-w-md rounded-3xl p-8 shadow-2xl bg-black/70 border border-white/10 backdrop-blur-2xl z-10">
                {/* Logo + title */}
                <div className="text-center mb-8 space-y-3">
                    <div className="flex justify-center">
                        <WorldPinGlobe />
                    </div>
                    <h1 className="text-3xl font-semibold text-white tracking-tight">
                        WorldPin
                    </h1>
                    <p className="text-sm text-slate-400">
                        Create your account to start pinning.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                            Email
                        </label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-teal-400 transition-colors" />
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400/70 focus:border-teal-400/70 transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                            Password
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-teal-400 transition-colors" />
                            <input
                                type="password"
                                required
                                autoComplete="new-password"
                                value={password}
                                minLength={6}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() => setTouched(t => ({ ...t, pass: true }))}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400/70 focus:border-teal-400/70 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                            Confirm Password
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-teal-400 transition-colors" />
                            <input
                                type="password"
                                required
                                autoComplete="new-password"
                                value={confirmPassword}
                                minLength={6}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onBlur={() => setTouched(t => ({ ...t, confirm: true }))}
                                className={`w-full bg-black/40 border rounded-xl py-3 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400/70 focus:border-teal-400/70 transition-colors ${passMismatch ? 'border-red-400 focus:ring-red-500' : 'border-white/10'}`}
                                placeholder="••••••••"
                            />
                        </div>
                        {passMismatch && (
                            <span className="ml-1 mt-1 block text-red-400 text-xs animate-fade-in">Passwords do not match</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium py-3 rounded-xl transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Sign Up'}
                    </button>
                </form>

                {/* Divider + Google */}
                <div className="mt-7 space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-[11px]">
                            <span className="px-3 bg-black/80 text-slate-500">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full bg-white text-slate-900 text-sm font-medium py-3 rounded-xl hover:bg-slate-100 transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            className="w-4 h-4"
                        />
                        Sign up with Google
                    </button>
                </div>

                {/* Footer link */}
                <p className="mt-6 text-center text-xs text-slate-500">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="text-teal-400 hover:text-teal-300 underline underline-offset-4"
                    >
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Loader2 } from 'lucide-react';
import AntigravityParticles from '../components/AntigravityParticles';
import WorldPinGlobe from '../components/WorldPinGlobe';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, googleSignIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/my-globe');
        } catch (error) {
            toast.error('Failed to log in. Check your email and password.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await googleSignIn();
            toast.success('Signed in with Google!');
            navigate('/my-globe');
        } catch (error) {
            toast.error('Failed to log in with Google');
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
                        Pin your journeys on a living globe.
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
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400/70 focus:border-teal-400/70 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium py-3 rounded-xl transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Log in'}
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
                        Sign in with Google
                    </button>
                </div>

                {/* Footer link */}
                <p className="mt-6 text-center text-xs text-slate-500">
                    Don&apos;t have an account?{' '}
                    <Link
                        to="/signup"
                        className="text-teal-400 hover:text-teal-300 underline underline-offset-4"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

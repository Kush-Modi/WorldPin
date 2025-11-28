import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User, type Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signup: (email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    googleSignIn: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            // Ensure profile exists (in case trigger failed or old user)
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', session.user.id)
                    .single();

                if (!profile) {
                    await supabase.from('profiles').insert([
                        {
                            id: session.user.id,
                            email: session.user.email,
                            display_name: session.user.email?.split('@')[0],
                            full_name: '',
                            avatar_url: ''
                        }
                    ]);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signup = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) throw error;

        if (data.user) {
            // Manually create profile since we removed the trigger
            const { error: profileError } = await supabase.from('profiles').insert([
                {
                    id: data.user.id,
                    email: data.user.email,
                    display_name: data.user.email?.split('@')[0], // Default display name
                    full_name: '',
                    avatar_url: ''
                }
            ]);

            if (profileError) {
                console.error('Error creating profile:', profileError);
                // Optional: decide if you want to throw this error or just log it
                // throw profileError; 
            }
        }
    };

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const googleSignIn = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) throw error;
    };

    const value = {
        user,
        session,
        loading,
        signup,
        login,
        logout,
        googleSignIn
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

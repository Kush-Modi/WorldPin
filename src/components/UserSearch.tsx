import { useState } from 'react';
import { Search, UserPlus, Check } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

type Profile = {
    id: string;
    email: string;
    display_name: string;
    full_name: string;
    avatar_url: string;
};

export default function UserSearch() {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || !user) return;

        setLoading(true);
        try {
            // Search for users by email (exact match for privacy, or partial if desired)
            // Using ilike for partial match on email or display_name
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .or(`email.ilike.%${query}%,display_name.ilike.%${query}%`)
                .neq('id', user.id) // Don't show self
                .limit(5);

            if (error) throw error;
            setResults(data || []);
            setIsOpen(true);
        } catch (error) {
            console.error('Error searching users:', error);
            toast.error('Failed to search users');
        } finally {
            setLoading(false);
        }
    };

    const sendFriendRequest = async (receiverId: string) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('friend_requests')
                .insert([
                    { sender_id: user.id, receiver_id: receiverId }
                ]);

            if (error) {
                if (error.code === '23505') { // Unique violation
                    toast.error('Request already sent');
                } else {
                    throw error;
                }
            } else {
                toast.success('Friend request sent!');
                setSentRequests(prev => new Set(prev).add(receiverId));
            }
        } catch (error) {
            console.error('Error sending request:', error);
            toast.error('Failed to send request');
        }
    };

    return (
        <div className="relative">
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    placeholder="Search friends..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={loading}
                    className="w-64 bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-white/10 transition-colors disabled:opacity-50"
                />
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            </form>

            {isOpen && results.length > 0 && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                        <div className="p-2">
                            <h3 className="text-xs font-semibold text-slate-400 px-2 mb-2">Search Results</h3>
                            <div className="space-y-1">
                                {results.map(profile => (
                                    <div key={profile.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-md transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-xs">
                                                {profile.display_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm text-white font-medium">{profile.display_name || 'User'}</p>
                                                <p className="text-xs text-slate-400">{profile.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => sendFriendRequest(profile.id)}
                                            disabled={sentRequests.has(profile.id)}
                                            className="p-1.5 rounded-full bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            title="Send Friend Request"
                                        >
                                            {sentRequests.has(profile.id) ? <Check size={16} /> : <UserPlus size={16} />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

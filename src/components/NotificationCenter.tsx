import { useState, useEffect } from 'react';
import { Bell, Check, X, User } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

type FriendRequest = {
    id: string;
    sender_id: string;
    receiver_id: string;
    status: 'pending' | 'accepted' | 'rejected';
    sender: {
        email: string;
        display_name: string;
    };
};

export default function NotificationCenter() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) return;

        const fetchRequests = async () => {
            const { data, error } = await supabase
                .from('friend_requests')
                .select(`
                    id,
                    sender_id,
                    receiver_id,
                    status,
                    sender:profiles(email, display_name)
                `)
                .eq('receiver_id', user.id)
                .eq('status', 'pending');

            if (error) {
                console.error('Error fetching requests:', error);
            } else {
                console.log('Fetched requests:', data);
                setRequests(data as any || []);
                setUnreadCount(data?.length || 0);
            }
        };

        fetchRequests();

        // Subscribe to new requests
        const channel = supabase
            .channel('friend_requests_channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'friend_requests',
                    filter: `receiver_id=eq.${user.id}`,
                },
                (payload) => {
                    console.log('New request received:', payload);
                    fetchRequests();
                    toast('New friend request!', { icon: '👋' });
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [user]);

    const handleResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('friend_requests')
                .update({ status })
                .eq('id', requestId);

            if (error) throw error;

            setRequests(prev => prev.filter(r => r.id !== requestId));
            setUnreadCount(prev => Math.max(0, prev - 1));
            toast.success(`Request ${status}`);
        } catch (error) {
            console.error('Error updating request:', error);
            toast.error('Failed to update request');
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                        <div className="p-3 border-b border-white/5">
                            <h3 className="text-xs font-semibold text-white">Notifications</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {requests.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 text-xs">
                                    No pending requests
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {requests.map(req => (
                                        <div key={req.id} className="p-3 flex items-start gap-3 hover:bg-white/5 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 mt-0.5">
                                                <User size={14} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-slate-300">
                                                    <span className="text-white font-medium">{req.sender?.display_name || req.sender?.email || 'Unknown User'}</span> sent you a friend request.
                                                </p>
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleResponse(req.id, 'accepted')}
                                                        className="flex items-center gap-1 px-2 py-1 bg-teal-500/20 text-teal-400 text-[10px] font-medium rounded hover:bg-teal-500/30 transition-colors"
                                                    >
                                                        <Check size={12} /> Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleResponse(req.id, 'rejected')}
                                                        className="flex items-center gap-1 px-2 py-1 bg-rose-500/20 text-rose-400 text-[10px] font-medium rounded hover:bg-rose-500/30 transition-colors"
                                                    >
                                                        <X size={12} /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

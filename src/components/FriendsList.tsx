import { useState, useEffect } from 'react';
import { Users, User } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

type Friend = {
    id: string;
    email: string;
    display_name: string;
};

interface FriendsListProps {
    onSelectFriend: (friendId: string | null) => void;
    currentViewId: string | null;
}

export default function FriendsList({ onSelectFriend, currentViewId }: FriendsListProps) {
    const { user } = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchFriends = async () => {
            // Fetch accepted requests where user is sender or receiver
            const { data: requests, error } = await supabase
                .from('friend_requests')
                .select(`
                    sender_id,
                    receiver_id,
                    sender:profiles!sender_id(id, email, display_name),
                    receiver:profiles!receiver_id(id, email, display_name)
                `)
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .eq('status', 'accepted');

            if (error) {
                console.error('Error fetching friends:', error);
                return;
            }

            const friendList = requests.map((req: any) => {
                if (req.sender_id === user.id) {
                    return req.receiver;
                } else {
                    return req.sender;
                }
            });

            setFriends(friendList);
        };

        fetchFriends();
    }, [user, isOpen]); // Refresh when opening

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 transition-colors rounded-full hover:bg-white/10 ${currentViewId && currentViewId !== user?.id ? 'text-teal-400 bg-teal-500/10' : 'text-slate-400 hover:text-white'}`}
                title="Friends"
            >
                <Users size={18} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                        <div className="p-3 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-xs font-semibold text-white">Friends</h3>
                            <button
                                onClick={() => {
                                    onSelectFriend(null);
                                    setIsOpen(false);
                                }}
                                className="text-[10px] text-teal-400 hover:underline"
                            >
                                My Map
                            </button>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {friends.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 text-xs">
                                    No friends yet. Search to add some!
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {friends.map(friend => (
                                        <button
                                            key={friend.id}
                                            onClick={() => {
                                                onSelectFriend(friend.id);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full p-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left ${currentViewId === friend.id ? 'bg-teal-500/10' : ''}`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-medium ${currentViewId === friend.id ? 'text-teal-400' : 'text-white'}`}>
                                                    {friend.display_name}
                                                </p>
                                                <p className="text-xs text-slate-400 truncate w-40">
                                                    {friend.email}
                                                </p>
                                            </div>
                                        </button>
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

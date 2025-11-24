import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlobeMap from '../components/GlobeMap';
import AddPlaceModal from '../components/AddPlaceModal';
import { LogOut, Plus, Eye, EyeOff, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../supabase';

type Place = {
    id: string;
    name: string;
    fullName: string;
    location: { lat: number; lng: number };
    photos: string[];
    createdAt: Date;
    visitDate?: Date;
    description?: string;
    rating?: number;
};

type PlaceData = {
    place: {
        display_name: string;
        lat: string;
        lon: string;
    };
    photos: File[];
    visitDate: string;
    description: string;
    rating: number;
};

export default function MyGlobe() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [privacyMode, setPrivacyMode] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [places, setPlaces] = useState<Place[]>([]);
    const [loadingPlaces, setLoadingPlaces] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchPlaces = async () => {
            setLoadingPlaces(true);
            const { data, error } = await supabase
                .from('places')
                .select('*')
                .eq('user_id', user.uid);

            if (error) {
                console.error('Error fetching places:', error);
                toast.error('Failed to load places');
                setLoadingPlaces(false);
                return;
            }

            if (data) {
                const mapped: Place[] = data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    fullName: item.full_name,
                    location: item.location,
                    photos: item.photos,
                    createdAt: new Date(item.created_at),
                    visitDate: item.visit_date ? new Date(item.visit_date) : undefined,
                    description: item.description,
                    rating: item.rating
                }));
                setPlaces(mapped);
            }
            setLoadingPlaces(false);
        };

        fetchPlaces();

        const channel = supabase
            .channel('places_channel')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'places',
                    filter: `user_id=eq.${user.uid}`,
                },
                () => {
                    fetchPlaces();
                },
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [user]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
            toast.success('Logged out successfully');
        } catch {
            toast.error('Failed to logout');
        }
    };

    const togglePrivacy = () => {
        setPrivacyMode((prev) => !prev);
        toast(privacyMode ? 'Privacy mode disabled' : 'Privacy mode enabled', {
            icon: privacyMode ? '👀' : '🔒',
        });
        // TODO: persist privacyMode to user profile later
    };

    const handleSavePlace = async (placeData: PlaceData) => {
        if (!user) return;
        try {
            const photoUrls: string[] = [];

            for (let i = 0; i < placeData.photos.length; i++) {
                const photo = placeData.photos[i];

                if (photo.size > 25 * 1024 * 1024) {
                    toast.error(`File ${photo.name} is too large. Max 25MB.`);
                    throw new Error(`File ${photo.name} exceeds 25MB limit`);
                }

                const fileName = `places/${user.uid}/${Date.now()}_${i}`;
                const { error: uploadError } = await supabase.storage
                    .from('photos')
                    .upload(fileName, photo);

                if (uploadError) throw uploadError;

                const {
                    data: { publicUrl },
                } = supabase.storage.from('photos').getPublicUrl(fileName);

                photoUrls.push(publicUrl);
            }

            const { error: insertError } = await supabase.from('places').insert([
                {
                    user_id: user.uid,
                    name: placeData.place.display_name.split(',')[0],
                    full_name: placeData.place.display_name,
                    location: {
                        lat: parseFloat(placeData.place.lat),
                        lng: parseFloat(placeData.place.lon),
                    },
                    photos: photoUrls,
                    visit_date: placeData.visitDate,
                    description: placeData.description,
                    rating: placeData.rating
                },
            ]);

            if (insertError) throw insertError;

            toast.success('Place added to your globe!');

            // Fetch the most recent place for instant UI update
            const { data: newPlaceData } = await supabase
                .from('places')
                .select('*')
                .eq('user_id', user.uid)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (newPlaceData) {
                const newPlace: Place = {
                    id: newPlaceData.id,
                    name: newPlaceData.name,
                    fullName: newPlaceData.full_name,
                    location: newPlaceData.location,
                    photos: newPlaceData.photos,
                    createdAt: new Date(newPlaceData.created_at),
                    visitDate: newPlaceData.visit_date ? new Date(newPlaceData.visit_date) : undefined,
                    description: newPlaceData.description,
                    rating: newPlaceData.rating
                };
                setPlaces((prev) => [...prev, newPlace]);
            }
        } catch (error) {
            console.error('Error saving place:', error);
            toast.error('Failed to save place');
            throw error;
        }
    };

    const handleDeletePlace = async (placeId: string) => {
        const { error } = await supabase.from('places').delete().eq('id', placeId);

        if (error) {
            console.error('Error deleting place:', error);
            toast.error('Failed to delete place');
            return;
        }

        setPlaces((prev) => prev.filter((p) => p.id !== placeId));
        toast.success('Place deleted');
    };

    const showEmptyState = !loadingPlaces && places.length === 0;

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-gradient-to-b from-black via-slate-950 to-black">
            {/* Header */}
            <header className="h-16 bg-black/75 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/10 border border-teal-500/40">
                        <MapPin className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-white leading-tight">
                            WorldPin
                        </h1>
                        <p className="text-[11px] text-slate-400">
                            {user?.email ?? 'Signed in'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={togglePrivacy}
                        className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                        title={privacyMode ? 'Disable Privacy Mode' : 'Enable Privacy Mode'}
                    >
                        {privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <div className="h-6 w-px bg-white/10" />
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors text-xs font-medium"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </header>

            {/* Globe Container */}
            <div className="flex-1 relative mt-16">
                <GlobeMap places={places} onDelete={handleDeletePlace} />
                {loadingPlaces && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="px-4 py-2 rounded-full bg-black/60 border border-white/10 text-xs text-slate-300">
                            Loading your pins on the globe…
                        </div>
                    </div>
                )}
                {showEmptyState && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-slate-400 text-sm pointer-events-none">
                        <p className="mb-1 font-medium text-slate-200">
                            Start your first WorldPin.
                        </p>
                        <p>Use the teal + button to add a place you&apos;ve visited.</p>
                    </div>
                )}
            </div>

            {/* FAB */}
            <button
                className="fixed bottom-6 right-6 w-16 h-16 bg-teal-500 hover:bg-teal-400 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform duration-150 hover:scale-110 active:scale-95 z-40"
                onClick={() => setIsAddModalOpen(true)}
                aria-label="Add place"
            >
                <Plus size={30} />
            </button>

            {/* Add Place Modal */}
            <AddPlaceModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSavePlace}
            />
        </div>
    );
}

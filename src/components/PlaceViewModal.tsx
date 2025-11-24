import { useState } from 'react';
import { X, Trash2, Calendar, MapPin, ChevronLeft, ChevronRight, Star, AlignLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface Place {
    id: string;
    name: string;
    fullName: string;
    location: { lat: number; lng: number };
    photos: string[];
    createdAt: Date;
    visitDate?: Date;
    description?: string;
    rating?: number;
}

interface PlaceViewModalProps {
    place: Place;
    onClose: () => void;
    onDelete: (placeId: string) => Promise<void>;
}

export default function PlaceViewModal({ place, onClose, onDelete }: PlaceViewModalProps) {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!place) return null;

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this place?')) {
            setIsDeleting(true);
            try {
                await onDelete(place.id);
                onClose();
                toast.success('Place deleted');
            } catch (error) {
                toast.error('Failed to delete place');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const nextPhoto = () => {
        setCurrentPhotoIndex((prev) => (prev + 1) % place.photos.length);
    };

    const prevPhoto = () => {
        setCurrentPhotoIndex((prev) => (prev - 1 + place.photos.length) % place.photos.length);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-5xl h-[85vh] glass-panel rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl animate-zoom-in">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
                >
                    <X size={24} />
                </button>

                {/* Photo Section */}
                <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none z-10" />

                    <img
                        src={place.photos[currentPhotoIndex]}
                        alt={place.name}
                        className="w-full h-full object-contain transition-transform duration-500"
                    />

                    {place.photos.length > 1 && (
                        <>
                            <button
                                onClick={prevPhoto}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-white/10 rounded-full text-white transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 z-20"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={nextPhoto}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-white/10 rounded-full text-white transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 z-20"
                            >
                                <ChevronRight size={32} />
                            </button>

                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                                {place.photos.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentPhotoIndex(idx)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentPhotoIndex ? 'bg-white w-8' : 'bg-white/30 w-2 hover:bg-white/50'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Info Section */}
                <div className="w-full md:w-96 bg-gray-900/95 backdrop-blur-xl p-8 flex flex-col border-l border-white/10">
                    <div className="flex-1 animate-slide-up delay-100">
                        <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">{place.name}</h2>
                        <div className="flex items-start gap-2 text-gray-400 mb-8">
                            <MapPin size={16} className="mt-1 flex-shrink-0 text-teal-400" />
                            <p className="text-sm line-clamp-2 font-light">{place.fullName}</p>
                        </div>

                        {/* Rating */}
                        {place.rating && place.rating > 0 && (
                            <div className="flex items-center gap-1 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={18}
                                        className={`${star <= place.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        {place.description && (
                            <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-start gap-3">
                                    <AlignLeft size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        {place.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 text-gray-300 p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="p-2 bg-teal-500/20 rounded-lg">
                                    <Calendar size={20} className="text-teal-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Visited On</p>
                                    <p className="font-medium">{(place.visitDate || place.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-300 p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <div className="w-5 h-5 rounded-full border-2 border-purple-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Coordinates</p>
                                    <p className="font-medium font-mono text-sm">{place.location.lat.toFixed(4)}, {place.location.lng.toFixed(4)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-white/10 animate-slide-up delay-200">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full py-3.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl flex items-center justify-center gap-2 transition-all font-medium border border-red-500/20 hover:border-red-500/40"
                        >
                            <Trash2 size={18} />
                            {isDeleting ? 'Deleting...' : 'Delete Place'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

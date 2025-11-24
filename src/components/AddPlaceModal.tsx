import React, { useState, useRef } from 'react';
import { X, Upload, MapPin, Search, Loader2, Calendar, Star, AlignLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

interface AddPlaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (placeData: any) => Promise<void>;
}

interface SearchResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

export default function AddPlaceModal({ isOpen, onClose, onSave }: AddPlaceModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<SearchResult | null>(null);
    const [photos, setPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [rating, setRating] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            toast.error('Failed to search for place');
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectPlace = (place: SearchResult) => {
        setSelectedPlace(place);
        setSearchResults([]);
        setSearchQuery('');
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (photos.length + newFiles.length > 5) {
                toast.error('Max 5 photos allowed');
                return;
            }

            const compressedFiles: File[] = [];
            const newPreviews: string[] = [];

            for (const file of newFiles) {
                try {
                    const options = {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1920,
                        useWebWorker: true
                    };
                    const compressedFile = await imageCompression(file, options);
                    compressedFiles.push(compressedFile);
                    newPreviews.push(URL.createObjectURL(compressedFile));
                } catch (error) {
                    console.error('Error compressing image:', error);
                    toast.error('Failed to process image');
                }
            }

            setPhotos([...photos, ...compressedFiles]);
            setPreviews([...previews, ...newPreviews]);
        }
    };

    const handleSave = async () => {
        if (!selectedPlace) return toast.error('Please select a place');
        if (photos.length === 0) return toast.error('Please upload at least one photo');

        setIsSaving(true);
        try {
            await onSave({
                place: selectedPlace,
                photos: photos,
                visitDate,
                description,
                rating
            });
            onClose();
            // Reset state
            setSelectedPlace(null);
            setPhotos([]);
            setPreviews([]);
            setVisitDate(new Date().toISOString().split('T')[0]);
            setDescription('');
            setRating(0);
        } catch (error) {
            console.error(error);
            toast.error('Failed to save place');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-zoom-in">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-2xl font-bold text-white">Add New Place</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} className="text-gray-400 hover:text-white" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Location Search */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Location</label>
                        {!selectedPlace ? (
                            <div className="relative">
                                <form onSubmit={handleSearch} className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search for a place... (e.g., Paris, Tokyo)"
                                        className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSearching}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium text-gray-300 transition-colors"
                                    >
                                        {isSearching ? <Loader2 className="animate-spin w-4 h-4" /> : 'Search'}
                                    </button>
                                </form>

                                {/* Search Results Dropdown */}
                                {searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 rounded-xl shadow-xl border border-white/10 max-h-60 overflow-y-auto z-10 custom-scrollbar">
                                        {searchResults.map((result) => (
                                            <button
                                                key={result.place_id}
                                                onClick={() => handleSelectPlace(result)}
                                                className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-start gap-3 transition-colors border-b border-white/5 last:border-0"
                                            >
                                                <MapPin className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium text-white line-clamp-1">{result.display_name.split(',')[0]}</p>
                                                    <p className="text-xs text-gray-400 line-clamp-1">{result.display_name}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-teal-500/20 rounded-lg">
                                        <MapPin className="w-6 h-6 text-teal-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{selectedPlace.display_name.split(',')[0]}</h3>
                                        <p className="text-sm text-teal-200">{parseFloat(selectedPlace.lat).toFixed(4)}, {parseFloat(selectedPlace.lon).toFixed(4)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedPlace(null)}
                                    className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Visit Date */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Visit Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="date"
                                    value={visitDate}
                                    onChange={(e) => setVisitDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Rating</label>
                            <div className="flex items-center gap-2 p-3 bg-black/30 border border-white/10 rounded-xl">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star
                                            size={24}
                                            className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} transition-colors`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Description</label>
                        <div className="relative">
                            <AlignLeft className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Write about your experience..."
                                rows={3}
                                className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Photo Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Photos ({photos.length}/5)</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500/50 hover:bg-teal-500/5 transition-all group"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoUpload}
                                multiple
                                accept="image/*"
                                className="hidden"
                            />
                            <div className="p-4 bg-white/5 rounded-full group-hover:bg-teal-500/20 transition-colors mb-4">
                                <Upload className="w-8 h-8 text-gray-400 group-hover:text-teal-400 transition-colors" />
                            </div>
                            <p className="text-gray-300 font-medium group-hover:text-teal-300">Click to upload photos</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP • Max 5 photos</p>
                        </div>

                        {/* Thumbnails */}
                        {previews.length > 0 && (
                            <div className="grid grid-cols-5 gap-3 mt-4 animate-fade-in">
                                {previews.map((src, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-white/10">
                                        <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => {
                                                const newPhotos = [...photos];
                                                const newPreviews = [...previews];
                                                newPhotos.splice(index, 1);
                                                newPreviews.splice(index, 1);
                                                setPhotos(newPhotos);
                                                setPreviews(newPreviews);
                                            }}
                                            className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                        >
                                            <X size={12} />
                                        </button>
                                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/50 rounded text-[10px] text-white font-medium backdrop-blur-sm">
                                            {index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-300 font-medium hover:bg-white/10 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!selectedPlace || photos.length === 0 || isSaving}
                        className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="animate-spin w-4 h-4" />
                                Saving...
                            </>
                        ) : (
                            'Save Place'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

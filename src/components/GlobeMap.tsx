import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import PlaceViewModal from './PlaceViewModal';

type Place = {
    id: string;
    name: string;
    fullName: string;
    location: { lat: number; lng: number };
    photos: string[];
    createdAt: Date;
};

export type MapStyle = 'dark' | 'light' | 'satellite' | 'streets';

interface GlobeMapProps {
    places: Place[];
    mapStyle: MapStyle;
    onMapLoad?: (map: MapLibreMap) => void;
    onDelete: (placeId: string) => Promise<void>;
}

const MAP_STYLES: Record<MapStyle, any> = {
    dark: {
        version: 8,
        sources: {
            'dark-matter': {
                type: 'raster',
                tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'],
                tileSize: 256,
                attribution: '&copy; OpenStreetMap &copy; CARTO'
            }
        },
        layers: [
            {
                id: 'dark-matter',
                type: 'raster',
                source: 'dark-matter',
                paint: { 'raster-opacity': 0.8 }
            }
        ]
    },
    light: {
        version: 8,
        sources: {
            'positron': {
                type: 'raster',
                tiles: ['https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'],
                tileSize: 256,
                attribution: '&copy; OpenStreetMap &copy; CARTO'
            }
        },
        layers: [
            {
                id: 'positron',
                type: 'raster',
                source: 'positron'
            }
        ]
    },
    satellite: {
        version: 8,
        sources: {
            'satellite': {
                type: 'raster',
                tiles: [
                    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                ],
                tileSize: 256,
                attribution: '&copy; Esri'
            }
        },
        layers: [
            {
                id: 'satellite',
                type: 'raster',
                source: 'satellite'
            }
        ]
    },
    streets: {
        version: 8,
        sources: {
            'osm': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '&copy; OpenStreetMap contributors'
            }
        },
        layers: [
            {
                id: 'osm',
                type: 'raster',
                source: 'osm'
            }
        ]
    }
};

const PIN_COLORS: Record<MapStyle, { color: string; glow: string; halo: string }> = {
    dark: {
        color: '#22d3ee', // Cyan
        glow: 'rgba(34, 211, 238, 0.9)',
        halo: 'rgba(34, 211, 238, 0.55)'
    },
    light: {
        color: '#e11d48', // Rose
        glow: 'rgba(225, 29, 72, 0.9)',
        halo: 'rgba(225, 29, 72, 0.55)'
    },
    satellite: {
        color: '#ffffff', // White
        glow: 'rgba(255, 255, 255, 0.9)',
        halo: 'rgba(255, 255, 255, 0.55)'
    },
    streets: {
        color: '#7c3aed', // Violet
        glow: 'rgba(124, 58, 237, 0.9)',
        halo: 'rgba(124, 58, 237, 0.55)'
    }
};

export default function GlobeMap({ places, mapStyle, onMapLoad, onDelete }: GlobeMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<MapLibreMap | null>(null);
    const markers = useRef<{ [key: string]: maplibregl.Marker }>({});
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Initialize map
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        try {
            map.current = new maplibregl.Map({
                container: mapContainer.current,
                style: MAP_STYLES[mapStyle],
                center: [0, 20],
                zoom: 1.8,
                projection: { type: 'globe' },
                renderWorldCopies: false,
                maxZoom: 18
            } as any);

            // Add atmosphere
            map.current.on('style.load', () => {
                (map.current as any)?.setFog({
                    color: 'rgb(10, 10, 15)',
                    'high-color': 'rgb(0, 0, 0)',
                    'horizon-blend': 0.2,
                    'space-color': 'rgb(0, 0, 0)',
                    'star-intensity': 0.6
                });
            });

            map.current.on('load', () => {
                if (onMapLoad && map.current) {
                    onMapLoad(map.current);
                }
            });

            map.current.on('error', (e) => {
                setError('Failed to load map imagery.');
                console.error(e);
            });

        } catch (err) {
            setError('Failed to initialize the globe.');
            console.error(err);
        }

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []); // Only run once on mount

    // Handle style changes
    useEffect(() => {
        if (map.current) {
            map.current.setStyle(MAP_STYLES[mapStyle]);

            // Re-apply fog after style change
            map.current.once('style.load', () => {
                (map.current as any)?.setFog({
                    color: 'rgb(10, 10, 15)',
                    'high-color': 'rgb(0, 0, 0)',
                    'horizon-blend': 0.2,
                    'space-color': 'rgb(0, 0, 0)',
                    'star-intensity': 0.6
                });
            });

            // Update existing markers colors
            const colors = PIN_COLORS[mapStyle];
            Object.values(markers.current).forEach(marker => {
                const el = marker.getElement();
                el.style.setProperty('--pin-color', colors.color);
                el.style.setProperty('--pin-glow', colors.glow);
                el.style.setProperty('--pin-halo', colors.halo);
            });
        }
    }, [mapStyle]);

    // Update markers when places change
    useEffect(() => {
        if (!map.current) return;

        // Cleanup markers that are no longer in places
        Object.keys(markers.current).forEach((id) => {
            if (!places.some((p) => p.id === id)) {
                markers.current[id].remove();
                delete markers.current[id];
            }
        });

        // Add new markers
        places.forEach((place) => {
            if (!markers.current[place.id]) {
                const container = document.createElement('div');
                container.className = 'wp-marker-container';

                // Set initial colors based on current style
                const colors = PIN_COLORS[mapStyle];
                container.style.setProperty('--pin-color', colors.color);
                container.style.setProperty('--pin-glow', colors.glow);
                container.style.setProperty('--pin-halo', colors.halo);

                const halo = document.createElement('div');
                halo.className = 'wp-marker-halo';
                container.appendChild(halo);

                const dot = document.createElement('div');
                dot.className = 'wp-marker-dot';
                container.appendChild(dot);

                container.title = place.name;

                container.addEventListener('click', (e) => {
                    e.stopPropagation();
                    map.current?.flyTo({
                        center: [place.location.lng, place.location.lat],
                        zoom: 5,
                        speed: 1.2
                    });
                    setSelectedPlace(place);
                });

                const marker = new maplibregl.Marker({ element: container })
                    .setLngLat([place.location.lng, place.location.lat]);

                marker.addTo(map.current!);

                markers.current[place.id] = marker;
            }
        });
    }, [places]);

    const handleDeletePlace = async (placeId: string) => {
        await onDelete(placeId);
        setSelectedPlace(null);
    };

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-red-500">
                {error}
            </div>
        );
    }

    return (
        <>
            <div ref={mapContainer} className="w-full h-full bg-black" />
            {selectedPlace && (
                <PlaceViewModal
                    place={selectedPlace}
                    onClose={() => setSelectedPlace(null)}
                    onDelete={handleDeletePlace}
                />
            )}
        </>
    );
}

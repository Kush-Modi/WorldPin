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

interface GlobeMapProps {
    places: Place[];
    onMapLoad?: (map: MapLibreMap) => void;
    onDelete: (placeId: string) => Promise<void>;
}

export default function GlobeMap({ places, onMapLoad, onDelete }: GlobeMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<MapLibreMap | null>(null);
    const markers = useRef<{ [key: string]: maplibregl.Marker }>({});
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        try {
            map.current = new maplibregl.Map({
                container: mapContainer.current,
                style: {
                    version: 8,
                    sources: {
                        'satellite': {
                            type: 'raster',
                            tiles: [
                                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                            ],
                            tileSize: 256,
                            attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR, and the GIS User Community'
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
                center: [0, 20],
                zoom: 1.5,
                projection: { type: 'globe' } as any,
                renderWorldCopies: false
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
    }, [onMapLoad]);

    // Update markers when places change
    useEffect(() => {
        if (!map.current) return;

        // Remove old markers
        Object.keys(markers.current).forEach((id) => {
            if (!places.some((p) => p.id === id)) {
                markers.current[id].remove();
                delete markers.current[id];
            }
        });

        // Add new markers
        places.forEach((place) => {
            if (!markers.current[place.id]) {
                // Create container for positioning
                const container = document.createElement('div');
                container.className = 'marker-container';

                // Create the actual visual dot
                const dot = document.createElement('div');
                dot.className = 'marker-dot';
                container.appendChild(dot);

                container.title = place.name;

                // Click handling on the container
                container.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log('Marker clicked:', place.name);

                    map.current?.flyTo({
                        center: [place.location.lng, place.location.lat],
                        zoom: 5,
                        speed: 1.2
                    });
                    setSelectedPlace(place);
                });

                const marker = new maplibregl.Marker({ element: container })
                    .setLngLat([place.location.lng, place.location.lat]);
                marker.addTo(map.current);
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

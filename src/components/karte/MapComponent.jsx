import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Calendar, Wrench, Users, HelpCircle } from 'lucide-react';
import MapMarkerPopup from './MapMarkerPopup';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix für Leaflet Marker Icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Benutzerdefinierte Marker-Icons
const createCustomIcon = (color) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background-color: ${color};
                width: 30px;
                height: 30px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            "></div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });
};

const MARKER_COLORS = {
    event: '#9333ea',    // purple
    service: '#3b82f6',  // blue
    group: '#22c55e',    // green
    request: '#f97316'   // orange
};

// Komponente zum Zentrieren der Karte
function MapCenterController({ center }) {
    const map = useMap();
    
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    
    return null;
}

export default function MapComponent({ 
    markers, 
    center = [52.52, 13.405], // Berlin als Default
    zoom = 14,
    onMarkerClick,
    onViewDetails
}) {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            className="w-full h-full rounded-lg"
            style={{ minHeight: '400px' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapCenterController center={center} />
            
            {markers.map((marker) => {
                if (!marker.location?.latitude || !marker.location?.longitude) return null;
                
                const icon = createCustomIcon(MARKER_COLORS[marker.type] || MARKER_COLORS.request);
                
                return (
                    <Marker
                        key={`${marker.type}-${marker.id}`}
                        position={[marker.location.latitude, marker.location.longitude]}
                        icon={icon}
                        eventHandlers={{
                            click: () => onMarkerClick?.(marker)
                        }}
                    >
                        <Popup>
                            <MapMarkerPopup 
                                item={marker} 
                                type={marker.type}
                                onViewDetails={onViewDetails}
                            />
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
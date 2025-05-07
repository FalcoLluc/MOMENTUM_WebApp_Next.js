'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Button } from '@mantine/core';
import { LocationMarker } from '@/types';

// Dynamically import Leaflet and react-leaflet components
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Ensure Leaflet is only imported on the client side
let L: typeof import('leaflet') | undefined;
if (typeof window !== 'undefined') {
  import('leaflet').then((leaflet) => {
    L = leaflet;

    // Fix for default marker icons
    const DefaultIcon = L.icon({
      iconUrl: '/images/marker-icon.png',
      iconRetinaUrl: '/images/marker-icon-2x.png',
      shadowUrl: '/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;
  });
}

// Auto-center component
function AutoCenter({
    userLocation,
    trigger,
  }: {
    userLocation?: L.LatLngExpression | null;
    trigger?: boolean;
  }) {
    const [useMap, setUseMap] = useState<(() => import('leaflet').Map) | null>(null);
  
    useEffect(() => {
      import('react-leaflet').then((mod) => setUseMap(() => mod.useMap));
    }, []);
  
    const map = useMap?.();
    useEffect(() => {
      if (!map || !L || !userLocation) return;
  
      try {
        // Center the map on the user's location
        map.flyTo(userLocation, map.getZoom(), { duration: 1 });
      } catch (error) {
        console.error('Error centering map:', error);
      }
    }, [userLocation, trigger, map]);
  
    return null;
  }

export function LocationsMap({
  locations,
  center = [51.505, -0.09],
  zoom = 13,
}: {
  locations: LocationMarker[];
  center?: L.LatLngExpression;
  zoom?: number;
}) {
  const [centerTrigger, setCenterTrigger] = useState(false);
  const [userLocation, setUserLocation] = useState<L.LatLngExpression | null>(null);
  const [userIcon, setUserIcon] = useState<L.Icon | null>(null);

  // Fetch user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error fetching user location:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (L) {
      const customIcon = L.icon({
        iconUrl: '/images/blue-dot.png', // Replace with your custom icon URL
        iconSize: [30, 30],
        iconAnchor: [10, 10],
      });
      setUserIcon(customIcon);
    }
  }, []);

  return (
    <div style={{ position: 'relative', height: '400px', width: '100%' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <AutoCenter userLocation={userLocation} trigger={centerTrigger} />
        {locations.map((app) => (
          <Marker key={app.id} position={app.position}>
            <Popup>
              <div style={{ minWidth: '250px', fontFamily: 'Arial, sans-serif' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>{app.name}</h3>
                {app.address && (
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#34495e' }}>
                    <strong>Address:</strong> {app.address}
                  </p>
                )}
                {app.serviceTypes && (
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#34495e' }}>
                    <strong>Service Types:</strong> {app.serviceTypes}
                  </p>
                )}
                {app.rating && (
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#34495e' }}>
                    <strong>Rating:</strong> {app.rating} ⭐
                  </p>
                )}
                {app.phone && (
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#34495e' }}>
                    <strong>Phone:</strong> <a href={`tel:${app.phone}`} style={{ color: '#3498db' }}>{app.phone}</a>
                  </p>
                )}
                {app.business && (
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#34495e' }}>
                    <strong>Business:</strong> {app.business}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        {userLocation && userIcon && (
          <Marker position={userLocation} icon={userIcon}></Marker>
        )}
      </MapContainer>
      <Button
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
        }}
        onClick={() => setCenterTrigger((prev) => !prev)}
      >
        Center Map
      </Button>
    </div>
  );
}
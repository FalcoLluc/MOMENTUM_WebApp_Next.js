'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useMemo } from 'react';
import { Button, Text } from '@mantine/core';
import { AppointmentMarker } from '@/types';
import { isValidCoordinate } from '@/utils/validation';

// Dynamic imports for Leaflet + React-Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

const Routing = dynamic(() => import('@/app/users/(dashboard)/appointments/Routing'), {
  ssr: false,
});

// Fix for client-side Leaflet only
let L: typeof import('leaflet') | undefined;
if (typeof window !== 'undefined') {
  import('leaflet').then((leaflet) => {
    L = leaflet;

    // Set default marker icon
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

// Auto-center helper component
function AutoCenter({ appointments, trigger }: { appointments: AppointmentMarker[]; trigger?: boolean }) {
  const [useMap, setUseMap] = useState<(() => import('leaflet').Map) | null>(null);

  useEffect(() => {
    import('react-leaflet').then((mod) => setUseMap(() => mod.useMap));
  }, []);

  const map = useMap?.();

  useEffect(() => {
    if (!map || !L) return;

    try {
      const validLocations = appointments.map((loc) => loc.position).filter(isValidCoordinate);
      if (validLocations.length > 0) {
        const bounds = L.latLngBounds(validLocations);
        map.fitBounds(bounds, { duration: 1 });
      }
    } catch (error) {
      console.error('Error centering map:', error);
    }
  }, [appointments, trigger, map]);

  return null;
}

// MAIN COMPONENT
export function AppointmentsMapRouting({
  appointments,
  center = [51.505, -0.09],
  zoom = 13,
}: {
  appointments: AppointmentMarker[];
  center?: L.LatLngExpression;
  zoom?: number;
}) {
  const [centerTrigger, setCenterTrigger] = useState(false);
  const [userLocation, setUserLocation] = useState<L.LatLngExpression | null>(null);
  const [userIcon, setUserIcon] = useState<L.Icon | null>(null);
  const [routeSummary, setRouteSummary] = useState<{ distance: number; time: number } | null>(null);

  // Get user location
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

  // Set user marker icon
  useEffect(() => {
    if (L) {
      const customIcon = L.icon({
        iconUrl: '/images/blue-dot.png',
        iconSize: [30, 30],
        iconAnchor: [10, 10],
      });
      setUserIcon(customIcon);
    }
  }, []);

    const routingWaypoints = useMemo(() => {
    return appointments
      .filter((ap) => isValidCoordinate(ap.position))
      .map((ap) => {
        if (L) {
          return L.latLng(
            Array.isArray(ap.position) ? ap.position[0] : ap.position.lat,
            Array.isArray(ap.position) ? ap.position[1] : ap.position.lng
          );
        }
        return null;
      })
      .filter((point): point is L.LatLng => point !== null);
  }, [appointments]);

  return (
    <div style={{ position: 'relative', height: '400px', width: '100%' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Center map based on appointments */}
        <AutoCenter appointments={appointments} trigger={centerTrigger} />

        {/* Appointment markers */}
        {appointments.map((app) => (
          <Marker key={app.id} position={app.position}>
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ fontWeight: 'bold' }}>{app.name}</h3>
                {app.address && <p>{app.address}</p>}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User location marker */}
        {userLocation && userIcon && <Marker position={userLocation} icon={userIcon} />}

        {/* Routing logic */}
      <Routing
        waypoints={routingWaypoints}
        onRouteSummary={(summary) => {
          setRouteSummary(summary);
          console.log('Route Summary:', summary);
        }}
      />
      </MapContainer>

      {/* Route Summary UI */}
      {routeSummary && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: 'white',
            padding: '10px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}
        >
          <Text size="sm" fw={500}>🚗 Total distance: {(routeSummary.distance / 1000).toFixed(2)} km</Text>
          <Text size="sm" fw={500}>🕒 Total time by car: {(routeSummary.time / 60).toFixed(1)} min</Text>
        </div>
      )}

      {/* Center map button */}
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

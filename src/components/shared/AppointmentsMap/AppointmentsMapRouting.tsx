'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@mantine/core';
import { AppointmentMarker } from '@/types';
import { isValidCoordinate } from '@/utils/validation';

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

// Import Leaflet Routing Machine dynamically
let L: typeof import('leaflet') | undefined;
let Routing: any;
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

    import('leaflet-routing-machine').then(() => {
      Routing = L!.Routing; // Ensure Routing is properly initialized
      console.log('Routing initialized:', Routing);
    });
  });
}

type RoutingControl = {
  getPlan: () => {
    waypoints: Array<{ latLng: L.LatLng }>;
  };
  spliceWaypoints: (index: number, toRemove: number, ...waypoints: any[]) => void;
} & L.Control;

// Auto-center component
function AutoCenter({ appointments, trigger }: { appointments: AppointmentMarker[]; trigger?: boolean }) {
  const [useMap, setUseMap] = useState<(() => import('leaflet').Map) | null>(null);

  useEffect(() => {
    import('react-leaflet').then((mod) => setUseMap(() => mod.useMap));
  }, []);

  const map = useMap?.();
  useEffect(() => {
    if (!map || !L) return;

    try {
      const allAppointments = [...appointments.map((loc) => loc.position)];

      const validLocations = allAppointments.filter(isValidCoordinate);
      if (validLocations.length > 0) {
        const bounds = L.latLngBounds(validLocations);
        console.debug(bounds);
        map.fitBounds(bounds, { duration: 1 });
      }
    } catch (error) {
      console.error('Error centering map:', error);
    }
  }, [appointments, trigger, map]);
  return null;
}

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
  const [showRoute, setShowRoute] = useState(false);
  const routingControlRef = useRef<RoutingControl | null>(null);
  const mapRef = useRef<L.Map | null>(null);

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

  // Add routing between appointments
  useEffect(() => {
    if (!showRoute || !L || !Routing || appointments.length < 2) {
      console.error('Routing is not initialized or insufficient data for routing');
      return;
    }

    const currentMap = mapRef.current;
    if (!currentMap) return;

    const waypoints = appointments.map((app) => L!.latLng(app.position as [number, number]));
    if (routingControlRef.current) {
      currentMap.removeControl(routingControlRef.current);
    }

    const routingControl = Routing.control({
      waypoints,
      routeWhileDragging: true,
      showAlternatives: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: '#3b82f6', weight: 5 }],
      },
      createMarker: function (i: number, waypoint: { latLng: L.LatLng }) {
        return L!.marker(waypoint.latLng, {
          icon: L!.icon({
            iconUrl: '/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          }),
        });
      },
    }).addTo(currentMap);

    routingControlRef.current = routingControl;

    return () => {
      if (routingControlRef.current && mapRef.current) {
        mapRef.current.removeControl(routingControlRef.current);
      }
    };
  }, [showRoute, appointments]);

  return (
    <div style={{ position: 'relative', height: '400px', width: '100%' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} ref={mapRef} id="map">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <AutoCenter appointments={appointments} trigger={centerTrigger} />
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
      {appointments.length >= 2 && (
        <Button
          onClick={() => setShowRoute(!showRoute)}
          variant={showRoute ? 'filled' : 'outline'}
        >
          {showRoute ? 'Hide Route' : 'Show Route'}
        </Button>
      )}
    </div>
  );
}
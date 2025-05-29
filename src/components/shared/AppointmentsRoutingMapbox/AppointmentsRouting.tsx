'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getRuntimeEnv } from '@/utils/getRuntimeEnv';
import { AppointmentMarker } from '@/types';
import type * as L from 'leaflet'; // Import Leaflet types

const { MAPBOX_ACCESS_TOKEN } = getRuntimeEnv();

interface AppointmentsMapProps {
  appointments: AppointmentMarker[];
  showRoute?: boolean;
  center?: [number, number];
  zoom?: number;
}

export function leafletToMapboxCoordinates(coord: L.LatLngExpression): [number, number] {
  if (Array.isArray(coord)) {
    return [coord[1], coord[0]]; // Reverse to [lng, lat]
  }
  
  // Handle object format { lat, lng }
  if ('lat' in coord && 'lng' in coord) {
    return [coord.lng, coord.lat];
  }
  
  throw new Error('Invalid Leaflet coordinate format');
}

export function AppointmentsRouting({
  appointments,
  showRoute = true,
  center = [1.986998, 41.275086],
  zoom = 12,
}: AppointmentsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const routeSourceRef = useRef<mapboxgl.GeoJSONSource | null>(null);

  // Convert appointments once
  const convertedAppointments = appointments.map((app) => ({
    ...app,
    position: leafletToMapboxCoordinates(app.position), // Now in [lng, lat] format
  }));

  // Initialize map
  useEffect(() => {
    if (!MAPBOX_ACCESS_TOKEN || !mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center,
      zoom: zoom,
    });

    mapRef.current = map;

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl());

    // Set up map sources and layers when loaded
    map.on('load', () => {
      if (showRoute) {
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [],
            },
          },
        });

        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 4,
            'line-opacity': 0.75,
          },
        });

        routeSourceRef.current = map.getSource('route') as mapboxgl.GeoJSONSource;
      }

      updateMarkers();
      fitToBounds();
    });

    return () => {
      map.remove();
    };
  }, []);

  // Update markers and route when appointments change
  useEffect(() => {
    if (!mapRef.current) return;

    updateMarkers();
    fitToBounds();

    if (showRoute && convertedAppointments.length >= 2) {
      updateRoute();
    } else if (routeSourceRef.current) {
      clearRoute();
    }
  }, [convertedAppointments, showRoute]); // Use convertedAppointments in dependency array

  const updateMarkers = () => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers - positions are already in [lng, lat] format
    convertedAppointments.forEach((app) => {
      const marker = new mapboxgl.Marker()
        .setLngLat(app.position) // No conversion needed here
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div style="min-width: 200px">
              <h3 style="font-weight: bold; margin-bottom: 8px">${app.name}</h3>
              ${app.address ? `<p style="margin-bottom: 4px">${app.address}</p>` : ''}
              ${app.serviceType ? `<p style="color: #666">Service: ${app.serviceType}</p>` : ''}
            </div>
          `)
        )
        .addTo(mapRef.current!);
      
      markersRef.current.push(marker);
    });
  };

  const fitToBounds = () => {
    if (!mapRef.current || convertedAppointments.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    // Add all appointment markers to bounds - positions are already in [lng, lat]
    convertedAppointments.forEach(app => {
      bounds.extend(app.position);
    });

    mapRef.current.fitBounds(bounds, {
      padding: 50,
      duration: 1000,
    });
  };

  const updateRoute = async () => {
    if (!mapRef.current || !routeSourceRef.current || convertedAppointments.length < 2) return;

    try {
      // Positions are already in [lng, lat] format
      const coordinates = convertedAppointments.map(app => app.position);

      const coordsParam = coordinates.map(coord => coord.join(',')).join(';');
      const profile = 'driving';
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordsParam}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].geometry;
        routeSourceRef.current.setData({
          type: 'Feature',
          properties: {},
          geometry: route,
        });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const clearRoute = () => {
    if (routeSourceRef.current) {
      routeSourceRef.current.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [],
        },
      });
    }
  };

  return (
    <div
        ref={mapContainerRef}
        style={{
        height: '100%',
        width: '100%',
        borderRadius: '8px',
        backgroundColor: 'lightgray', // for debugging
        }}
    />
  );
}
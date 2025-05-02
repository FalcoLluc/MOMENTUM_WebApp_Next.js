'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Box, Text, TextInput } from '@mantine/core';
import { GeoJSONPoint } from '@/types';
import mapboxgl from 'mapbox-gl';
import dynamic from 'next/dynamic';
import 'mapbox-gl/dist/mapbox-gl.css';

const SearchBox = dynamic(
  () => import('@mapbox/search-js-react').then((mod) => mod.SearchBox),
  { ssr: false }
);

interface SearchBoxFormProps {
  onSave: (address: string, location: GeoJSONPoint) => void;
  required?: boolean;
  label?: string;
}

export function SearchBoxForm({ 
  onSave, 
  required = false,
  label = 'Address'
}: SearchBoxFormProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState('');
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current) return;

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [1.986998, 41.275086],
      zoom: 12,
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, [mapboxToken]);

  const handleRetrieve = useCallback((res: { features?: Array<{
    geometry: { coordinates: [number, number] };
    properties: { full_address?: string; name?: string };
  }>}) => {
    const feature = res.features?.[0];
    if (feature) {
      const coords: [number, number] = feature.geometry.coordinates;
      const selectedAddress = feature.properties.full_address || feature.properties.name || '';

      mapRef.current?.flyTo({ center: coords, zoom: 15 });

      if (marker) {
        marker.setLngLat(coords);
      } else {
        const newMarker = new mapboxgl.Marker()
          .setLngLat(coords)
          .addTo(mapRef.current!);
        setMarker(newMarker);
      }

      setAddress(selectedAddress);
      onSave(selectedAddress, {
        type: 'Point',
        coordinates: coords,
      });
    }
  }, [marker, onSave]);

  if (!mapboxToken) {
    return (
      <Box mt="md">
        <TextInput 
          label={label} 
          placeholder="Mapbox unavailable" 
          disabled 
          required={required}
        />
      </Box>
    );
  }

  return (
    <Box mt="md">
      <Text fw={500} size="sm" mb={4}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </Text>

      <SearchBox
        accessToken={mapboxToken}
        value={address}
        onChange={(value) => setAddress(value)}
        onRetrieve={handleRetrieve}
        map={mapRef.current}
        mapboxgl={mapboxgl}
        marker={false}
        options={{ 
          country: 'ES', 
          language: 'es', 
          types: 'address',
        }}
        placeholder="Search an address"
      />

      <div
        ref={mapContainerRef}
        style={{
          height: 250,
          borderRadius: 8,
          marginTop: 12,
          border: '1px solid #dee2e6',
        }}
      />
    </Box>
  );
}
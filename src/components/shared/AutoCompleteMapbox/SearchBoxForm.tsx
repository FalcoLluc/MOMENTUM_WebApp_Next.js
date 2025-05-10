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
  onSave: (address: string, location: GeoJSONPoint | undefined) => void;
  required?: boolean;
  label?: string;
}

interface MapboxFeature {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    name: string;
    mapbox_id: string;
    feature_type: string;
    address: string;
    full_address: string;
    place_formatted: string;
    context: {
      country?: {
        name: string;
        country_code: string;
        country_code_alpha_3: string;
      };
      region?: {
        name: string;
        region_code: string;
        region_code_full: string;
      };
      postcode?: { name: string };
      place?: { name: string };
      neighborhood?: { name: string };
      street?: { name: string };
    };
    language: string;
    maki?: string;
    poi_category?: string[];
    poi_category_ids?: string[];
  };
}


export function SearchBoxForm({ 
  onSave, 
  required = false,
  label = 'Address'
}: SearchBoxFormProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN_PLACEHOLDER || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
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

  const handleRetrieve = useCallback((res: { features?: MapboxFeature[] }) => {
    const feature = res.features?.[0];
    if (feature) {
      const coords: [number, number] = feature.geometry.coordinates;
      //console.log(feature.properties)
      const formatedAddress = [
        feature.properties.context.street?.name,
        feature.properties.address.split(' ').at(-1),
        feature.properties.context.postcode?.name + ' ' +feature.properties.context.place?.name,
        feature.properties.context.region?.name,
      ].filter(Boolean).join(', ');
      const selectedAddress = formatedAddress || feature.properties.full_address ||  '';

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

  const handleClear = () => {
    setAddress('');
    if (marker) {
      marker.remove();
      setMarker(null);
    }
    onSave('', undefined); // Notify parent that the location is cleared
  };

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
        onClear={handleClear}
        map={mapRef.current}
        mapboxgl={mapboxgl}
        marker={false}
        options={{ 
          country: 'ES', 
          language: 'en', 
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
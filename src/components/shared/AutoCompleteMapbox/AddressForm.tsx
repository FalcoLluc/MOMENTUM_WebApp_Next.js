'use client';

import { TextInput } from '@mantine/core';
import { useState, useCallback } from 'react';
import { GeoJSONPoint } from '@/types';
import { getRuntimeEnv } from '@/utils/getRuntimeEnv';
import dynamic from 'next/dynamic';

const { NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN } = getRuntimeEnv();

const AddressAutofill = dynamic(
  () => import('@mapbox/search-js-react').then((mod) => mod.AddressAutofill),
  { 
    ssr: false,
    loading: () => <TextInput placeholder="Loading address search..." disabled />
  }
);

interface AddressFormProps {
  onSave: (address: string, location: GeoJSONPoint) => void;
  initialAddress?: string;
}

export function AddressForm({ onSave, initialAddress = '' }: AddressFormProps) {
  const [address, setAddress] = useState(initialAddress);
  const handleSave = useCallback(onSave, [onSave]);

  const handleRetrieve = useCallback((res: { features: Array<{
    geometry: { coordinates: [number, number] };
    properties: { full_address?: string; place_name?: string };
  }>}) => {
    const feature = res.features[0];
    if (feature) {
      const fullAddress = feature.properties.full_address || feature.properties.place_name || '';
      const coordinates: [number, number] = [
        feature.geometry.coordinates[0],
        feature.geometry.coordinates[1],
      ];

      setAddress(fullAddress);
      handleSave(fullAddress, {
        type: 'Point',
        coordinates,
      });
    }
  }, [handleSave]);

  const handleChange = (value: string) => {
    setAddress(value);
  };

  const mapboxToken = NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!mapboxToken) {
    return <TextInput label="Address" placeholder="Mapbox service unavailable" disabled />;
  }

  return (
    <AddressAutofill
      accessToken={mapboxToken}
      onRetrieve={handleRetrieve}
      options={{
        country: 'ES',
        language: 'es',
        types: 'address',
      }}
    >
      <TextInput
        label="Address"
        value={address}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Start typing your address..."
        autoComplete="address-line1" 
        name="address-line1"
      />
    </AddressAutofill>
  );
}
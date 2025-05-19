'use client';

//import dynamic from 'next/dynamic';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Box, Text, TextInput } from '@mantine/core';
import { GeoJSONPoint } from '@/types';
import { Button } from '@mantine/core'; // Import Button component

// Dynamically import Leaflet to ensure SSR compatibility
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

interface NominatimFeature {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  address?: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    country?: string;
    state?: string;
  };
}

interface SearchBoxFormProps {
  onSave: (address: string, location: GeoJSONPoint | undefined) => void;
  required?: boolean;
  label?: string;
}

export function SearchBoxOpenStreetForm({
  onSave,
  required = false,
  label = 'Address',
}: SearchBoxFormProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimFeature[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);
  const [marker, setMarker] = useState<L.Marker | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || !L) return;

    const newMap = L.map(mapContainerRef.current).setView([41.275086, 1.986998], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(newMap);

    setMap(newMap);

    return () => {
      newMap.remove();
    };
  }, []);

  // Search handler
  const handleSearch = useCallback(async () => {
    if (address.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&addressdetails=1&limit=5`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your@email.com)',
          },
        }
      );
      const data: NominatimFeature[] = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Nominatim search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [address]);

  /*
  const handleSearch = useCallback(async () => {
    if (address.length < 3) {
      setSuggestions([]);
      return;
    }
  
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&addressdetails=1&limit=5`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your@email.com)',
          },
        }
      );
      const data: NominatimFeature[] = await response.json();
  
      // Filter results to include only those with a house number
      const filteredData = data.filter(
        (feature) => feature.address && feature.address.house_number
      );
  
      setSuggestions(filteredData);
    } catch (error) {
      console.error('Nominatim search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [address]);
  */

  // Handle selection of a suggestion
  const handleSelect = useCallback(
    (feature: NominatimFeature) => {
      if (!L) return;
  
      // Swap lon and lat to match Leaflet's [latitude, longitude] format
      const coords: [number, number] = [parseFloat(feature.lat), parseFloat(feature.lon)];
  
      // Format address from Nominatim data
      let formattedAddress = feature.display_name;
      if (feature.address) {
        const addr = feature.address;
        formattedAddress = [
          addr.road,
          addr.house_number,
          `${addr.postcode || ''} ${addr.city || ''}`.trim(),
          addr.state,
          addr.country,
        ]
          .filter(Boolean)
          .join(', ');
      }
  
      // Update map view
      if (map) {
        map.flyTo(coords, 15);
        if (marker) {
          marker.setLatLng(coords);
        } else {
          const newMarker = L.marker(coords).addTo(map);
          setMarker(newMarker);
        }
      }
  
      setAddress(formattedAddress);
      setSuggestions([]);
      onSave(formattedAddress, {
        type: 'Point',
        coordinates: [parseFloat(feature.lon), parseFloat(feature.lat)], // Keep GeoJSON format as [longitude, latitude]
      });
    },
    [map, marker, onSave]
  );

  // Handle input changes
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAddress(e.currentTarget.value);
    },
    []
  );

  return (
    <Box mt="md">
      <Text fw={500} size="sm" mb={4}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </Text>

      <div style={{ position: 'relative' }}>
        <TextInput
          value={address}
          onChange={handleInputChange}
          placeholder="Search an address"
          rightSection={isSearching ? <div>Loading...</div> : null}
        />
        <Button
          onClick={handleSearch}
          style={{ marginTop: '8px' }}
          disabled={isSearching || address.length < 3}
        >
          Search
        </Button>

        {suggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              zIndex: 2000, // Ensure it's above the map
              width: '100%',
              maxHeight: '300px',
              overflowY: 'auto',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginTop: '4px',
            }}
          >
            {suggestions.map((feature) => (
              <div
                key={feature.place_id}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                }}
                onClick={() => handleSelect(feature)}
              >
                {feature.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        ref={mapContainerRef}
        style={{
          position: 'relative',
          height: 250,
          borderRadius: 8,
          marginTop: 12,
          border: '1px solid #dee2e6',
          zIndex: 1, // Ensure the map is below the autocomplete list
        }}
      />
      <div
        style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#6c757d',
          marginTop: '4px',
        }}
      >
        &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors
      </div>
    </Box>
  );
}
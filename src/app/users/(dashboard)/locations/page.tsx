'use client';

import { useEffect, useState } from 'react';
import { LocationsMap } from '@/components';
import { NativeSelect } from '@mantine/core';
import { locationsService } from '@/services/locationsService';
import { useAuthStore } from '@/stores/authStore';
import { LocationMarker } from '@/types';
import { locationServiceType } from '@/types/enums';

export default function LocationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  const [serviceLocations, setServiceLocations] = useState<LocationMarker[]>([]);
  const [serviceType, setServiceType] = useState<locationServiceType>(locationServiceType.COACHING);

  useEffect(() => {
    const fetchServiceLocations = async () => { 
      try{
        setLoading(true);
        setError(null);

        if (!user?._id) {
          throw new Error('User not authenticated');
        }
        const serviceLocations = await locationsService.getAllLocationsByServiceType(serviceType);
        if (!serviceLocations?.length) {
          //throw new Error('No locations found');
          return null
        }

        const serviceLocationMap = serviceLocations
          .filter((loc) => loc && (loc.ubicacion)) // Ensure app and app.location are valid
          .map( (loc) => {
            if (loc &&
              loc.ubicacion &&
              Array.isArray(loc.ubicacion.coordinates) &&
              loc.ubicacion.coordinates.length === 2
            ) {
              return {
                id: loc._id,
                name: loc.nombre,
                position: [
                  loc.ubicacion.coordinates[1], // latitude
                  loc.ubicacion.coordinates[0], // longitude
                ],
                address: loc.address,
                serviceTypes: loc.serviceType.join(', '),
                rating: loc.rating,
                phone: loc.phone, // Add missing property
                business: loc.business, // Add missing property
              };
            }
          });
        const validServiceLoc = serviceLocationMap.filter(Boolean) as LocationMarker[];
        setServiceLocations(validServiceLoc);
      }catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : JSON.stringify(err));
      } finally {
        setLoading(false);
      }
    }

    fetchServiceLocations();
  },[user?._id, serviceType]);
  

  if (loading) return <div>Loading locations...</div>;
  if (!loading && !serviceLocations.length) {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">No Locations Found for this type</h1>
            <NativeSelect
                label="Service Type"
                data={Object.values(locationServiceType).map((type) => ({ label: type, value: type }))}
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as locationServiceType)}
                required
            ></NativeSelect>
        </div>
        
    );
  }
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Search Locations</h1>
      <NativeSelect
        label="Service Type"
        data={Object.values(locationServiceType).map((type) => ({ label: type, value: type }))}
        value={serviceType}
        onChange={(e) => setServiceType(e.target.value as locationServiceType)}
        required
      ></NativeSelect>
      <div className="h-[600px]">
        <LocationsMap locations={serviceLocations} />
      </div>
    </div>
  );
}
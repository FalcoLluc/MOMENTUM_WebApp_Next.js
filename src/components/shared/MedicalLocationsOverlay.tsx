'use client';

import { useState } from 'react';
import { Modal, Button, Loader, Stack, Card, Text, Title } from '@mantine/core';
import { LocationsMap } from '@/components';
import { usersService } from '@/services/usersService';
import { LocationMarker} from '@/types';
import { IconMapPin } from '@tabler/icons-react';

export function MedicalLocationsOverlay({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const [medicalLocations, setMedicalLocations] = useState<LocationMarker[]>([]);
  const [medicalLoading, setMedicalLoading] = useState(false);

  const fetchMedicalLocations = async () => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    setMedicalLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const locations = await usersService.getCloseMedicalLocations(latitude, longitude);

        if (!locations?.length) {
          setMedicalLocations([]);
          return;
        }

        const medicalLocationMap = locations
          .filter((loc) => loc && loc.ubicacion)
          .map((loc) => {
            if (
              loc &&
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
                phone: loc.phone,
                accessible: loc.accessible,
              };
            }
            return null;
          });

        const validMedicalLoc = medicalLocationMap.filter(Boolean) as LocationMarker[];
        setMedicalLocations(validMedicalLoc);
      });
    } catch (error) {
      console.error('Error fetching medical locations:', error);
    } finally {
      setMedicalLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      centered
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconMapPin size={24} color="#e63946" /> {/* Add an icon */}
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e63946' }}>
            Nearby Medical Locations
          </span>
        </div>
      }
    >
      {medicalLoading ? (
        <Stack align="center" justify="center" style={{ height: '400px' }}>
          <Loader size="lg" variant="dots" color="primary" />
          <Text color="secondary" size="sm">
            Fetching medical locations...
          </Text>
        </Stack>
      ) : (
        <Stack gap="md">
          {/* Map Section */}
          <div style={{ height: '400px', width: '100%' }}>
            <LocationsMap locations={medicalLocations} />
          </div>

          {/* List Section */}
          <Stack gap="sm">
            {medicalLocations.map((location) => (
              <Card key={location.id} shadow="sm" radius="md" withBorder>
                <Title order={4}>{location.name}</Title>
                <Text size="sm" color="dimmed">
                  {location.address}
                </Text>
                <Text size="sm">Services: {location.serviceTypes}</Text>
                <Text size="sm">Phone: {location.phone}</Text>
                <Text size="sm">
                  Accessible: {location.accessible ? 'Yes' : 'No'}
                </Text>
              </Card>
            ))}
          </Stack>
        </Stack>
      )}
      <Button
        style={{ marginTop: '10px' }}
        onClick={fetchMedicalLocations}
        disabled={medicalLoading}
        color="primary"
      >
        Fetch Locations
      </Button>
    </Modal>
  );
}
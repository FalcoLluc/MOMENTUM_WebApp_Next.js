'use client';

import { useEffect, useState } from 'react';
import { LocationsMap } from '@/components';
import { 
  NativeSelect, 
  Paper, 
  Title, 
  Text, 
  Stack, 
  Alert, 
  Container,
  Card,
  Loader
} from '@mantine/core';
import { IconAlertCircle, IconMapPin } from '@tabler/icons-react';
import { locationsService } from '@/services/locationsService';
import { useAuthStore } from '@/stores/authStore';
import { LocationMarker } from '@/types';
import { locationServiceType } from '@/types/enums';
import classes from './LocationsPage.module.css';

export default function LocationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  const [serviceLocations, setServiceLocations] = useState<LocationMarker[]>([]);
  const [serviceType, setServiceType] = useState<locationServiceType>(locationServiceType.COACHING);

  useEffect(() => {
    const fetchServiceLocations = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?._id) {
          throw new Error('User not authenticated');
        }

        const serviceLocations = await locationsService.getAllLocationsByServiceType(serviceType);
        
        if (!serviceLocations?.length) {
          setServiceLocations([]);
          return;
        }

        const serviceLocationMap = serviceLocations
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
                business: loc.business,
              };
            }
            return null;
          });

        const validServiceLoc = serviceLocationMap.filter(Boolean) as LocationMarker[];
        setServiceLocations(validServiceLoc);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceLocations();
  }, [user?._id, serviceType]);

  if (loading) {
    return (
      <Container size="lg" py="xl" className={classes.container}>
        <Stack align="center" justify="center" style={{ height: '600px' }}>
          <Loader size="lg" variant="dots" />
          <Text color="dimmed" size="sm">
            Loading locations...
          </Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl" className={classes.container}>
      <Stack gap="xl">
        <Title order={2} className={classes.title}>
          Service Locations
        </Title>

        <Paper withBorder shadow="sm" p="md" radius="md">
          <Stack gap="sm">
            <Text size="sm" color="dimmed">
              Select a service type to view available locations on the map
            </Text>
            <NativeSelect
                label="Service Type"
                data={Object.values(locationServiceType).map((type) => ({ label: type, value: type }))}
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as locationServiceType)}
                required
            ></NativeSelect>
          </Stack>
        </Paper>

        {!serviceLocations.length ? (
          <Card withBorder shadow="sm" radius="md" p="xl">
            <Stack align="center" gap="xs">
              <IconMapPin size={48} stroke={1.5} className={classes.emptyIcon} />
              <Title order={4}>No Locations Found</Title>
              <Text color="dimmed" style={{ textAlign: 'center' }}>
                We couldn&apos;t find any locations for {serviceType.toLowerCase()} services.
              </Text>
            </Stack>
          </Card>
        ) : (
          <Card withBorder shadow="sm" radius="md" p={0} className={classes.mapCard}>
            <div className={classes.mapContainer}>
              <LocationsMap locations={serviceLocations} />
            </div>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
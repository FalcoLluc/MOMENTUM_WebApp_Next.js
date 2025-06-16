'use client';
import { useEffect, useState } from 'react';
import { LocationsMap } from '@/components';
import {  Title,  Text,  Stack,  Alert, Container, Card, Loader, Button} from '@mantine/core';
import { IconAlertCircle, IconMapPin } from '@tabler/icons-react';
import { locationsService } from '@/services/locationsService';
import { useAuthStore } from '@/stores/authStore';
import { LocationMarker } from '@/types';
import { LocationServiceType } from '@/types/enums';
import classes from './LocationsPage.module.css';
import LocationsFilter from "@/components/shared/LocationsFilter/LocationsFilter";
import { MedicalLocationsOverlay } from '@/components';

export default function LocationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const [serviceLocations, setServiceLocations] = useState<LocationMarker[]>([]);
  const [serviceType] = useState<LocationServiceType>(LocationServiceType.COACHING);

  const [overlayOpened, setOverlayOpened] = useState(false);

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
                accessible: loc.accessible,
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
          <Loader size="lg" variant="dots" color="primary"/>
          <Text color="secondary" size="sm">
            Loading locations...
          </Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} color="secondary"/>} title="Error" color="red">
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
        
        {/* Mostrar filtro - el filtro actualizará las ubicaciones */}
        <LocationsFilter onLocationsChange={setServiceLocations} />

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

        {/* Emergency Button to open overlay */}
        <Button
          onClick={() => setOverlayOpened(true)}
          color="red"
          size="lg"
          radius="xl"
          style={{
            backgroundColor: '#e63946', // Bright red for urgency
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0px 4px 10px rgba(230, 57, 70, 0.5)', // Add shadow for emphasis
            display: 'flex',
            alignItems: 'center',
            gap: '8px', // Space between icon and text
          }}
        >
          <IconAlertCircle size={20} />
          Emergency: Find Nearby Medical Locations
        </Button>

        {/* Medical Locations Overlay */}
        <MedicalLocationsOverlay opened={overlayOpened} onClose={() => setOverlayOpened(false)} />
      </Stack>
    </Container>
  );
}
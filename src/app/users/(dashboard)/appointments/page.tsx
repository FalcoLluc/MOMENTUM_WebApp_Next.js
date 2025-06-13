'use client';

import { useEffect, useState } from 'react';
import { calendarsService } from '@/services/calendarsService';
import { locationsService } from '@/services/locationsService';
import { useAuthStore } from '@/stores/authStore';
import { AppointmentMarker } from '@/types';
import { AppointmentsMapRouting } from '@/components';
import { Container, Title, Loader, Center, Alert, Stack, Button } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconAlertCircle } from '@tabler/icons-react';

export default function AppointmentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const [appointments, setAppointments] = useState<AppointmentMarker[]>([]);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?._id) {
          throw new Error('User not authenticated');
        }

        if (!selectedDate) return;

        const start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);

        const calendars = await calendarsService.getUserCalendars(user._id);
        if (!calendars?.length) {
          throw new Error('No calendars found');
        }

        const appointments = (
          await Promise.all(
            calendars.map((calendar) =>
              calendar._id
                ? calendarsService.getAppointmentsBetweenDates(calendar._id, start, end)
                : []
            )
          )
        ).flat();

        const locationPromises = appointments
          .filter((app) => app && (app.location || app.customUbicacion))
          .map(async (app) => {
            if (
              app?.customUbicacion &&
              Array.isArray(app.customUbicacion.coordinates) &&
              app.customUbicacion.coordinates.length === 2
            ) {
              return {
                id: app._id || crypto.randomUUID(),
                name: app.title,
                position: [
                  app.customUbicacion.coordinates[1],
                  app.customUbicacion.coordinates[0],
                ],
                address: app.customAddress || 'Custom Location',
                serviceType: app.serviceType || 'Unknown',
                startTime: app.inTime,
                endTime: app.outTime,
              };
            } else if (app?.location) {
              const location = await locationsService.getLocationById(app.location);
              if (!location || !Array.isArray(location.ubicacion.coordinates) || location.ubicacion.coordinates.length !== 2) return null;

              return {
                id: app._id || crypto.randomUUID(),
                name: location.nombre,
                position: [
                  location.ubicacion.coordinates[1],
                  location.ubicacion.coordinates[0],
                ],
                address: location.address,
                serviceType: app.serviceType || 'Unknown',
                startTime: app.inTime,
                endTime: app.outTime,
              };
            }
          });

        const validLocations = (await Promise.all(locationPromises)).filter(Boolean) as AppointmentMarker[];
        const orderedLocations = validLocations.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        
        setAppointments(orderedLocations);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : JSON.stringify(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?._id, selectedDate]);

  return (
    <Container size="lg" py="md">
      <Stack gap="md">
        <Title order={2}>Appointments</Title>

        <DatePickerInput
          label="Select date"
          rightSection={<IconCalendar size={18} />}
          value={selectedDate}
          onChange={setSelectedDate}
          maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
          minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
        />

        <Button onClick={() => setSelectedDate(new Date())} variant="outline" color="primary">
          Select Today
        </Button>

        {loading && (
          <Center py="md">
            <Loader />
          </Center>
        )}

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            {error}
          </Alert>
        )}

        {!loading && !error && appointments.length === 0 && (
          <Alert color="yellow" title="No appointments">
            No appointments found for the selected day.
          </Alert>
        )}

        {!loading && appointments.length > 0 && (
          <div className="h-[600px]">
            <AppointmentsMapRouting appointments={appointments} />
          </div>
        )}
      </Stack>
    </Container>
  );
}
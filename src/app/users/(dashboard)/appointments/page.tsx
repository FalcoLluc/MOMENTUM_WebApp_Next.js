'use client';

import { useEffect, useState } from 'react';
import { calendarsService } from '@/services/calendarsService';
import { locationsService } from '@/services/locationsService';
import { useAuthStore } from '@/stores/authStore';
import { AppointmentMarker } from '@/types';
//import { AppointmentsMap } from '@/components';
import { AppointmentsMapRouting2 } from '@/components';
//import { AppointmentsRouting } from '@/components';


export default function AppointmentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  const [appointments, setAppointments] = useState<AppointmentMarker[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?._id) {
          throw new Error('User not authenticated');
        }

        // Get today's date range
        const today = new Date();
        const start = new Date(today.setHours(0, 0, 0, 0));
        const end = new Date(today.setHours(23, 59, 59, 999));

        // Fetch user calendars
        const calendars = await calendarsService.getUserCalendars(user._id);
        if (!calendars?.length) {
          throw new Error('No calendars found');
        }

        // Fetch today's appointments
        const appointments = (
          await Promise.all(
            calendars.map((calendar) =>
              calendar._id
                ? calendarsService.getAppointmentsBetweenDates(calendar._id, start, end)
                : []
            )
          )
        ).flat();

        // Fetch locations for appointments
        const locationPromises = appointments
          .filter((app) => app && (app.location || app.customUbicacion)) // Ensure app and app.location are valid
          .map(async (app) => {
            if (app &&
              app.customUbicacion &&
              Array.isArray(app.customUbicacion.coordinates) &&
              app.customUbicacion.coordinates.length === 2
            ) {
              return {
                id: app._id || crypto.randomUUID(),
                name: app.title,
                position: [
                  app.customUbicacion.coordinates[1], // latitude
                  app.customUbicacion.coordinates[0], // longitude
                ],
                address: app.customAddress || 'Custom Location',
                serviceType: app.serviceType || 'Unknown',
              };
            }
            else if( app && app.location) {
              const location = await locationsService.getLocationById(app.location); // No non-null assertion
              if (!location || !Array.isArray(location.ubicacion.coordinates) || location.ubicacion.coordinates.length === 2) return null;

              return {
                id: app._id || crypto.randomUUID(),
                name: location.nombre,
                position: [
                  location.ubicacion.coordinates[1], // latitude
                  location.ubicacion.coordinates[0], // longitude
                ],
                address: location.address,
                serviceType: app.serviceType || 'Unknown',
              };
            }
          });
        const validLocations = (await Promise.all(locationPromises)).filter(Boolean) as AppointmentMarker[];
        setAppointments(validLocations);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : JSON.stringify(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?._id]);  

  if (loading) return <div>Loading appointments...</div>;
  if (!loading && !appointments.length) {
    return <div>No appointments found for today.</div>;
  }
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Today&#39;s Appointments</h1>
      <div className="h-[600px]">
        <AppointmentsMapRouting2 appointments={appointments} />
      </div>
    </div>
  );
}
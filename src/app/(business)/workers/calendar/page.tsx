// app/worker/calendar/page.tsx
'use client';

import {
  Button,
  Flex,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { calendarsService } from '@/services/calendarsService';
import { IAppointment, ICalendar } from '@/types';
import { BigCalendar, EditCalendarOverlay, NewAppointmentOverlay, AppointmentOverlay } from '@/components';

export default function WorkerCalendarPage() {
  const [newAppointmentOpened, newAppointmentHandlers] = useDisclosure();
  const [calendarEditorOpened, calendarEditorHandlers] = useDisclosure();
  const [appointmentOverlayOpened, appointmentOverlayHandlers] = useDisclosure();
  const [viewingAppointment, setViewingAppointment] = useState<IAppointment | null>(null);

  const router = useRouter();
  const worker = useAuthStore((state) => state.worker);


  const [calendar, setCalendar] = useState<ICalendar | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydration
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (hydrated && !worker) {
      router.push('/login');
    }
  }, [hydrated, worker, router]);

  // Load calendar
  useEffect(() => {
    if (!worker?._id) return;
    calendarsService.getUserCalendars(worker._id).then((calendars) => {
      setCalendar(calendars?.[0] ?? null);
    });
  }, [worker]);

  const reloadCalendar = () => {
    if (!worker?._id) return;
    calendarsService.getUserCalendars(worker._id).then((calendars) => {
      setCalendar(calendars?.[0] ?? null);
    });
  };

  const onSelectAppointment = (appointment: IAppointment) => {
    setViewingAppointment(appointment);
    appointmentOverlayHandlers.open();
  };

  return (
    <Flex direction={{ base: 'column', lg: 'row' }} gap={{ base: 'sm', lg: 'lg' }}>
      <div style={{ flex: '1 0 auto' }}>
        <BigCalendar
          calendars={calendar ? [calendar] : []}
          onSelectAppointment={onSelectAppointment}
        />
      </div>
      <Stack style={{ flex: '0 1 200px' }}>
        <Button
          variant="filled"
          color="secondary"
          onClick={newAppointmentHandlers.open}
          disabled={!calendar}
        >
          New Appointment
        </Button>

        {!calendar && (
          <Button
            variant="outline"
            color="secondary"
            onClick={calendarEditorHandlers.open}
          >
            New Calendar
          </Button>
        )}

        {calendar && (
          <>
            <Text mt="sm" ml="sm" tt="uppercase" size="xs" c="dimmed">
              Calendar: {calendar.calendarName}
            </Text>
          </>
        )}
      </Stack>

      <NewAppointmentOverlay
        disclosure={[newAppointmentOpened, newAppointmentHandlers]}
        calendars={calendar ? [calendar] : []}
        onAppointmentSaved={reloadCalendar}
      />

      <EditCalendarOverlay
        disclosure={[calendarEditorOpened, calendarEditorHandlers]}
        onCalendarSaved={reloadCalendar}
      />

      <AppointmentOverlay
        disclosure={[appointmentOverlayOpened, appointmentOverlayHandlers]}
        appointment={viewingAppointment}
        onAppointmentDeleted={reloadCalendar}
      />
    </Flex>
  );
}

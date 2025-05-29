// app/users/(dashboard)/calendar/page.tsx
'use client';

import { Button, Checkbox, Flex, Skeleton, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { calendarsService } from "@/services/calendarsService";
import { IAppointment, ICalendar } from "@/types";
import { useCalendarStore } from "@/stores/calendarStore";
import { AppointmentOverlay, BigCalendar, NewAppointmentOverlay, NewCalendarOverlay } from "@/components";
import { IconSparkles } from "@tabler/icons-react";
import { AppointmentAssistantOverlay } from "@/components/calendar/appointmentAssistant";

function CalendarList(
  { calendars }:
  { calendars: ICalendar[] | null}
) {
  const calendarStore = useCalendarStore();
  function changeCalendarSelection(selected: boolean, calendarId: string) {
    if (selected) {
      calendarStore.selectCalendar(calendarId);
    } else {
      calendarStore.unselectCalendar(calendarId);
    }
  }
  if (!calendars) {
    return Array(4)
      .fill(true)
      .map((_, i) => (
        <Skeleton
          height={20}
          width="100% - 8px"
          mx={4}
          my={8}
          radius="xl"
          key={i}
        ></Skeleton>
      ));
  } else {
    return calendars.map((calendar) => (
      <Checkbox
        key={calendar._id}
        label={calendar.calendarName}
        size="sm"
        color={calendar.defaultColour ?? '#228be6'}
        defaultChecked={calendarStore.selectedCalendars.has(calendar._id!)}
        onChange={(event) =>
          changeCalendarSelection(event.currentTarget.checked, calendar._id!)
        }
      ></Checkbox>
    ));
  }
}

export default function UserCalendarPage() {
  const [newAppointmentOpened, newAppointmentHandlers] = useDisclosure();
  const [newCalendarOverlay, newCalendarOverlayHandlers] = useDisclosure();
  const [appointmentAssistant, appointmentAssistantHandlers] = useDisclosure();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const selectedCalendars = useCalendarStore((state) => state.selectedCalendars); 
  const [key, setKey] = useState(0); // Add this line

  const [viewingAppointment, setViewingAppointment] = useState<IAppointment | null>(null)
  const [appointmentOverlay, appointmentOverlayHandlers] = useDisclosure();

  function onSelectAppointment(appointment: IAppointment) {
    setViewingAppointment(appointment);
    appointmentOverlayHandlers.open();
    console.log(appointment);
  }

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.push("/login");
      return;
    }
    // Reset key when user changes to force full calendar remount
    setKey(prev => prev + 1);
  }, [hydrated, user, router]);

  const [calendars, setCalendars] = useState<ICalendar[] | null>(null);
  useEffect(() => {
    if (!user || !user._id) return;
    calendarsService.getUserCalendars(user._id).then((calendars) => {
      setCalendars(calendars || null);
    });
  }, [user]);

  const [visibleCalendars, setVisibleCalendars] = useState<ICalendar[]>([]);
  useEffect( () => {
    if(!calendars || !selectedCalendars) return;
    setVisibleCalendars(calendars?.filter((calendar) => selectedCalendars.has(calendar._id!)));
  }, [calendars, selectedCalendars]);


  function reloadAppointments() {
    if (user?._id) {
      calendarsService.getUserCalendars(user._id).then((calendars) => {
        setCalendars(calendars?.filter((calendar) => selectedCalendars.has(calendar._id!)) || null);
      });
    }
  }

  return (
    <Flex 
      key={key}
      direction={{ base: 'column', lg: 'row' }}
      gap={{ base: 'sm', lg: 'lg' }}  
    >
      <div style={{flex: "1 0 auto"}}>
        <BigCalendar 
          calendars={visibleCalendars}
          onSelectAppointment={onSelectAppointment}
        />
      </div>
      <Stack style={{flex: "0 1 200px"}}>
        <Button
          variant="filled"
          color="teal"
          onClick={newAppointmentHandlers.open}
        >
          New Appointment
        </Button>
        <Button
          variant="outline"
          color="grape"
          leftSection={<IconSparkles></IconSparkles>}
          onClick={appointmentAssistantHandlers.open}
        >
          AI Assistant
        </Button>
        <Text mt="sm" ml="sm" tt="uppercase" size="xs" c="dimmed">
          Your Calendars
        </Text>
        <CalendarList calendars={calendars}/>
        <Button
          variant="outline"
          color="teal"
          onClick={newCalendarOverlayHandlers.open}
        >
          New Calendar
        </Button>
      </Stack>
      <NewAppointmentOverlay
        disclosure={[newAppointmentOpened, newAppointmentHandlers]}
        calendars={calendars ?? []}
        onAppointmentSaved={reloadAppointments}
      />
      <NewCalendarOverlay
        disclosure={[newCalendarOverlay, newCalendarOverlayHandlers]}
        onCalendarSaved={reloadAppointments}
      ></NewCalendarOverlay>
      <AppointmentOverlay
        disclosure={[appointmentOverlay, appointmentOverlayHandlers]}
        appointment={viewingAppointment}
        onAppointmentDeleted={reloadAppointments}
      ></AppointmentOverlay>
      <AppointmentAssistantOverlay
          userId={user?._id}
          disclosure={[appointmentAssistant, appointmentAssistantHandlers]}
          onAppointmentAdded={reloadAppointments}
      ></AppointmentAssistantOverlay>
    </Flex>
  );
}
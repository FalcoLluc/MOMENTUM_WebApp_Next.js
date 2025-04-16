// app/users/(dashboard)/calendar/page.tsx
'use client';

import { Button, Checkbox, Flex, NavLink, Skeleton, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { calendarsService } from "@/services/calendarsService";
import { BigCalendar } from "@/components/calendar/BigCalendar";
import { ICalendar } from "@/types";
import NewAppointmentOverlay from "@/components/calendar/newAppointmentOvelay";
import NewCalendarOverlay from "@/components/calendar/newCalendarOverlay";


function CalendarList({ calendars }: { calendars: ICalendar[] | null }) {
  function changeCalendarSelection(selected: boolean, calendarId: string) {
    // TODO
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
      <NavLink
        key={calendar._id}
        label={calendar.calendarName}
        leftSection={
          <Checkbox
            size="sm"
            color={calendar.defaultColour ?? '#228be6'}
            onChange={(event) =>
              changeCalendarSelection(event.currentTarget.checked, calendar._id!)
            }
          ></Checkbox>
        }
        styles={{
          label: {
            fontSize: "var(--mantine-font-size-md)",
          },
        }}
      ></NavLink>
    ));
  }
}

export default function UserCalendarPage() {
  const [newAppointmentOpened, newAppointmentHandlers] = useDisclosure();
  const [newCalendarOverlay, newCalendarOverlayHandlers] = useDisclosure();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [key, setKey] = useState(0); // Add this line

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
  useEffect(() => {
    if (!calendars) return;
    setVisibleCalendars(calendars);
  }, [calendars]);

  function reloadAppointments() {
    if (user?._id) {
      calendarsService.getUserCalendars(user._id).then((calendars) => {
        setCalendars(calendars || null);
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
        <BigCalendar calendars={visibleCalendars}/>
      </div>
      <Stack style={{flex: "0 1 200px"}}>
        <Button
          variant="filled"
          color="teal"
          onClick={newAppointmentHandlers.open}
        >
          New Appointment
        </Button>
        <Text mt="sm" ml="sm" tt="uppercase" size="xs" c="dimmed">
          Your Calendars
        </Text>
        <CalendarList calendars={calendars} />
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
    </Flex>
  );
}
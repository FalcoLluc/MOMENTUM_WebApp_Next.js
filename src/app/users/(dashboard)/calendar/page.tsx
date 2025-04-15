// app/users/(dashboard)/calendar/page.tsx
'use client';

import { Checkbox, NavLink, Skeleton, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { calendarsService, ICalendar } from "@/services/calendarsService";
import { BigCalendar } from "@/components/Calendar/BigCalendar";
import { NewAppointmentOverlay } from "@/components/Calendar/newAppointmentOvelay";


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

export default function UserDashboardPage() {
  const [newAppointmentOpened, newAppointmentHandlers] = useDisclosure();
  const router = useRouter();

  const user = useAuthStore((state) => state.user);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // Zustand store is hydrated on the first client render
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.push("/login");
  }, [hydrated, user, router]);

  const [calendars, setCalendars] = useState<ICalendar[] | null>(null);
  useEffect(() => {
    if (!user || !user._id) return;
    calendarsService.getUserCalendars(user._id).then((calendars) => {
      if (!calendars) return;
      setCalendars(calendars);
    });
  }, [user]);

  const [visibleCalendars, setVisibleCalendars] = useState<ICalendar[]>([]);
  useEffect(() => {
    if (!calendars) return;
    setVisibleCalendars(calendars);
  }, [calendars]);

  function onAppointmentSaved() {
    setVisibleCalendars([...visibleCalendars]); // Temporary way to refresh the component
  }

  return (
    <>
      <NavLink
        active
        variant="filled"
        label="New Appointment"
        onClick={newAppointmentHandlers.open}
      ></NavLink>
      <Text mt="sm" ml="sm" tt="uppercase" size="xs" c="dimmed">
        Your Calendars
      </Text>
      <CalendarList calendars={calendars}></CalendarList>
      <BigCalendar calendars={visibleCalendars}></BigCalendar>
      <NewAppointmentOverlay
        disclosure={[newAppointmentOpened, newAppointmentHandlers]}
        calendars={calendars ?? []}
        onAppointmentSaved={onAppointmentSaved}
      ></NewAppointmentOverlay>
    </>
  );
}
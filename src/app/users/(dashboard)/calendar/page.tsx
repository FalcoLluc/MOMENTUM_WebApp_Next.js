// app/users/(dashboard)/calendar/page.tsx
'use client';

import { Checkbox, NavLink, Skeleton, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { calendarsService } from "@/services/calendarsService";
import { ICalendar } from "@/types";
import { BigCalendar, NewAppointmentOverlay } from "@/components";

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

export default function UserCalendarPage() {
  const [newAppointmentOpened, newAppointmentHandlers] = useDisclosure();
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

  function onAppointmentSaved() {
    if (user?._id) {
      calendarsService.getUserCalendars(user._id).then((calendars) => {
        setCalendars(calendars || null);
      });
    }
  }

  return (
    <div key={key}> {/* Add this wrapper */}
      <NavLink
        active
        variant="filled"
        label="New Appointment"
        onClick={newAppointmentHandlers.open}
      />
      <Text mt="sm" ml="sm" tt="uppercase" size="xs" c="dimmed">
        Your Calendars
      </Text>
      <CalendarList calendars={calendars} />
      <BigCalendar calendars={visibleCalendars} />
      <NewAppointmentOverlay
        disclosure={[newAppointmentOpened, newAppointmentHandlers]}
        calendars={calendars ?? []}
        onAppointmentSaved={onAppointmentSaved}
      />
    </div>
  );
}
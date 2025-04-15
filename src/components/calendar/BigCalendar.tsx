'use client'

import { calendarsService } from "@/services/calendarsService";
import { useEffect, useState, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from 'moment';
import React from "react";
import { ICalendar } from "@/types";
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface CalendarEntry {
    id: string,
    title: string,
    start: Date,
    end: Date,
}

export function BigCalendar({ calendars }: { calendars: ICalendar[] }) {
    const [appointments, setAppointments] = useState<CalendarEntry[] | null>(null);

    const getAppointments = useCallback(async (range: Date[] | { start: Date, end: Date }) => {
        if (!('start' in range && 'end' in range)) return []; // TODO deal with the other case

        const appointments: CalendarEntry[] = [];
        for (const calendar of calendars) {
            const app = await calendarsService.getAppointmentsBetweenDates(calendar._id!, range.start, range.end);
            console.debug(app);
            if (!app) continue;
            app.forEach(a => appointments.push({
                id: a._id!,
                title: a.title,
                start: a.inTime,
                end: a.outTime,
            }));
        }
        setAppointments(appointments);
    }, [calendars]);

    function onRangeChange(range: Date[] | { start: Date, end: Date }) {
        console.debug("range changed");
        getAppointments(range);
    }

    useEffect(() => {
        // Assume a month view and fetch events with a 7-day margin of this month.
        const start = new Date();
        start.setDate(-7);
        const end = new Date();
        end.setDate(37);

        getAppointments({ start, end });
    }, [calendars, getAppointments]);

    return (
        <Calendar
            style={{
                height: "calc(100dvh - var(--app-shell-header-offset, 0rem) - var(--app-shell-padding) - var(--app-shell-footer-offset, 0rem) - var(--app-shell-padding))",
                minHeight: "500px",
            }}
            localizer={momentLocalizer(moment)}
            onRangeChange={onRangeChange}
            events={appointments ?? []}
        ></Calendar>
    );
}
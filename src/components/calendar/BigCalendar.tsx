'use client'

import { calendarsService } from "@/services/calendarsService";
import { useEffect, useState, useCallback, useRef } from "react";
import { Calendar, momentLocalizer, DateRange, Views, View } from "react-big-calendar";
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ICalendar } from "@/types";

interface CalendarEntry {
    id: string;
    title: string;
    start: Date;
    end: Date;
}

export function BigCalendar({ calendars = [] }: { calendars: ICalendar[] }) {
    const [appointments, setAppointments] = useState<CalendarEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState<View>(Views.MONTH); // Track the current view
    const mountedRef = useRef(true);
    
    const localizer = momentLocalizer(moment);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const fetchAppointments = useCallback(async (start: Date, end: Date) => {
        if (!mountedRef.current || calendars.length === 0) return;

        setIsLoading(true);
        setError(null);

        try {
            const appointments: CalendarEntry[] = [];
            
            for (const calendar of calendars) {
                if (!calendar._id) continue;
                
                const app = await calendarsService.getAppointmentsBetweenDates(
                    calendar._id, 
                    start, 
                    end
                );
                
                if (!app) continue;
                
                app.forEach(a => {
                    if (a._id && a.inTime && a.outTime) {
                        appointments.push({
                            id: a._id,
                            title: a.title || 'No title',
                            start: new Date(a.inTime),
                            end: new Date(a.outTime),
                        });
                    }
                });
            }
            
            if (mountedRef.current) {
                setAppointments(appointments);
            }
        } catch (err) {
            if (mountedRef.current) {
                setError('Failed to fetch appointments');
                console.error('Error fetching appointments:', err);
            }
        } finally {
            if (mountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [calendars]);

    const onNavigate = useCallback((newDate: Date) => {
        setCurrentDate(newDate);
    }, []);

    const onView = useCallback((newView: View) => {
        setCurrentView(newView); // Update the current view
    
        // Map the view to a valid moment unit
        const momentUnit = newView === "agenda" ? "day" : (newView as moment.unitOfTime.StartOf);
    
        const start = moment(currentDate).startOf(momentUnit).toDate();
        const end = moment(currentDate).endOf(momentUnit).toDate();
        fetchAppointments(start, end);
    }, [currentDate, fetchAppointments]);
    
    const onRangeChange = useCallback((range: Date[] | DateRange) => {
        let start: Date;
        let end: Date;
    
        // Map the current view to a valid moment unit
        const momentUnit = currentView === "agenda" ? "day" : (currentView as moment.unitOfTime.StartOf);
    
        if (Array.isArray(range)) {
            start = moment(range[0]).startOf(momentUnit).toDate();
            end = moment(range[range.length - 1]).endOf(momentUnit).toDate();
        } else {
            start = moment(range.start).startOf(momentUnit).toDate();
            end = moment(range.end).endOf(momentUnit).toDate();
        }
    
        fetchAppointments(start, end);
    }, [fetchAppointments, currentView]);
    
    useEffect(() => {
        mountedRef.current = true;
    
        // Map the current view to a valid moment unit
        const momentUnit = currentView === "agenda" ? "day" : (currentView as moment.unitOfTime.StartOf);
    
        const start = moment(currentDate)
            .startOf(momentUnit)
            .subtract(7, "days")
            .toDate();
        const end = moment(currentDate)
            .endOf(momentUnit)
            .add(7, "days")
            .toDate();
    
        fetchAppointments(start, end);
    
        return () => {
            mountedRef.current = false;
        };
    }, [currentDate, fetchAppointments, currentView]);

    return (
        <div style={{ position: 'relative' }}>
            {isLoading && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
                    Loading...
                </div>
            )}
            {error && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, color: 'red' }}>
                    {error}
                </div>
            )}
            
            <Calendar
                key={calendars.length} // Force re-render when calendars change
                style={{
                    height: "calc(100dvh - var(--app-shell-header-offset, 0rem) - var(--app-shell-padding) - var(--app-shell-footer-offset, 0rem) - var(--app-shell-padding))",
                    minHeight: "500px",
                    opacity: isLoading ? 0.7 : 1,
                }}
                localizer={localizer}
                events={appointments}
                onRangeChange={onRangeChange}
                onNavigate={onNavigate}
                onView={onView}
                view={currentView} // Bind the current view
                date={currentDate}
                startAccessor="start"
                endAccessor="end"
                titleAccessor="title"
                defaultView={Views.MONTH}
            />
        </div>
    );
}
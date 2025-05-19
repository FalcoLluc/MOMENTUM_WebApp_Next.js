import apiClient from "@/lib/apiClient";
import { ICalendar, IAppointment } from "@/types";
class CalendarsService {
    async createCalendar(calendar: Partial<ICalendar>) {
        try {
            await apiClient.post(`/calendars`, calendar);
        } catch (error) {
            console.error(error);
        }
    }

    async getUserCalendars(userId: string) {
        try {
            const { data } = await apiClient.get<{message: string, calendars: ICalendar[]}>("/calendars/" + userId);
            return data.calendars;
        } catch (error) {
            console.error(error);
        }
    }

    async getAppointmentsBetweenDates(calendarId: string, d1: Date, d2: Date) {
        try {
            const { data } = await apiClient.get<{message: string, appointments: IAppointment[]}>(`/calendars/${calendarId}/appointments/${d1}/${d2}`);
            return data.appointments;
        } catch (error) {
            console.error(error);
        }
    }

    async createEvent(calendarId: string, appointment: IAppointment) {
        try {
            await apiClient.post(`/calendars/${calendarId}/appointments`, appointment);
        } catch (error) {
            console.error(error);
        }
    }

    async deleteEvent(eventId: string) {
        await apiClient.delete(`/calendars/appointments/${eventId}/soft-delete`);
    }
}

export const calendarsService = new CalendarsService();
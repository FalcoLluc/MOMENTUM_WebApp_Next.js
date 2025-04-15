import apiClient from "@/lib/apiClient";

export interface ICalendar {
    owner: string;
    calendarName: string;
    appointments: string[];
    invitees: string[];
    isDeleted: boolean;
    _id?: string;
}

export interface IAppointment {
    _id?: string;
    inTime: Date;
    outTime: Date;
    place: string;
    title: string;
    isDeleted: boolean;
}


class CalendarsService {
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
}

export const calendarsService = new CalendarsService();
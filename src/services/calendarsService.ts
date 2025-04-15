import apiClient from "@/lib/apiClient";

export interface ICalendar {
    owner: string;
    calendarName: string;
    appointments: string[];
    invitees: string[];
    isDeleted: boolean;
    _id?: string;
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
}

export const calendarsService = new CalendarsService();
import apiClient from "@/lib/apiClient";
import { ICalendar, IAppointment, AppointmentPlanningResponse } from "@/types";
class CalendarsService {
    async createCalendar(calendar: Partial<ICalendar>) {
        try {
            await apiClient.post(`/calendars`, calendar);
        } catch (error) {
            console.error(error);
        }
    }

    async editCalendar(calendarId: string, changes: Partial<ICalendar>) {
        await apiClient.patch("/calendars/" + calendarId, changes);
    }

    async deleteCalendar(calendarId: string) {
        await apiClient.delete("/calendars/" + calendarId);
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

    async planAppointmentsAi(userId: string, prompt: string): Promise<AppointmentPlanningResponse | null> {
        try {
            const response = await apiClient.post("/calendars/appointment-planning", {
                userId,
                prompt,
            });
            return response.data;
        } catch (error) {
            console.error(error);
            return null;
        }

    }
    async getCommonSlotsUserAndLocation(
        userId: string,
        locationId: string,
        date1: Date,
        date2: Date
        ): Promise<[string, [Date, Date][]][] | null> {
        try {
            const response = await apiClient.post<{
            message: string;
            commonSlots: [string, [Date, Date][]][];
            }>("/calendars/common-slots/user-location", {
            userId,
            locationId,
            date1,
            date2,
            });
            return response.data.commonSlots;
        } catch (error) {
            console.error("Error fetching common slots:", error);
            return null;
        }
    }

    async requestAppointment(calendarId: string, workerId: string, appointment: IAppointment) {
        try {
            const response = await apiClient.post("/calendars/appointmentRequest", {
            calendarId,
            workerId,
            appointment,
            });
            return response.data; // { message: 'Appointment request set for worker' }
        } catch (error) {
            console.error("Error requesting appointment:", error);
            throw error;
        }
    }

    async acceptRequestedAppointment(appointmentId: string) {
        try {
            const response = await apiClient.put("/calendars/appointment/accept/requested", {
            appointmentId,
            });
            return response.data; // Podría ser el appointment actualizado
        } catch (error) {
            console.error("Error accepting requested appointment:", error);
            throw error;
        }
    }

    async confirmAppointment(appointmentId: string) {
        await apiClient.put("/calendars/appointment/accept/requested", {
            appointmentId,
        })
    }
}

export const calendarsService = new CalendarsService();
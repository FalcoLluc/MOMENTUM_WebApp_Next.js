import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CalendarState {
    selectedCalendars: Set<string>,
    selectCalendar: (id: string) => void,
    unselectCalendar: (id: string) => void,
}

export const useCalendarStore = create<CalendarState>()(persist(
    (set) => ({
        selectedCalendars: new Set(),

        selectCalendar: (id: string) => set( state => {
            state.selectedCalendars.add(id);
            return { selectedCalendars: new Set(state.selectedCalendars) };
        } ),
        unselectCalendar: (id: string) => set( state => {
            state.selectedCalendars.delete(id);
            return { selectedCalendars: new Set(state.selectedCalendars) };
        } ),
    }),
    {
        name: "calendar-store",
        storage: createJSONStorage(() => localStorage), 
        // Convert Set -> Array before saving
        partialize: (state) => ({
            selectedCalendars: Array.from(state.selectedCalendars),
        }),
        
        // Convert Array -> Set after loading
        merge: (persistedState, currentState) => ({
            ...currentState,
            selectedCalendars: new Set(
                (persistedState as {selectedCalendars: string[]}).selectedCalendars ?? []
            ),
        }),
    },
))
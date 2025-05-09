// store/calendarStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CalendarState {
  selectedCalendars: Set<string>;
  selectCalendar: (id: string) => void;
  unselectCalendar: (id: string) => void;
  toggleCalendarSelection: (id: string) => void;
  selectAllCalendars: (ids: string[]) => void;
  unselectAllCalendars: () => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      selectedCalendars: new Set(),
      
      selectCalendar: (id: string) => 
        set((state) => {
          const newSelection = new Set(state.selectedCalendars);
          newSelection.add(id);
          return { selectedCalendars: newSelection };
        }),
      
      unselectCalendar: (id: string) =>
        set((state) => {
          const newSelection = new Set(state.selectedCalendars);
          newSelection.delete(id);
          return { selectedCalendars: newSelection };
        }),
      
      toggleCalendarSelection: (id: string) =>
        set((state) => {
          const newSelection = new Set(state.selectedCalendars);
          if (newSelection.has(id)) {
            newSelection.delete(id);
          } else {
            newSelection.add(id);
          }
          return { selectedCalendars: newSelection };
        }),
      
      selectAllCalendars: (ids: string[]) =>
        set(() => ({
          selectedCalendars: new Set(ids),
        })),
      
      unselectAllCalendars: () =>
        set(() => ({
          selectedCalendars: new Set(),
        })),
    }),
    {
      name: "calendar-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedCalendars: Array.from(state.selectedCalendars),
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        selectedCalendars: new Set(
          (persistedState as { selectedCalendars: string[] }).selectedCalendars ?? []
        ),
      }),
    }
  )
);

// Utility hook for common operations
export const useCalendarActions = () => {
  const {
    selectCalendar,
    unselectCalendar,
    toggleCalendarSelection,
    selectAllCalendars,
    unselectAllCalendars,
  } = useCalendarStore();
  
  return {
    selectCalendar,
    unselectCalendar,
    toggleCalendarSelection,
    selectAllCalendars,
    unselectAllCalendars,
  };
};
// app/components/Calendar/NewAppointmentOverlay.tsx
'use client'

import { Button, Drawer, Group, NativeSelect, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { calendarsService} from "@/services/calendarsService";
import { IAppointment, ICalendar } from "@/types";
import { useEffect, useState } from "react";

export function NewAppointmentOverlay(
    {
        disclosure: [open, handlers], 
        calendars,
        onAppointmentSaved,
    }: {
        disclosure: ReturnType<typeof useDisclosure>,
        calendars: ICalendar[],
        onAppointmentSaved: () => void,
    }) {

    // Events are added by default the next hour and last for an hour
    function getDefaultEventTime(type: "start" | "end") {
        const date = new Date();
        date.setMinutes(0);
        date.setHours(date.getHours() + (type == "start" ? 1 : 2));
        return date
    }

    interface FormValues {
        calendar: string | undefined,
        title: string,
        location: string,
        startTime: Date,
        endTime: Date,
    }

    const form = useForm<FormValues>({
        mode: 'uncontrolled',
        initialValues: {
            calendar: "",
            title: "",
            location: "",
            startTime: getDefaultEventTime("start"),
            endTime: getDefaultEventTime("end"),
        }
    });

    const [calendarOptions, setCalendarOptions] = useState<{label: string, value: string}[]>([]);
    useEffect(() => {
        const calendarOptions = calendars.map( (calendar) => 
            ({label: calendar.calendarName, value: calendar._id!})
        );
        calendarOptions.unshift({label: "", value: ""}); // add a default invalid blank option
        setCalendarOptions(calendarOptions);
    }, [calendars]);

    async function createEvent(values: FormValues) {
        console.log(values);
        const appointment: IAppointment = {
            inTime: values.startTime,
            outTime: values.endTime,
            place: values.location,
            title: values.title,
            isDeleted: false,
        }

        if(!values.calendar) return;

        await calendarsService.createEvent(values.calendar, appointment); // TODO validate data and handle errors
        onAppointmentSaved(); // TODO only call this if the appointment was saved correctly
        handlers.close();
    }

    return (
        <Drawer opened={open} onClose={handlers.close} title="New Appointment">
            <form onSubmit={form.onSubmit((values) => createEvent(values))}>
                <NativeSelect 
                    key={form.key('calendar')}
                    label="Calendar"
                    data={calendarOptions}
                    {...form.getInputProps('calendar')}
                ></NativeSelect>

                <TextInput key={form.key('location')} label="Location" {...form.getInputProps('location')}></TextInput>
                <TextInput key={form.key('title')} label="Title" {...form.getInputProps('title')}></TextInput>
                <DateTimePicker key={form.key('startTime')} label="Start Time" {...form.getInputProps('startTime')}></DateTimePicker>
                <DateTimePicker key={form.key('endTime')} label="End Time" placeholder="" {...form.getInputProps('endTime')}></DateTimePicker>
                <Group justify="flex-end" mt="md">
                    <Button variant="outline" color="red" onClick={handlers.close}>Cancel</Button>
                    <Button type="submit">Create Appointment</Button>
                </Group>
            </form>
        </Drawer>
    )
}
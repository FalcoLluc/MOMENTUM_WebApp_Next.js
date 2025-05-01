'use client';

import { Button, ColorInput, Drawer, Group, NativeSelect, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { calendarsService } from "@/services/calendarsService";
import { IAppointment, ICalendar } from "@/types";
import { appointmentServiceType, appointmentState } from "@/types/enums";
import { useEffect, useState } from "react";

export function NewAppointmentOverlay({
  disclosure: [open, handlers],
  calendars,
  onAppointmentSaved,
}: {
  disclosure: ReturnType<typeof useDisclosure>;
  calendars: ICalendar[];
  onAppointmentSaved: () => void;
}) {
  // Events are added by default the next hour and last for an hour
  function getDefaultEventTime(type: "start" | "end") {
    const date = new Date();
    date.setMinutes(0);
    date.setHours(date.getHours() + (type === "start" ? 1 : 2));
    return date;
  }

  interface FormValues {
    calendar: string | undefined;
    title: string;
    location: string;
    serviceType: appointmentServiceType;
    description?: string;
    startTime: Date;
    endTime: Date;
    colour: string;
  }

  const form = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      calendar: "",
      title: "",
      location: "",
      serviceType: appointmentServiceType.PERSONAL, // Default service type
      description: "",
      startTime: getDefaultEventTime("start"),
      endTime: getDefaultEventTime("end"),
      colour: "#228be6",
    },
    onValuesChange: (values, previousValues) => {
      // If we change the calendar, set the colour picker to the default colour of the calendar
      if (values.calendar !== previousValues.calendar) {
        const calendar = calendars.find((c) => c._id === values.calendar);
        if (calendar) form.setFieldValue("colour", calendar.defaultColour ?? "#228be6");
      }
    },
  });

  const [calendarOptions, setCalendarOptions] = useState<{ label: string; value: string }[]>([]);
  useEffect(() => {
    const calendarOptions = calendars.map((calendar) => ({
      label: calendar.calendarName,
      value: calendar._id!,
    }));
    calendarOptions.unshift({ label: "", value: "" }); // Add a default invalid blank option
    setCalendarOptions(calendarOptions);
  }, [calendars]);

  async function createEvent(values: FormValues) {
    const appointment: IAppointment = {
      inTime: values.startTime,
      outTime: values.endTime,
      location: values.location,
      title: values.title,
      serviceType: values.serviceType,
      description: values.description,
      colour: values.colour,
      appointmentState: appointmentState.REQUESTED, // Default state
      isDeleted: false,
    };

    if (!values.calendar) return;

    await calendarsService.createEvent(values.calendar, appointment); // TODO: Validate data and handle errors
    onAppointmentSaved(); // TODO: Only call this if the appointment was saved correctly
    handlers.close();
  }

  return (
    <Drawer opened={open} onClose={handlers.close} title="New Appointment">
      <form onSubmit={form.onSubmit((values) => createEvent(values))}>
        <NativeSelect
          key={form.key("calendar")}
          label="Calendar"
          data={calendarOptions}
          {...form.getInputProps("calendar")}
        ></NativeSelect>

        <TextInput key={form.key("location")} label="Location" {...form.getInputProps("location")}></TextInput>
        <TextInput key={form.key("title")} label="Title" {...form.getInputProps("title")}></TextInput>
        <NativeSelect
          key={form.key("serviceType")}
          label="Service Type"
          data={Object.values(appointmentServiceType).map((type) => ({ label: type, value: type }))}
          {...form.getInputProps("serviceType")}
        ></NativeSelect>
        <TextInput key={form.key("description")} label="Description" {...form.getInputProps("description")}></TextInput>
        <DateTimePicker
          key={form.key("startTime")}
          label="Start Time"
          {...form.getInputProps("startTime")}
        ></DateTimePicker>
        <DateTimePicker
          key={form.key("endTime")}
          label="End Time"
          placeholder=""
          {...form.getInputProps("endTime")}
        ></DateTimePicker>
        <ColorInput key={form.key("colour")} label="Colour" {...form.getInputProps("colour")}></ColorInput>
        <Group justify="flex-end" mt="md">
          <Button variant="outline" color="red" onClick={handlers.close}>
            Cancel
          </Button>
          <Button type="submit">Create Appointment</Button>
        </Group>
      </form>
    </Drawer>
  );
}
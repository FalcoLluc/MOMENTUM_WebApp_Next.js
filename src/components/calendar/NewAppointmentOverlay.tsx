'use client';

import { Button, ColorInput, Drawer, Group, NativeSelect, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { calendarsService } from "@/services/calendarsService";
import { IAppointment, ICalendar, GeoJSONPoint } from "@/types";
import { AppointmentServiceType, AppointmentState } from "@/types/enums";
import { useEffect, useState } from "react";

// TRIEM QUIN VOLEM PER BUSCAR ADREÇA
import { SearchBoxForm  } from "@/components"
//import { SearchBoxOpenStreetForm } from "@/components";

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
    location?: string;
    serviceType: AppointmentServiceType;
    description?: string;
    startTime: Date;
    endTime: Date;
    colour: string;
    customUbicacion?: GeoJSONPoint;
    customAddress?: string;
  }

  const form = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      calendar: "",
      title: "",
      serviceType: AppointmentServiceType.PERSONAL, // Default service type
      description: "",
      startTime: getDefaultEventTime("start"),
      endTime: getDefaultEventTime("end"),
      colour: "#228be6",
      customUbicacion: undefined,
      customAddress: undefined, 
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
    if (!values.calendar || !values.title) {
      return;
    }

    const appointment: IAppointment = {
      inTime: values.startTime,
      outTime: values.endTime,
      title: values.title,
      serviceType: values.serviceType,
      description: values.description || undefined, // Convert empty string to undefined
      colour: values.colour,
      appointmentState: AppointmentState.ACCEPTED,
      isDeleted: false,
      ...(values.customUbicacion && values.customAddress
        ? {
            customUbicacion: values.customUbicacion,
            customAddress: values.customAddress
          }
        : {
            customUbicacion: undefined,
            customAddress: undefined
          })
    };

    try {
      await calendarsService.createEvent(values.calendar, appointment);
      onAppointmentSaved();
      handlers.close();
    } catch (error) {
      console.error('Failed to create appointment:', error);
      // Add error handling here
    }
  }

  return (
    <Drawer opened={open} onClose={handlers.close} title="New Personal Appointment">
      <form onSubmit={form.onSubmit((values) => createEvent(values))}>
        <NativeSelect
          key={form.key("calendar")}
          label="Calendar"
          data={calendarOptions}
          {...form.getInputProps("calendar")}
          required 
          withAsterisk
        ></NativeSelect>

        {/* Address Input */}
        <SearchBoxForm
          onSave={(address, location) => {
            form.setFieldValue("customAddress", address);
            form.setFieldValue("customUbicacion", location);
            console.log("Address saved:", address, location);
          }}
        />

        <TextInput 
          key={form.key("title")} 
          label="Title" {...form.getInputProps("title")} 
          required
          withAsterisk 
          color="primary"
        ></TextInput>
        <NativeSelect
          key={form.key("serviceType")}
          label="Service Type"
          data={Object.values(AppointmentServiceType).map((type) => ({ label: type, value: type }))}
          {...form.getInputProps("serviceType")}
          required
        ></NativeSelect>
        <TextInput key={form.key("description")} label="Description" {...form.getInputProps("description")} color="primary"></TextInput>
        <DateTimePicker
          key={form.key("startTime")}
          label="Start Time"
          {...form.getInputProps("startTime")}
          required
          withAsterisk
        ></DateTimePicker>
        <DateTimePicker
          key={form.key("endTime")}
          label="End Time"
          placeholder=""
          {...form.getInputProps("endTime")}
          required
          withAsterisk
        ></DateTimePicker>
        <ColorInput key={form.key("colour")} label="Colour" {...form.getInputProps("colour")}></ColorInput>
        <Group justify="flex-end" mt="md">
          <Button variant="outline" color="red" onClick={handlers.close}>
            Cancel
          </Button>
          <Button type="submit" color="primary">Create Appointment</Button>
        </Group>
      </form>
    </Drawer>
  );
}
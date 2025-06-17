'use client';

import { calendarsService } from "@/services/calendarsService";
import { useAuthStore } from "@/stores/authStore";
import { Button, ColorInput, Group, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

export function NewCalendar({
  disclosure: [open, handlers],
  onCalendarSaved,
}: {
  disclosure: ReturnType<typeof useDisclosure>;
  onCalendarSaved: () => void;
}) {
  const worker = useAuthStore((state) => state.worker);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      calendarName: "",
      defaultColour: "#228be6",
    },
  });

  async function createCalendar(values: { calendarName: string; defaultColour: string }) {
    if (!worker || !worker._id) return;

    const newCalendar = {
      calendarName: values.calendarName,
      defaultColour: values.defaultColour,
      owner: worker._id,
    };

    try {
      await calendarsService.createCalendar(newCalendar);
      notifications.show({
        message: "Calendar created successfully",
        color: "green",
      });
      onCalendarSaved();
      handlers.close();
    } catch {
      notifications.show({
        message: "Internal error creating calendar",
        color: "red",
      });
    }
  }

  return (
    <Modal opened={open} onClose={handlers.close} title="Create Calendar" centered>
      <form onSubmit={form.onSubmit(createCalendar)}>
        <TextInput
          label="Calendar Name"
          {...form.getInputProps("calendarName")}
          required
        />
        <ColorInput label="Colour" {...form.getInputProps("defaultColour")} />

        <Group justify="flex-end" mt="md">
          <Button variant="outline" color="red" onClick={handlers.close}>
            Cancel
          </Button>
          <Button type="submit">Create Calendar</Button>
        </Group>
      </form>
    </Modal>
  );
}

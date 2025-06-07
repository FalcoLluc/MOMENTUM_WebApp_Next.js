'use client';

import {
  Button,
  Group,
  TextInput,
  MultiSelect,
  NumberInput,
  Select,
  Stack,
  ActionIcon,
  Text,
  Title,
  Divider,
  Paper
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { adminService } from "@/services/adminService";
import { ILocation, GeoJSONPoint } from "@/types";
import { LocationServiceType, LocationSchedule } from "@/types/enums";
import { useState } from "react";
import { SearchBoxForm } from "@/components";
import { useAuthStore } from "@/stores/authStore";
import { IconTrash, IconClock, IconPlus } from "@tabler/icons-react";
import { notifications } from '@mantine/notifications';

export function NewLocationOverlay({
  onClose,
  onLocationCreated,
}: {
  onClose: () => void;
  onLocationCreated: () => void;
}) {
  const worker = useAuthStore((state) => state.worker);
  const [loading, setLoading] = useState(false);

  const form = useForm<Partial<ILocation>>({
    initialValues: {
      nombre: "",
      address: "",
      phone: "",
      rating: 0,
      ubicacion: { type: "Point", coordinates: [0, 0] } as GeoJSONPoint,
      serviceType: [],
      schedule: [],
    },
  });

  async function handleSubmit(values: Partial<ILocation>) {
    setLoading(true);
    try {
      await adminService.createLocation({
        ...values,
        business: worker?.businessAdministrated || "",
        workers: [],
        isDeleted: false,
      } as ILocation);

      notifications.show({
        title: 'Location Created',
        message: 'The location has been successfully created!',
        color: 'green',
      });

      onLocationCreated();
    } catch (error) {
      console.error("Failed to create location:", error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to create location.';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }

  const addSchedule = () => {
    form.setFieldValue("schedule", [
      ...(form.values.schedule || []),
      { day: LocationSchedule.MONDAY, open: "09:00", close: "17:00" },
    ]);
  };

  const removeSchedule = (index: number) => {
    const updatedSchedule = [...(form.values.schedule || [])];
    updatedSchedule.splice(index, 1);
    form.setFieldValue("schedule", updatedSchedule);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        <Title order={4} fw={600}>Create New Location</Title>
        
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <TextInput
              label="Location Name"
              placeholder="Enter location name"
              {...form.getInputProps("nombre")}
              required
            />
            
            <SearchBoxForm
              onSave={(address, location) => {
                form.setFieldValue("address", address);
                form.setFieldValue("ubicacion", location);
              }}
            />
            
            <TextInput
              label="Phone Number"
              placeholder="Enter phone number"
              {...form.getInputProps("phone")}
              required
            />
            
            <NumberInput
              label="Rating (0-5)"
              placeholder="Enter rating"
              {...form.getInputProps("rating")}
              min={0}
              max={5}
              step={0.1}
              required
            />
            
            <MultiSelect
              label="Service Types"
              placeholder="Select services"
              data={Object.values(LocationServiceType).map((type) => ({
                label: type,
                value: type,
              }))}
              {...form.getInputProps("serviceType")}
              required
              searchable
            />
          </Stack>
        </Paper>

        {/* Schedule Section */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600}>Opening Hours</Text>
              <Button 
                onClick={addSchedule} 
                size="sm" 
                variant="outline" 
                leftSection={<IconPlus size={16} />}
              >
                Add Schedule
              </Button>
            </Group>

            {form.values.schedule?.length === 0 && (
              <Text c="dimmed" fs="italic" ta="center" py="sm">
                No schedule added yet
              </Text>
            )}

            {form.values.schedule?.map((_, index) => (
              <Group key={index} gap="sm" align="flex-end" wrap="nowrap">
                <Select
                  label="Day"
                  placeholder="Select day"
                  data={Object.values(LocationSchedule).map((day) => ({
                    label: day.charAt(0) + day.slice(1).toLowerCase(),
                    value: day,
                  }))}
                  {...form.getInputProps(`schedule.${index}.day`)}
                  required
                  flex={1}
                />
                
                <TextInput
                  label="Opens"
                  type="time"
                  leftSection={<IconClock size={16} />}
                  {...form.getInputProps(`schedule.${index}.open`)}
                  required
                  flex={1}
                />
                
                <TextInput
                  label="Closes"
                  type="time"
                  leftSection={<IconClock size={16} />}
                  {...form.getInputProps(`schedule.${index}.close`)}
                  required
                  flex={1}
                />
                
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => removeSchedule(index)}
                  mb={4}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
        </Paper>

        <Divider />

        <Group justify="flex-end">
          <Button variant="outline" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Location
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
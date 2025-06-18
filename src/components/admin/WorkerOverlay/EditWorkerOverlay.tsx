'use client';

import {
  Drawer,
  Stack,
  TextInput,
  NumberInput,
  MultiSelect,
  Button,
  Group,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Worker, ILocation } from "@/types";
import { adminService } from "@/services/adminService";
import { useState, useEffect } from "react";
import { notifications } from '@mantine/notifications';
import { useAuthStore } from "@/stores/authStore";

export function EditWorkerOverlay({
  worker,
  onClose,
  opened,
  onWorkerUpdated,
}: {
  worker: Worker | null;
  onClose: () => void;
  opened: boolean;
  onWorkerUpdated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<ILocation[]>([]);

  const form = useForm<Partial<Worker>>({
    initialValues: {
      name: "",
      age: 0,
      mail: "",
      password: "",
      location: [],
    },
  });

  // Update form values when worker changes
  useEffect(() => {
    if (worker) {
      form.setValues({
        name: worker.name || "",
        age: worker.age || 0,
        mail: worker.mail || "",
        password: "", // Always empty for security
        location: worker.location || [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worker]); // form is stable from useForm so we can safely exclude it

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const bus=useAuthStore.getState().worker?.businessAdministrated;
        if (bus) {
          const fetchedLocations = await adminService.getAllLocationsOfBusiness(bus);
          console.log("Fetched locations EDIT WORKER:", fetchedLocations);
          setLocations(fetchedLocations);
        }
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      }
    };

    fetchLocations();
    
  }, []);

  async function handleSubmit(values: Partial<Worker>) {
    setLoading(true);
    try {
      if (!worker?._id) {
        throw new Error("Worker ID is missing");
      }

      // Only include password if it was changed
      const updateData = values.password
        ? values
        : { ...values, password: undefined };

      await adminService.updateWorker(worker._id, updateData);

      notifications.show({
        title: 'Worker Updated',
        message: 'The worker has been successfully updated!',
        color: 'green',
      });

      onWorkerUpdated();
      onClose();
    } catch (error) {
      console.error("Failed to update worker:", error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to update worker.';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }

  if (!worker) return null;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Edit Worker"
      position="right"
      size="lg"
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <LoadingOverlay visible={loading} />

          <TextInput
            label="Name"
            placeholder="Enter worker's name"
            {...form.getInputProps("name")}
            required
          />

          <NumberInput
            label="Age"
            placeholder="Enter worker's age"
            {...form.getInputProps("age")}
            min={18}
            max={100}
            required
          />

          <TextInput
            label="Email"
            placeholder="Enter worker's email"
            {...form.getInputProps("mail")}
            required
          />

          <TextInput
            label="Password"
            placeholder="Enter new password (optional)"
            type="password"
            {...form.getInputProps("password")}
          />

          <MultiSelect
            label="Assign Locations"
            placeholder="Select locations"
            data={locations.map((loc) => ({
              label: loc.nombre,
              value: loc._id,
            }))}
            value={form.values.location}
            onChange={(values) => form.setFieldValue('location', values)}
            searchable
          />

          <Group justify="flex-end">
            <Button variant="outline" color="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
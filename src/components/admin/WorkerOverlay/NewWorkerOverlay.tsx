'use client';

import {
  Button,
  Group,
  TextInput,
  MultiSelect,
  NumberInput,
  Stack,
  Title,
  Paper,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { adminService } from "@/services/adminService";
import { Worker, WorkerRole, ILocation } from "@/types";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";

export function NewWorkerOverlay({
  onClose,
  onWorkerCreated,
}: {
  onClose: () => void;
  onWorkerCreated: () => void;
}) {
  const worker = useAuthStore((state) => state.worker);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<ILocation[]>([]);

    const fetchLocations = useCallback(async () => {
        setLoading(true);
        try {
        if (!worker?.businessAdministrated) {
            throw new Error("No business associated with this worker.");
        }
        const fetchedLocations = await adminService.getAllLocationsOfBusiness(worker.businessAdministrated);
        setLocations(fetchedLocations);
        } catch (error) {
        console.error("Failed to fetch locations:", error);
        } finally {
        setLoading(false);
        }
    }, [worker]);

    useEffect(() => {
        if (worker) {
        fetchLocations();
        }
    }, [worker, fetchLocations]);

  const form = useForm<Partial<Worker>>({
    initialValues: {
      name: "",
      age: 0,
      mail: "",
      location: [],
      password: "",
    },
  });

  async function handleSubmit(values: Partial<Worker>) {
    setLoading(true);
    try {
      await adminService.createWorker({
        ...values,
        role: WorkerRole.WORKER, // Automatically set the role to WORKER
        businessAdministrated: worker?.businessAdministrated || "",
        isDeleted: false,
      } as Worker);
      onWorkerCreated();
    } catch (error) {
      console.error("Failed to create worker:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        <Title order={4} fw={600}>Create New Worker</Title>
        
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <TextInput
              label="Worker Name"
              placeholder="Enter worker name"
              {...form.getInputProps("name")}
              required
            />
            
            <NumberInput
              label="Age"
              placeholder="Enter worker age"
              {...form.getInputProps("age")}
              min={18}
              max={100}
              required
            />
            
            <TextInput
              label="Email"
              placeholder="Enter worker email"
              {...form.getInputProps("mail")}
              required
            />
            
            <TextInput
              label="Password"
              placeholder="Enter worker password"
              type="password"
              {...form.getInputProps("password")}
              required
            />
            
            <MultiSelect
              label="Assign Locations"
              placeholder="Select locations"
              data={locations.map((loc) => ({
                label: loc.nombre,
                value: loc._id,
              }))}
              {...form.getInputProps("location")}
              required
              searchable
            />
          </Stack>
        </Paper>

        <Group justify="flex-end">
          <Button variant="outline" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Worker
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
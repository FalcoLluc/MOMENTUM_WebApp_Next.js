'use client';

import { useState, useEffect, useCallback } from "react";
import { Button, Drawer, Table, Group, Text, Stack, Title, Paper, LoadingOverlay, Badge, Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAuthStore } from "@/stores/authStore";
import { Worker } from "@/types";
import { NewWorkerOverlay, EditWorkerOverlay } from "@/components";
import { IconPlus, IconMail, IconUser } from "@tabler/icons-react";
import { adminService } from "@/services/adminService";

export default function WorkersPage() {
  const worker = useAuthStore((state) => state.worker);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpened, { open, close }] = useDisclosure(false);
  const [editOverlayOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [locationCache, setLocationCache] = useState<Map<string, string>>(new Map()); // Cache for location names

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      if (!worker?.businessAdministrated) {
        throw new Error("No business associated with this worker.");
      }
      const fetchedWorkers = await adminService.getAllWorkersOfBusiness(worker.businessAdministrated);
      setWorkers(fetchedWorkers);
    } catch (error) {
      console.error("Failed to fetch workers:", error);
    } finally {
      setLoading(false);
    }
  }, [worker]);

  const fetchLocationName = useCallback(
    async (locationId: string) => {
      if (locationCache.has(locationId)) {
        return locationCache.get(locationId); // Return cached name if available
      }
      try {
        const location = await adminService.getLocationById(locationId);
        setLocationCache((prev) => new Map(prev).set(locationId, location.nombre)); // Cache the name
        return location.nombre;
      } catch (error) {
        console.error(`Failed to fetch location name for ID ${locationId}:`, error);
        return "Unknown Location";
      }
    },
    [locationCache]
  );

  useEffect(() => {
    if (worker) {
      fetchWorkers();
    }
  }, [worker, fetchWorkers]);

  const handleWorkerCreated = () => {
    fetchWorkers(); // Refresh workers after a new one is created
    close(); // Close the drawer
  };

  const handleEditWorker = (worker: Worker) => {
    setSelectedWorker(worker); // Set the worker to be edited
    openEdit(); // Open the edit overlay
  };

  const handleWorkerUpdated = () => {
    fetchWorkers(); // Refresh workers after an update
    closeEdit(); // Close the edit overlay
  };

  if (!worker) {
    return (
      <Box style={{ height: '200px', display: 'grid', placeItems: 'center' }}>
        <LoadingOverlay visible />
      </Box>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title order={2} fw={600}>Business Workers</Title>
        <Button 
          onClick={open} 
          leftSection={<IconPlus size={18} />}
          size="sm"
          color="primary"
        >
          Add New Worker
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md" pos="relative">
        <LoadingOverlay visible={loading} zIndex={100} overlayProps={{ radius: "md", blur: 2 }} />
        
        {workers.length === 0 ? (
          <Box py="xl" ta="center">
            <Text c="dimmed" size="lg" mb="sm">
              No workers found for your business
            </Text>
            <Button onClick={open} variant="outline">
              Add your first worker
            </Button>
          </Box>
        ) : (
          <Table striped highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Age</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Locations</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {workers.map((worker) => (
                <Table.Tr key={worker._id}>
                  <Table.Td fw={500}>
                    <Group gap="xs">
                      <IconUser size={16} style={{ color: 'var(--mantine-color-blue-6)' }} />
                      <Text>{worker.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs"style={{ color: 'var(--mantine-color-blue-6)' }}>
                      <IconMail size={16}/>
                      <Text>{worker.mail}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{worker.age}</Table.Td>
                  <Table.Td>
                    <Badge color="primary" variant="light">
                      {worker.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {worker.location.length > 0 ? (
                      <Group gap="xs">
                        {worker.location.map((locId, index) => {
                          const locationName = locationCache.get(locId) || "Loading...";
                          if (locationName === "Loading...") {
                            // Fetch the location name if it's not already cached
                            fetchLocationName(locId);
                          }
                          return (
                            <Badge key={index} color="secondary" variant="light">
                              {locationName}
                            </Badge>
                          );
                        })}
                      </Group>
                    ) : (
                      <Text c="dimmed">No locations assigned</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Button size="xs" variant="outline" onClick={() => handleEditWorker(worker)} color="primary">
                      Edit
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Drawer
        opened={drawerOpened}
        onClose={close}
        title="Add New Worker"
        position="right"
        size="xl"
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      >
        <NewWorkerOverlay 
          onClose={close} 
          onWorkerCreated={handleWorkerCreated} 
        />
      </Drawer>

      {/* Edit Worker Overlay */}
      <EditWorkerOverlay
        worker={selectedWorker}
        onClose={closeEdit}
        opened={editOverlayOpened}
        onWorkerUpdated={handleWorkerUpdated}
      />
    </Stack>
  );
}
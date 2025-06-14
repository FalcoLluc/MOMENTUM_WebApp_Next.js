'use client';

import { useState, useEffect, useCallback } from "react";
import { Button, Drawer, Table, Group, Text, Stack, Title, Paper, LoadingOverlay, Badge, Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAuthStore } from "@/stores/authStore";
import { adminService } from "@/services/adminService";
import { ILocation } from "@/types";
import { NewLocationOverlay, LocationDetailsOverlay } from "@/components";
import { IconMapPin, IconPhone, IconStar, IconPlus } from "@tabler/icons-react";

export default function LocationsPage() {
  const worker = useAuthStore((state) => state.worker);
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpened, { open, close }] = useDisclosure(false);
  const [selectedLocation, setSelectedLocation] = useState<ILocation | null>(null); // State for selected location
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false); // State for details overlay

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

  const handleLocationCreated = () => {
    fetchLocations();
    close();
  };

  const handleViewDetails = (location: ILocation) => {
    setSelectedLocation(location); // Set the selected location
    openDetails(); // Open the details overlay
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
        <Title order={2} fw={600}>Business Locations</Title>
        <Button 
          onClick={open} 
          leftSection={<IconPlus size={18} />}
          size="sm"
          color="primary"
        >
          Add New Location
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md" pos="relative">
        <LoadingOverlay visible={loading} zIndex={100} overlayProps={{ radius: "md", blur: 2 }} />
        
        {locations.length === 0 ? (
          <Box py="xl" ta="center">
            <Text c="dimmed" size="lg" mb="sm">
              No locations found for your business
            </Text>
            <Button onClick={open} variant="outline">
              Add your first location
            </Button>
          </Box>
        ) : (
          <Table striped highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Address</Table.Th>
                <Table.Th>Contact</Table.Th>
                <Table.Th ta="center">Rating</Table.Th>
                <Table.Th ta="center">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {locations.map((location) => (
                <Table.Tr key={location._id}>
                  <Table.Td fw={500}>{location.nombre}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <IconMapPin size={16} style={{ color: 'var(--mantine-color-blue-6)' }}/>
                      <Text color="secondary" lineClamp={1}>{location.address}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <IconPhone size={16} style={{ color: 'var(--mantine-color-teal-6)' }} />
                      <Text color="secondary">{location.phone}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td ta="center">
                    <Badge
                      leftSection={<IconStar size={14} style={{ marginTop: 3 }} />}
                      color={location.rating >= 4 ? 'teal' : location.rating >= 2.5 ? 'yellow' : 'red'}
                      variant="light"
                    >
                      {location.rating.toFixed(1)}
                    </Badge>
                  </Table.Td>
                  <Table.Td ta="center">
                    <Button size="xs" variant="outline" onClick={() => handleViewDetails(location)} color="secondary">
                      View Details
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
        title="Add New Location"
        position="right"
        size="xl"
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      >
        <NewLocationOverlay 
          onClose={close} 
          onLocationCreated={handleLocationCreated} 
        />
      </Drawer>

      {/* Location Details Overlay */}
      <LocationDetailsOverlay
        location={selectedLocation}
        onClose={closeDetails}
        opened={detailsOpened}
      />
    </Stack>
  );
}
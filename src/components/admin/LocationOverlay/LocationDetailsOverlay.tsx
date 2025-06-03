'use client';

import { Drawer, Group, Stack, Text, Title, Badge, Divider } from "@mantine/core";
import { IconMapPin, IconPhone, IconStar } from "@tabler/icons-react";
import { ILocation } from "@/types";

export function LocationDetailsOverlay({
  location,
  onClose,
  opened,
}: {
  location: ILocation | null; // Pass the selected location
  onClose: () => void;
  opened: boolean;
}) {
  if (!location) return null; // If no location is selected, return nothing

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={<Title order={4}>Location Details</Title>}
      position="right"
      size="lg"
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
    >
      <Stack gap="md">
        {/* Location Name */}
        <Title order={5}>{location.nombre}</Title>

        {/* Address */}
        <Group gap="xs">
          <IconMapPin size={16} style={{ color: 'var(--mantine-color-blue-6)' }} />
          <Text>{location.address}</Text>
        </Group>

        {/* Phone */}
        <Group gap="xs">
          <IconPhone size={16} style={{ color: 'var(--mantine-color-teal-6)' }} />
          <Text>{location.phone}</Text>
        </Group>

        {/* Rating */}
        <Group gap="xs">
          <IconStar size={16} style={{ color: 'var(--mantine-color-yellow-6)' }} />
          <Badge
            color={location.rating >= 4 ? 'teal' : location.rating >= 2.5 ? 'yellow' : 'red'}
            variant="light"
          >
            {location.rating.toFixed(1)} / 5
          </Badge>
        </Group>

        <Divider />

        {/* Service Types */}
        <Stack>
          <Text fw={600}>Services Offered:</Text>
          {location.serviceType.length > 0 ? (
            <Group gap="xs">
              {location.serviceType.map((service, index) => (
                <Badge key={index} color="blue" variant="light">
                  {service}
                </Badge>
              ))}
            </Group>
          ) : (
            <Text c="dimmed">No services listed</Text>
          )}
        </Stack>

        <Divider />

        {/* Schedule */}
        <Stack>
          <Text fw={600}>Opening Hours:</Text>
          {location.schedule.length > 0 ? (
            <Stack>
              {location.schedule.map((entry, index) => (
                <Group key={index} justify="space-between">
                  <Text>{entry.day.charAt(0).toUpperCase() + entry.day.slice(1)}</Text>
                  <Text>
                    {entry.open} - {entry.close}
                  </Text>
                </Group>
              ))}
            </Stack>
          ) : (
            <Text c="dimmed">No schedule available</Text>
          )}
        </Stack>
      </Stack>
    </Drawer>
  );
}
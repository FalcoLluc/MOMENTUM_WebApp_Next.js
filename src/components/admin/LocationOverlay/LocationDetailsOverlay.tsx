'use client';

import { Drawer, Group, Stack, Text, Badge, Paper } from "@mantine/core";
import { IconMapPin, IconPhone, IconStar, IconClock, IconTools } from "@tabler/icons-react";
import { ILocation } from "@/types";

export function LocationDetailsOverlay({
  location,
  onClose,
  opened,
}: {
  location: ILocation | null;
  onClose: () => void;
  opened: boolean;
}) {
  if (!location) return null;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={<Text size="lg" fw={600}>Location Details</Text>} 
      position="right"
      size="lg"
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
    >
      <Stack gap="md">
        {/* Location Header */}
        <Paper withBorder p="md" radius="md">
          <Text size="xl" fw={700}>{location.nombre}</Text>
          <Group gap="xs" mt="sm">
            <Badge
              leftSection={<IconStar size={14} />}
              color={location.rating >= 4 ? 'teal' : location.rating >= 2.5 ? 'yellow' : 'red'}
              variant="light"
            >
              {location.rating.toFixed(1)}
            </Badge>
          </Group>
        </Paper>

        {/* Contact Information */}
        <Paper withBorder p="md" radius="md">
          <Text fw={600} mb="sm">Contact Information</Text>
          <Group gap="xs" mb="xs">
            <IconMapPin size={18} style={{ color: 'var(--mantine-color-blue-6)' }} />
            <Text>{location.address}</Text>
          </Group>
          <Group gap="xs">
            <IconPhone size={18} style={{ color: 'var(--mantine-color-teal-6)' }} />
            <Text>{location.phone}</Text>
          </Group>
        </Paper>

        {/* Services Section */}
        <Paper withBorder p="md" radius="md">
          <Group gap="xs" mb="sm">
            <IconTools size={18} />
            <Text fw={600}>Services Offered</Text>
          </Group>
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
        </Paper>

        {/* Schedule Section */}
        <Paper withBorder p="md" radius="md">
          <Group gap="xs" mb="sm">
            <IconClock size={18} />
            <Text fw={600}>Opening Hours</Text>
          </Group>
          {location.schedule.length > 0 ? (
            <Stack gap="xs">
              {location.schedule.map((entry, index) => (
                <Group key={index} justify="space-between">
                  <Text>
                    {entry.day.charAt(0).toUpperCase() + entry.day.slice(1).toLowerCase()}
                  </Text>
                  <Text fw={500}>
                    {entry.open} - {entry.close}
                  </Text>
                </Group>
              ))}
            </Stack>
          ) : (
            <Text c="dimmed">No schedule available</Text>
          )}
        </Paper>
      </Stack>
    </Drawer>
  );
}
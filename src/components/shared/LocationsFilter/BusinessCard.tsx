'use client';

import React from 'react';
import {
  Card,
  Group,
  Text,
  Button,
  Stack,
  Title,
  Divider,
  Badge,
  ScrollArea,
} from '@mantine/core';
import { IconMapPin, IconPhone, IconStar, IconMessage } from '@tabler/icons-react';
import { IBusiness, ILocation } from '@/types';
import { chatService } from '@/services/chatService';
import { useAuthStore } from '@/stores/authStore';
import { notifications } from '@mantine/notifications';
import { ChatUserType } from '@/types/enums';
import { useRouter } from 'next/navigation';

interface BusinessCardProps {
  business: IBusiness;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  async function startChat(location: ILocation) {
    try {
      if (!user?._id) throw new Error();
      await chatService.createChat(user._id, location._id, ChatUserType.USER, ChatUserType.LOCATION);
      router.push("/users/chats?u=" + location._id);
    } catch {
      notifications.show({
        title: "Error",
        message: "Could not create chat",
        color: "red",
      });
    }
  }

  return (
    <Card withBorder shadow="sm" p="md" radius="md" style={{ display: 'flex', flexDirection: 'row', gap: '2rem' }}>
      <Stack gap="xs" style={{ minWidth: 250 }}>
        <Title order={3}>{business.name}</Title>
      </Stack>

      <Divider orientation="vertical" />

      <ScrollArea style={{ flex: 1, maxHeight: 300 }}>
        <Stack gap="md">
          {business.location.map((loc) => (
            <Card key={loc._id} withBorder shadow="xs" radius="md" p="sm">
              <Group justify="space-between">
                <Text w={500}>{loc.nombre}</Text>
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<IconMessage size={16} />}
                  onClick={() => startChat(loc)}
                >
                  Start Chat
                </Button>
              </Group>

              <Text size="sm" c="dimmed" mt={5}>
                <IconMapPin size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {loc.address}
              </Text>

              <Text size="sm" c="dimmed">
                <IconPhone size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {loc.phone}
              </Text>

              <Group gap="xs" mt={5}>
                <IconStar size={14} color="gold" />
                <Text size="sm">{loc.rating.toFixed(1)} / 5</Text>
              </Group>

              <Group gap="xs" mt={5}>
                {loc.serviceType.map((service) => (
                  <Badge key={service} color="blue" variant="light">
                    {service}
                  </Badge>
                ))}
              </Group>
            </Card>
          ))}
        </Stack>
      </ScrollArea>
    </Card>
  );
};
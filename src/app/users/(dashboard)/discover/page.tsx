'use client';

import React, { useState } from 'react';
import { Title, Container, Stack, TextInput, Button, List, Text, Group } from '@mantine/core';
import { usersService } from '@/services/usersService';
import { User } from '@/types';
import { useAuthStore } from '@/stores/authStore';

export default function DiscoverPage() {
  const [searchName, setSearchName] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usuario actual con la lista de ids a los que sigue
  const currentUser = useAuthStore((state) => state.user);

  const handleSearch = async () => {
    setError(null);
    setLoading(true);
    try {
      const results = await usersService.searchUsersByName(searchName);
      const filtered = results?.filter(user => user._id !== currentUser?._id) || []; // Filtrar el usuario actual
      setUsers(filtered);
    } catch (err) {
      setError('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para saber si sigo a ese usuario
  const isFollowing = (userId: string) => {
    if (!currentUser || !currentUser.following) return false;
    return currentUser.following.includes(userId);
  };

const setUser = useAuthStore((state) => state.setUser);

// Función para seguir / dejar de seguir un usuario
const handleFollowToggle = async (userId: string) => {
  if (!currentUser) return;

  try {
    let updatedFollowing: string[];

    if (isFollowing(userId)) {
      // Llamada a unfollow
      await usersService.unfollowUser(currentUser._id!, userId);
      updatedFollowing = (currentUser.following ?? []).filter((id) => id !== userId);
    } else {
      // Llamada a follow
      await usersService.followUser(currentUser._id!, userId);
      updatedFollowing = [...(currentUser.following ?? []), userId];
    }
    // Actualizar el usuario en el store global
    setUser({ ...currentUser, following: updatedFollowing });
  } catch (error) {
    console.error('Error following/unfollowing user:', error);
  }
};


  return (
    <Container size="sm">
      <Title order={2} mb="md">
        Discover
      </Title>
      <Stack>
        <TextInput
          placeholder="Enter username"
          value={searchName}
          onChange={(e) => setSearchName(e.currentTarget.value)}
          disabled={loading}
        />
        <Button onClick={handleSearch} loading={loading} disabled={!searchName.trim()}>
          Search
        </Button>

        {error && <Text color="red">{error}</Text>}

        {users.length > 0 ? (
          <List spacing="xs" size="sm" mt="md" withPadding>
            {users.map((user) => (
              <List.Item key={user._id}>
                <Group>
                  <div>
                    <Text fw={500}>{user.name}</Text>
                    <Text size="xs" color="dimmed">{user.mail}</Text>
                  </div>

                  {currentUser && user._id !== currentUser._id && (
                    <Button
                      size="xs"
                      variant={isFollowing(user._id!) ? 'outline' : 'filled'}
                      onClick={() => handleFollowToggle(user._id!)}
                    >
                      {isFollowing(user._id!) ? 'Dejar de seguir' : 'Seguir'}
                    </Button>
                  )}
                </Group>
              </List.Item>
            ))}
          </List>
        ) : (
          !loading && <Text mt="md" color="dimmed">No users found</Text>
        )}
      </Stack>
    </Container>
  );
}

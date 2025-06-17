'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Autocomplete, Button, Stack, Card, Group, Text, Divider } from '@mantine/core';
import { IconSearch, IconUser } from '@tabler/icons-react';
import { useAuthStore } from '@/stores/authStore';
import { usersService } from '@/services/usersService';
import { notifications } from '@mantine/notifications';
import { chatService } from '@/services/chatService';
import { useRouter } from 'next/navigation';
import { ChatUserType } from '@/types/enums';

const FriendsPage: React.FC = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [friendRequests, setFriendRequests] = useState<{_id: string, mail: string}[]>([]);
  const [friends, setFriends] = useState<{_id: string, mail: string}[]>([]);

  const getFriends = useCallback(async () => {
    if (! user?._id) return;
    usersService.getFriends(user._id).then((f) => {
      setFriends(f);
    });
    usersService.getFriendRequests(user._id).then((r) => {
      setFriendRequests(r);
    });
  }, [user?._id]);

  useEffect(() => {
    getFriends();
  }, [getFriends]);

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{_id: string, mail: string}[]>([]);

  useEffect(() => {
    if (search == "") {
      setSearchResults([]);
      return;
    }

    usersService.searchUserByEmail(search).then((r) => {
      setSearchResults(r);
    })
  }, [search]);

  async function handleSendRequest(email: string) {
    const id = searchResults.find((r) => r.mail == email)?._id;
    if (!id) return;
    if (!user?._id) return;

    usersService.sendFriendRequest(user._id, id).then(() => {
      notifications.show({
        message: "Friend request sent successfully",
        color: "green",
      });
      setSearch("");
    }).catch(() => {
      notifications.show({
        message: "Error sending friend request",
        color: "red",
      });
    });
  }

  async function acceptFriend(id: string) {
    if (!user?._id) return;

    usersService.acceptFriendRequest(id, user._id).then(() => {
      notifications.show({
        message: "Friend request accepted",
        color: "green",
      });
      getFriends();
    }).catch(() => {
      notifications.show({
        message: "Error accepting friend request",
        color: "red",
      });
    })
  }

  async function startChat(id: string) {
    try {
      if (!user?._id) throw new Error();
      await chatService.createChat(user._id, id, ChatUserType.USER, ChatUserType.USER);
      router.push("/users/chats?u=" + id);
    } catch {
      notifications.show({
        title: "Error",
        message: "Could not create chat",
        color: "red",
      });
    }
  }

  return (
    <Stack p="md" gap="lg" maw={500} mx="auto">
      <Autocomplete
        label="Search Users by Email"
        placeholder="Enter email"
        data={searchResults.map(s => s.mail)}
        value={search}
        onChange={setSearch}
        onOptionSubmit={handleSendRequest}
        leftSection={<IconSearch size={18} />}
      />

      <Divider label="Friend Requests" labelPosition="center" />

      <Stack gap="sm">
        {friendRequests.map((req) => (
          <Card key={req._id} shadow="sm" padding="md" radius="md" withBorder>
            <Group style={{justifyContent: 'space-between'}}>
              <Group>
                <IconUser size={20} />
                <Text>{req.mail}</Text>
              </Group>
              <Button variant="light" size="sm" onClick={() => acceptFriend(req._id)}>
                Accept
              </Button>
            </Group>
          </Card>
        ))}
      </Stack>


      <Divider label="Your Friends" labelPosition="center" />

      <Stack gap="sm">
        {friends.map((friend) => (
          <Card key={friend._id} shadow="sm" padding="md" radius="md" withBorder>
            <Group style={{justifyContent: 'space-between'}}>
              <Group>
                <IconUser size={20} />
                <Text>{friend.mail}</Text>
              </Group>
              <Button variant="light" size="sm" onClick={() => startChat(friend._id)}>
                Chat
              </Button>
            </Group>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
};

export default FriendsPage;
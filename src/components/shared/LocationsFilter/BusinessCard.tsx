'use client';

import React, { useState } from 'react';
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
  Select,
} from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { IconMapPin, IconPhone, IconStar, IconMessage } from '@tabler/icons-react';
import { IBusiness, ILocation, IAppointment } from '@/types';
import { chatService } from '@/services/chatService';
import { useAuthStore } from '@/stores/authStore';
import { notifications } from '@mantine/notifications';
import { ChatUserType, AppointmentState } from '@/types/enums';
import { useRouter } from 'next/navigation';
import { calendarsService } from '@/services/calendarsService';
import dayjs from 'dayjs';

interface BusinessCardProps {
  business: IBusiness;
}

interface TimeSlotSelectorProps {
  label: string;
  start: Date;
  end: Date;
  onSubmit: (start: Date, end: Date) => void;
}

const TimeSlotSelector = ({ label, start, end, onSubmit }: TimeSlotSelectorProps) => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const durations = [
    { label: '30 minutos', value: '30' },
    { label: '1 hora', value: '60' },
    { label: '1h 30min', value: '90' },
    { label: '2 horas', value: '120' },
  ];
  const handleConfirm = () => {
    if (!startTime || !duration) return;
    const endTime = dayjs(startTime).add(Number(duration), 'minute').toDate();
    if (endTime > end) {
      alert('La franja seleccionada supera el horario disponible');
      return;
    }
    onSubmit(startTime, endTime);
  };

  return (
    <Group gap="sm" align="flex-end" mt="xs">
      <Text size="sm" fw={500}>{label}</Text>
      <TimeInput
        label="Hora de inicio"
        value={startTime ? dayjs(startTime).format('HH:mm') : ''}
        onChange={(event) => {
          const value = event.target.value;
          if (!value) {
            setStartTime(null);
            return;
          }
          const [hours, minutes] = value.split(':').map(Number);
          const baseDate = startTime ?? start ?? new Date();
          const newDate = new Date(baseDate);
          newDate.setHours(hours, minutes, 0, 0);
          setStartTime(newDate);
        }}
        minTime={dayjs(start).format('HH:mm')}
        maxTime={dayjs(end).format('HH:mm')}
      />
      <Select
        label="Duración"
        placeholder="Selecciona duración"
        data={durations}
        value={duration}
        onChange={setDuration}
        maw={120}
      />
      <Button size="xs" onClick={handleConfirm}>Confirmar</Button>
    </Group>
  );
};

export const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [pendingAppointment, setPendingAppointment] = useState<IAppointment | null>(null);
  const [daySlot, setDaySlot] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<ILocation | null>(null);
  const [availableSlots, setAvailableSlots] = useState<{ start: Date; end: Date }[]>([]);

  async function startChat(location: ILocation) {
    try {
      if (!user?._id) throw new Error();
      await chatService.createChat(user._id, location._id, ChatUserType.USER, ChatUserType.LOCATION);
      router.push("/users/chats?u=" + location._id);
    } catch {
      notifications.show({ title: "Error", message: "Could not create chat", color: "red" });
    }
  }

  async function handleDateSelect(date: Date, location: ILocation) {
    if (!user || !user._id) {
      notifications.show({
        title: 'Error',
        message: 'Usuario no autenticado',
        color: 'red',
      });
      return;
    }

    const weekday = dayjs(date).format('dddd').toLowerCase();
    const sched = location.schedule.find(s => s.day.toLowerCase() === weekday);

    if (!sched) {
      notifications.show({
        title: 'Día no disponible',
        message: `La ubicación está cerrada el ${weekday}`,
        color: 'yellow',
      });
      setAvailableSlots([]);
      return;
    }

    const date1 = new Date(date);
    const date2 = new Date(date);
    const [openHour, openMin] = sched.open.split(':').map(Number);
    const [closeHour, closeMin] = sched.close.split(':').map(Number);
    date1.setHours(openHour, openMin, 0, 0);
    date2.setHours(closeHour, closeMin, 0, 0);

    setDaySlot({ start: date1, end: date2 });
    setSelectedLocation(location);

    try {
      const commonSlots = await calendarsService.getCommonSlotsUserAndLocation(
        user._id,
        location._id,
        date1,
        date2
      );

      if (!commonSlots || commonSlots.length === 0) {
        notifications.show({
          title: 'Sin disponibilidad',
          message: 'No hay franjas horarias disponibles para este día',
          color: 'yellow',
        });
        setAvailableSlots([]);
        return;
      }

      const allSlots: { start: Date; end: Date }[] = commonSlots.flatMap(([, ranges]) =>
        ranges.map(([start, end]) => ({
          start: new Date(start),
          end: new Date(end),
        }))
      );

      setAvailableSlots(allSlots);
    } catch {
      notifications.show({
        title: 'Error al obtener horarios',
        message: 'No se pudieron cargar las franjas horarias',
        color: 'red',
      });
      setAvailableSlots([]);
    }
  }

  async function confirmAppointmentRequest() {
    if (!user?._id || !pendingAppointment || !selectedLocation) return;
    try {
      const userCalendars = await calendarsService.getUserCalendars(user._id);
      if (!userCalendars || userCalendars.length === 0) {
        notifications.show({ title: 'Error', message: 'No tienes calendarios', color: 'red' });
        return;
      }
      const calendarId = String(userCalendars[0]._id);
      const workerId = selectedLocation.workers?.[0];
      if (!workerId) {
        notifications.show({ title: 'Error', message: 'No se pudo identificar el trabajador', color: 'red' });
        return;
      }
      await calendarsService.requestAppointment(calendarId, workerId, pendingAppointment);
      notifications.show({ title: 'Cita solicitada', message: 'La cita ha sido enviada correctamente', color: 'green' });
      setPendingAppointment(null);
    } catch {
      notifications.show({ title: 'Error', message: 'No se pudo enviar la solicitud', color: 'red' });
    }
  }

  return (
    <Card withBorder shadow="sm" p="md" radius="md" style={{ display: 'flex', flexDirection: 'row', gap: '2rem' }}>
      <Stack gap="xs" style={{ minWidth: 250 }}>
        <Title order={3}>{business.name}</Title>
      </Stack>
      <Divider orientation="vertical" />
      <ScrollArea style={{ flex: 1}}>
        <Stack gap="md">
          {business.location.map((loc) => (
            <Card key={loc._id} withBorder shadow="xs" radius="md" p="sm">
              <Text w={500} fw={500} mb={8}>{loc.nombre}</Text>
              <Group justify="space-between" align="flex-start">
                <Stack gap={4} maw={350} style={{ flexShrink: 0 }}>
                  <Text size="sm" c="dimmed" mt={5}><IconMapPin size={14} /> {loc.address}</Text>
                  <Text size="sm" c="dimmed"><IconPhone size={14} /> {loc.phone}</Text>
                  <Group gap="xs" mt={5} align="center">
                    <IconStar size={14} color="gold" />
                    <Text size="sm">{loc.rating.toFixed(1)} / 5</Text>
                  </Group>
                  <Group gap="xs" mt={5}>
                    {loc.serviceType.map((service) => (
                      <Badge key={service} color="blue" variant="light">{service}</Badge>
                    ))}
                  </Group>
                </Stack>
                <Stack gap={4} align="flex-end" style={{ flexShrink: 0 }}>
                  <Button variant="light" size="xs" leftSection={<IconMessage size={16} />} onClick={() => startChat(loc)}>
                    Chat
                  </Button>
                  <DatePickerInput
                    type="default"
                    label="Selecciona día"
                    placeholder="Selecciona día"
                    value={selectedDate}
                    onChange={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        handleDateSelect(date, loc);
                      }
                    }}
                    mx="auto"
                    maw={300}
                  />
                </Stack>
              </Group>
              {selectedLocation?._id === loc._id && availableSlots.length > 0 && (
                <>
                  <Text size="sm" mt="sm" fw={500}>Franja(s) disponible(s):</Text>
                  <Group wrap="wrap" gap="xs">
                    {availableSlots.map((slot, idx) => (
                      <Badge
                        key={idx}
                        color="teal"
                        variant="outline"
                        radius="xl"
                        size="lg"
                        style={{ paddingInline: 12 }}
                      >
                        {`${dayjs(slot.start).format('HH:mm')} - ${dayjs(slot.end).format('HH:mm')}`}
                      </Badge>
                    ))}
                  </Group>
                </>
              )}
              {daySlot && selectedLocation?._id === loc._id && (
                <TimeSlotSelector
                  label="Franja horaria"
                  start={daySlot.start}
                  end={daySlot.end}
                  onSubmit={(startTime, endTime) => {
                    const appointment: IAppointment = {
                      inTime: startTime,
                      outTime: endTime,
                      title: `Cita en ${loc.nombre}`,
                      serviceType: loc.serviceType[0] as unknown as IAppointment['serviceType'],
                      appointmentState: AppointmentState.REQUESTED,
                      isDeleted: false,
                      location: loc._id,
                      customAddress: loc.address,
                      customUbicacion: loc.ubicacion,
                      colour: '#228be6',
                    };
                    setPendingAppointment(appointment);
                    notifications.show({ title: "Cita preparada", message: "Appointment listo para enviar", color: "blue" });
                  }}
                />
              )}
              {pendingAppointment && selectedLocation?._id === loc._id && (
                <Button mt="xs" size="xs" color="green" onClick={confirmAppointmentRequest}>
                  Enviar solicitud
                </Button>
              )}
            </Card>
          ))}
        </Stack>
      </ScrollArea>
    </Card>
  );
};

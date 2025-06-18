import { calendarsService } from "@/services/calendarsService";
import { AppointmentPlanningResponse, PlannedAppointment } from "@/types";
import { AppointmentServiceType, AppointmentState } from "@/types/enums";
import { Button, Card, Drawer, Group, Text, Textarea, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconSparkles } from "@tabler/icons-react";
import { useState } from "react";

function formatDate(date: Date): string {
    if (!date) return "";
    const d = new Date(date);
    if (!d) return "";
    return  d.getDate().toString().padStart(2, '0') + "/" +
            (d.getMonth() + 1).toString().padStart(2, '0') + "/" +
            d.getFullYear().toString().padStart(4, '0') + " " +
            d.getHours().toString().padStart(2, '0') + ":" +
            d.getMinutes().toString().padStart(2, '0');
}

export function AppointmentAssistantOverlay(
    { userId, disclosure: [opened, handlers], onAppointmentAdded }: 
    {
        userId: string | undefined,
        disclosure: ReturnType<typeof useDisclosure>,
        onAppointmentAdded: () => void,
    }
) {
    const [response, setResponse] = useState<AppointmentPlanningResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [prompt, setPrompt] = useState<string>('');
    const theme = useMantineTheme();

    async function makeRequest() {
        if (!userId) {
            notifications.show({
                title: 'Error',
                message: 'You are not logged in',
                color: 'red',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await calendarsService.planAppointmentsAi(userId, prompt);
            setResponse(response);
        } catch {
            notifications.show({
                title: 'Error',
                message: 'Could not perform request',
                color: 'red',
            })
        }
        setLoading(false);
    }

    async function addAppointment(a: PlannedAppointment) {
        if (!a.calendarId) {
            notifications.show({
                title: 'Error',
                message: 'Internal error',
                color: 'red',
            });
            return;
        }

        try {
            calendarsService.createEvent(a.calendarId, {
                inTime: a.inTime,
                outTime: a.outTime,
                serviceType: AppointmentServiceType.PERSONAL,
                appointmentState: AppointmentState.ACCEPTED,
                colour: a.colour,
                customAddress: a.customAddress,
                customUbicacion: a.customUbicacion,
                description: a.description,
                title: a.title,
                isDeleted: false,
            });

            onAppointmentAdded();
        } catch {
            notifications.show({
                title: 'Error',
                message: 'Could not create appointment',
                color: 'red',
            })
        }
    }

    return (
        <Drawer
            opened={opened}
            onClose={handlers.close}
            title={
                <Group align="center">
                    <IconSparkles />
                    <Text size="xl" c="blue.6" fw={500}>AI Assistant</Text>
                </Group>
            }
            styles={{
                title: {
                    fontSize: "1.5rem",
                    color: "#228be6",
                },
            }}
        >
            <Text>
                Use the AI Assistant to get inspiration. Write any prompt to get
                event recommendations.
            </Text>
            <Textarea
                mt="sm"
                placeholder="Prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.currentTarget.value)}
            ></Textarea>
            
            <Group justify="flex-end" mt="sm">
                <Button loading={loading} onClick={makeRequest}>Go!</Button>
            </Group>

            { response ? <>
                <Text mt={8} mb={8}>{ response.response }</Text>

                { response.appointments.map( (appointment => (
                    <Card 
                        key={appointment.title}
                        mt={4}
                        style={{
                            backgroundColor: theme.colors.blue[7],
                        }}
                    >
                        <Text size="1.2em" fw="bold">
                            {appointment.title}
                            <Button
                                ml={8}
                                variant="subtle"
                                size="xs"
                                color="white"
                                onClick={() => addAppointment(appointment)}
                            >Add</Button>
                        </Text>
                        <Text>{appointment.description}</Text>
                        <Text>Start: {formatDate(appointment.inTime)}</Text>
                        <Text>End: {formatDate(appointment.outTime)}</Text>
                    </Card>
                )))}
            </> : null }
        </Drawer>

    )
}
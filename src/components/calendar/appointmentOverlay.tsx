import { IAppointment } from "@/types";
import { Button, Drawer, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

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


export function AppointmentOverlay(
    { appointment, disclosure: [opened, handlers], onAppointmentDeleted }: 
    { 
        appointment: IAppointment | null,
        disclosure: ReturnType<typeof useDisclosure>,
        onAppointmentDeleted: () => void,
    }
) {

    if (appointment == null) return null;

    async function deleteAppointment() {
        onAppointmentDeleted();
        // TODO
    }

    return (
        <Drawer
            opened={opened}
            onClose={handlers.close}
            title={appointment.title}
            styles={{
                title: {
                    fontSize: "1.5rem",
                    color: appointment.colour ?? "#228be6",
                },
            }}
        >

            <Text fw="bold">Start:</Text>
            <Text>{formatDate(appointment.inTime)}</Text>

            <Text fw="bold">End:</Text> 
            <Text>{formatDate(appointment.outTime)}</Text>

            <Text fw="bold"> Place: </Text>
            <Text>{appointment.place}</Text>
            
            <Group justify="flex-end" mt="md">
                <Button variant="filled" color="red" onClick={deleteAppointment}>Delete Appointment</Button>
            </Group>

        </Drawer>
    )
}
"use client"

import { AppointmentMarker, IAppointment } from "@/types";
import { Badge, Button, Drawer, Group, Menu, Text, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AppointmentsMap } from "@/components";
import { calendarsService } from "@/services/calendarsService";
import { AppointmentState } from "@/types/enums";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

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

    const theme = useMantineTheme();
    const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);

    if (appointment == null) return null;

    async function deleteAppointment() {
        console.log(appointment)
        if (appointment == null) return;
        try {
            await calendarsService.deleteEvent(appointment._id!);
            onAppointmentDeleted();
            notifications.show({
                title: 'Success',
                message: 'Appointment ' + appointment.title + " deleted successfully.",
                color: 'green',
            })
            handlers.close();
        } catch {
            notifications.show({
                title: 'Error',
                message: 'There was an error deleting this appointment.',
                color: 'red',
            })
        }
    }

    function getLocationMarker(appointment: IAppointment): AppointmentMarker | null{
        if(!appointment._id) return null;
        if(!appointment.customUbicacion?.coordinates) return null;

        return {
            id: appointment._id,
            name: appointment.title,
            position: [
                appointment.customUbicacion.coordinates[1],
                appointment.customUbicacion.coordinates[0],
            ],
            serviceType: appointment.serviceType,
            address: appointment.customAddress,
        };
    }

    function getStateColor(state: AppointmentState | undefined): string {
        switch (state) {
            case AppointmentState.REQUESTED:
                return theme.colors.yellow[7];
            case AppointmentState.ACCEPTED:
                return theme.colors.green[7];
            case AppointmentState.REJECTED:
                return theme.colors.red[7];
            default:
                return theme.colors.gray[7];
        }
    }

    const locationMarker = getLocationMarker(appointment);

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
            <Group
                style={{marginBottom: 6}}
            >
                <Badge 
                    color={theme.colors.blue[7]}
                    radius="sm"
                    autoContrast
                >{appointment.serviceType}</Badge>
                {appointment.appointmentState && appointment.serviceType != "personal" ? <Badge
                    color={getStateColor(appointment.appointmentState)}
                    radius="sm"
                    autoContrast
                    variant="outline"
                >{appointment.appointmentState}</Badge> : null}
            </Group>

            { appointment.description ? 
            <>
                <Text fw="bold">Description:</Text>
                <Text>{appointment.description}</Text>
            </> : null
            }

            <Text fw="bold">Start:</Text>
            <Text>{formatDate(appointment.inTime)}</Text>

            <Text fw="bold">End:</Text> 
            <Text>{formatDate(appointment.outTime)}</Text>

            { locationMarker ?
                <>
                    <Text fw="bold"> Place: </Text>
                    <Text>{appointment.customAddress}</Text>
                    <div style={{
                        marginTop: 6,
                    }}>
                        <AppointmentsMap
                            appointments={[locationMarker]}
                            center={locationMarker.position}
                        />
                    </div>

                </>


 
                : null
            }
            
            <Group justify="flex-end" mt="md">
                <Menu opened={deleteConfirmation} onChange={setDeleteConfirmation}>
                    <Menu.Target><Button variant="filled" color="red">Delete Appointment</Button></Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label style={{fontSize: "1rem"}}>Are you sure?</Menu.Label>
                        <Menu.Item color="red" onClick={deleteAppointment}>Yes</Menu.Item>
                        <Menu.Item color="green" onClick={() => setDeleteConfirmation(false)}>No</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>

        </Drawer>
    )
}
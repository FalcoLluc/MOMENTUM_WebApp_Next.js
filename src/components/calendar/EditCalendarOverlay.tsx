'use client';

import { calendarsService } from "@/services/calendarsService";
import { useAuthStore } from "@/stores/authStore";
import { ICalendar } from "@/types";
import { Button, ColorInput, Group, Menu, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";

// edita un calendari si el passem a "calendar", si no, crea un de nou.
export function EditCalendarOverlay(
    { calendar, disclosure: [open, handlers], onCalendarSaved }: 
    { calendar?: ICalendar | undefined, disclosure: ReturnType<typeof useDisclosure>, onCalendarSaved: () => void}
) {
    const user = useAuthStore((state) => state.user);
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);

    interface FormValues {
        calendarName: string,
        defaultColour: string,
    }

    const form = useForm<FormValues>({
        mode: 'uncontrolled',
        initialValues: {
            calendarName: "",
            defaultColour: "#228be6",
        },
    });

    useEffect(() => {
        if (calendar) {
            form.setValues({
                calendarName: calendar.calendarName,
                defaultColour: calendar.defaultColour ?? "#228be6",
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [calendar]);
    

    // edita un calendari o crea'n un de nou
    async function editCalendar(values: FormValues) {
        if(!user || !user._id) return;

        if (calendar) {
            // editar calendari existent
            try {
                await calendarsService.editCalendar(calendar._id!, values);
            } catch {
                notifications.show({
                    message: "Internal error updating calendar",
                    color: "red",
                });
                return;
            }
        } else {
            // crear nou calendari
            const newCalendar: Partial<ICalendar> = {
                calendarName: values.calendarName,
                defaultColour: values.defaultColour,
                owner: user._id,
            };

            try {
                await calendarsService.createCalendar(newCalendar);
            } catch {
                notifications.show({
                    message: "Internal error creating calendar",
                    color: "red",
                });
                return;
            }
        }
        onCalendarSaved();
        handlers.close();
    }
    
    async function deleteCalendar() {
        if (!calendar?._id) return;
        try {
            await calendarsService.deleteCalendar(calendar._id);
        } catch {
            notifications.show({
                message: "Internal error deleting calendar",
                color: "red",
            });
            return;
        }
        onCalendarSaved();
        handlers.close();
    }

    return (
        <Modal
            opened={open}
            onClose={handlers.close}
            title={calendar ? "Edit Calendar" : "Create Calendar"}
            centered
        >
            <form onSubmit={form.onSubmit((values) => editCalendar(values))}>
                <TextInput key={form.key('calendarName')} label="Calendar Name" {...form.getInputProps('calendarName')} required></TextInput>
                <ColorInput key={form.key('defaultColour')} label="Colour" {...form.getInputProps('defaultColour')}></ColorInput>
                <Group justify="flex-end" mt="md">
                    <Menu opened={deleteConfirmation} onChange={setDeleteConfirmation}>
                        <Menu.Target>
                            <Button 
                                variant="filled"
                                color="red"
                                leftSection={<IconTrash/>}
                            >
                                Delete
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Label style={{fontSize: "1rem"}}>Are you sure?</Menu.Label>
                            <Menu.Item color="red" onClick={deleteCalendar}>Yes</Menu.Item>
                            <Menu.Item color="green" onClick={() => setDeleteConfirmation(false)}>No</Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                    <Button variant="outline" color="red" onClick={handlers.close}>Cancel</Button>
                    <Button type="submit">{calendar ? "Save Changes" : "Create Calendar"}</Button>
                </Group>
            </form>
        </Modal>
    )
}
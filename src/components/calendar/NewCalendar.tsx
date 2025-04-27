import { calendarsService } from "@/services/calendarsService";
import { useAuthStore } from "@/stores/authStore";
import { ICalendar } from "@/types";
import { Button, ColorInput, Group, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";

export function NewCalendarOverlay(
    { disclosure: [open, handlers], onCalendarSaved }: 
    { disclosure: ReturnType<typeof useDisclosure>, onCalendarSaved: () => void}
) {
    const user = useAuthStore((state) => state.user);

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
    })

    function createCalendar(values: FormValues) {
        if(!user || !user._id) return;

        const calendar: Partial<ICalendar> = {
            calendarName: values.calendarName,
            defaultColour: values.defaultColour,
            owner: user._id,
        }

        calendarsService.createCalendar(calendar); // TODO error checking
        onCalendarSaved();
        handlers.close();
    } 

    return (
        <Modal
            opened={open}
            onClose={handlers.close}
            title="Create Calendar"
            centered
        >
            <form onSubmit={form.onSubmit((values) => createCalendar(values))}>
                <TextInput key={form.key('calendarName')} label="Calendar Name" {...form.getInputProps('calendarName')}></TextInput>
                <ColorInput key={form.key('defaultColour')} label="Colour" {...form.getInputProps('defaultColour')}></ColorInput>
                <Group justify="flex-end" mt="md">
                    <Button variant="outline" color="red" onClick={handlers.close}>Cancel</Button>
                    <Button type="submit">Create Calendar</Button>
                </Group>
            </form>
        </Modal>
    )
}
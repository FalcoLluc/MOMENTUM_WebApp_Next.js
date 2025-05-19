import { IMessage } from "@/types";
import { Paper, Text, useMantineTheme } from "@mantine/core";


export function MessageComponent({message, own}: {message: IMessage, own: boolean}) {
    const theme = useMantineTheme();

    function getTime(): string {
        const timestamp = new Date(message.timestamp);
        if (!timestamp) return "";
        return `${timestamp.getHours()}:${timestamp.getMinutes()}`;
    }

    return (
        <Paper
            radius={12}
            style={{
                width: "fit-content",
                backgroundColor: own ? theme.colors.gray[2] : theme.colors.blue[7],
                color: own ? theme.colors.gray[8] : theme.colors.gray[0],
                textAlign: own ? "right" : "left",
                ... own ? {borderBottomRightRadius: 0} : {borderBottomLeftRadius: 0},
                padding: 6,
                marginBottom: 6,
            }}
        >
            <Text>{message.text}</Text>
            <Text size="xs">{ !own ? message.from + " •" : ""} {getTime()}</Text>
            
        </Paper>
    );
}
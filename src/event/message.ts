import { Message } from "../message"

export type MessageContent = {
    message_id: string,
    message: Message,
    row_message: string,
    user_id: string,
    sub_type: string,
    [prop: string]: any,
} & MessageEventType

type MessageEventType = Private | Group

interface Private {
    sub_type: "private"
}

interface Group {
    sub_type: "group",
    group_id: string
}

export namespace MessageContent {
    export function new_group_message_content(
        message: Message,
        message_id: string,
        user_id: string,
        group_id: string,
    ): MessageContent {
        return {
            group_id,
            message_id,
            row_message: Message.row(message),
            message,
            user_id,
            sub_type: "group",
        }
    }
    export function new_private_message_content(
        message: Message,
        message_id: string,
        user_id: string,
    ): MessageContent {
        return {
            message_id,
            row_message: Message.row(message),
            message,
            user_id,
            sub_type: "private",
        }
    }
}

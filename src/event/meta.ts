import { StatusContent } from "../resp"

export type MetaContent = MetaContent.Heartbeat | MetaContent.Extended

export namespace MetaContent {
    export interface Extended {
        sub_type: string,
        [prop: string]: any
    }
    export interface Heartbeat extends Extended {
        interval: number,
        status: StatusContent,
        sub_type: "heartbeat"
    }
}

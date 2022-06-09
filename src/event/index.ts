import { MetaContent } from "./meta";
import { MessageContent } from "./message";
import { NoticeContent } from "./notice";
export * from './meta'
export * from './message'
export * from './notice'
export type StandardEvent = BaseEvent<EventContent>;
export type MessageEvent = BaseEvent<MessageContent> & { type: "message" };
export type NoticeEvent = BaseEvent<NoticeContent> & { type: "notice" };
export type MetaEvent = BaseEvent<MetaContent> & { type: "meta" };

export type BaseEvent<T> = {
    id: string,
    impl: string,
    platform: string,
    self_id: string,
    time: number,
} & T

export type EventContent = (MetaContent & { type: "meta" }) | (MessageContent & { type: "message" }) | (NoticeContent & { type: "notice" })

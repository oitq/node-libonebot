/// OneBot 实现端设置项
export interface ImplConfig {
    heartbeat: Heartbeat,
    http: HttpServer[],
    http_webhook: HttpClient[],
    websocket: WebSocketServer[],
    websocket_rev: WebSocketClient[]
}

export namespace ImplConfig {
    export const Default: ImplConfig = {
        heartbeat: Heartbeat.Default,
        http: [],
        http_webhook: [],
        websocket: [WebSocketServer.Default],
        websocket_rev: [],
    }

}

/// OneBot 心跳设置
export interface Heartbeat {
    enabled: boolean,
    interval: number
}

export namespace Heartbeat {
    export const Default: Heartbeat = {
        enabled: true,
        interval: 4
    }

}

/// OneBot Impl Http 通讯设置
export interface HttpServer {
    host: string,
    port: number,
    access_token?: string | null,
    event_enable: boolean,
    event_buffer_size: number,
}

export namespace HttpServer {
    export const Default: HttpServer = {
        host: "127.0.0.1",
        port: 6800,
        event_enable: true,
        event_buffer_size: 16
    }

}

/// OneBot Impl Http Webhook 通讯设置
export interface HttpClient {
    url: string,
    access_token?: string | null,
    timeout: number,
}

export namespace HttpClient {
    export const Default: HttpClient = {
        url: "http://127.0.0.1:6900",
        access_token: null,
        timeout: 4
    }

}

/// OneBot WebSocket 服务器设置
export interface WebSocketServer {
    host: string,
    port: number,
    access_token?: string | null,
}

export namespace WebSocketServer {
    export const Default: WebSocketServer = {
        host: "127.0.0.1",
        port: 8855,
    }
}

/// OneBot Impl 反向 WebSocket 通讯设置
export interface WebSocketClient {
    url: string,
    access_token?: string | null,
    reconnect_interval: number,
}

export namespace WebSocketClient {
    export const Default: WebSocketClient = {
        url: "ws://127.0.0.1:8866",
        reconnect_interval: 4
    }

}

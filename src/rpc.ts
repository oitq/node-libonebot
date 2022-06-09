import Koa from 'koa'
import bodyParser = require("koa-bodyparser");
import websocket from 'koa-websocket';
import {WebSocket} from 'ws'
import { Logger } from "./utils";
import { ActionHandler } from "./handle"
import { CustomOneBot } from "./impls"
import { HttpClient, HttpServer, WebSocketClient, WebSocketServer } from "./config"
import { parseJson } from "./utils/parse"

const logger = new Logger("node_libonebot")

class HttpRegistry<E, A, R> extends Array {
    constructor(private action_handler: ActionHandler<A, R, CustomOneBot<E, A, R>>, private ob: CustomOneBot<E, A, R>) {
        super()
    }
    async create(config: HttpServer) {
        const app = new Koa();
        app.use(bodyParser())
        //let storage = new Storage(config.event_buffer_size)
        //this.storages.push(storage)
        app.use(async (ctx) => {
            if (config.access_token !== null && ctx.request.headers.authorization !== config.access_token) {
                ctx.response.status = 401;// Unauthorized
            } else if (ctx.request.method !== "POST") {
                ctx.response.status = 405;// Not Allowed
            } else if (ctx.request.headers["content-type"] !== "application/json") {
                ctx.response.status = 415;// Unsupported
            } else {
                const ret=await this.action_handler.handle(ctx.request.body as unknown as A, this.ob)
                ctx.response.body = JSON.stringify(ret);
                ctx.response.type = "json"
                ctx.response.status = 200 // OK
            }
        });
        const controller = new AbortController();
        const { signal } = controller;
        super.push(controller)
        logger.info(`HTTP 监听在 ${Logger.color2(config.host + ":" + config.port)}`)
        await app.listen({
            hostname: config.host, port: config.port, signal
        });
    }
    send(_data: any) {
        /*if (data.detail_type !== "heartbeat") {
            for (let storage of this.storages) {
                storage.set(data)
            }
        }*/
    }
    close() {
        super.forEach(function (entry) {
            entry.abort()
        })
    }
}

class WebhookRegistry extends Array {
    constructor() {
        super()
    }
    async create(config: HttpClient) {
        return super.push(new Webhook(config.url, config.access_token))
    }
    send(data: any) {
        if (typeof data.detail_type !== "undefined" && data.detail_type !== "heartbeat") {
            super.forEach(function (entry) {
                entry.send(JSON.stringify(data))
            })
        }
    }
    close() {

    }
}

class WsRegistry<E, A, R> extends Array {
    private sockets: WebSocket[] = []
    constructor(private action_handler: ActionHandler<A, R, CustomOneBot<E, A, R>>, private ob: CustomOneBot<E, A, R>) {
        super()
    }
    async create(config: WebSocketServer) {
        const app = websocket(new Koa());
        let _this=this
        app.ws.onConnection=function (socket,request){
            if (config.access_token && request.headers.authorization !== config.access_token) {
                return 401
            } else{
                _this.sockets.push(socket)
                logger.info(`新的 WebSocket 连接来自 ${request.url}`)
                socket.on('message',async (e)=>{
                    let parsed: any = parseJson(e.toString())
                    if (parsed !== null) {
                        if (typeof parsed.action === "undefined" || typeof parsed.params === "undefined") {
                            logger.warn(`请求格式不正确: "${e.toString()}"`)
                            return false
                        }
                        let echo: Record<string, any> = {}
                        if (typeof parsed.echo !== "undefined") {
                            echo = { echo: parsed.echo }
                            delete parsed.echo
                        }
                        let data: R = await this.action_handler.handle(parsed, this.ob)
                        socket.send(JSON.stringify(Object.assign(data, echo)))
                    } else {
                        logger.warn(`JSON 反序列化失败: "${e.toString()}"`)
                    }
                })
            }
        }
        const controller = new AbortController();
        const { signal } = controller;
        super.push(controller)
        logger.info(`WebSocket 监听在 ${Logger.color2(config.host + ":" + config.port)}`)
        await app.listen({
            hostname: config.host, port: config.port, signal
        });
    }
    send(data: any) {
        for (const entry of this.sockets) {
            if (entry.readyState === WebSocket.OPEN) {
                entry.send(JSON.stringify(data))
            }
        }
    }
    close() {
        super.forEach(function (entry) {
            entry.abort()
        })
        for (const entry of this.sockets) {
            if (entry.readyState === WebSocket.OPEN) {
                entry.close()
            }
        }
    }
}

class WsrRegistry<E, A, R> extends Array {
    private sockets: WebSocket[] = []
    constructor(private action_handler: ActionHandler<A, R, CustomOneBot<E, A, R>>, private ob: CustomOneBot<E, A, R>) {
        super()
    }
    async create(config: WebSocketClient) {
        const app = new Wsr()
        app.connect({
            url: config.url, reconnect_interval: config.reconnect_interval, add_callback: (socket) => {
                this.sockets.push(socket)
                socket.on("connection", () => logger.info(`成功连接到 ${config.url}`))
                socket.on("message", async (e) => {
                    let parsed: any = parseJson(e.toString())
                    if (parsed !== null) {
                        if (typeof parsed.action === "undefined" || typeof parsed.params === "undefined") {
                            logger.warn(`请求格式不正确: "${e.toString()}"`)
                            return false
                        }
                        let echo: Record<string, any> = {}
                        if (typeof parsed.echo !== "undefined") {
                            echo = { echo: parsed.echo }
                            delete parsed.echo
                        }
                        let data: R = await this.action_handler.handle(parsed, this.ob)
                        socket.send(JSON.stringify(Object.assign(data, echo)))
                    } else {
                        logger.warn(`JSON 反序列化失败: "${e.toString()}"`)
                    }
                })
            }, del_callback: (socket) => {
                const index = this.sockets.findIndex((element) => element === socket)
                this.sockets.splice(index, 1)
            }
        })
        super.push(app)
    }
    send(data: any) {
        for (const entry of this.sockets) {
            if (entry.readyState === WebSocket.OPEN) {
                entry.send(JSON.stringify(data))
            }
        }
    }
    close() {
        super.forEach(function (entry) {
            entry.close()
        })
    }
}

export class Rpc<E, A, R> {
    public all: Record<string, HttpRegistry<E, A, R> | WsRegistry<E, A, R> | WsrRegistry<E, A, R> | WebhookRegistry> = {}
    constructor(private action_handler: ActionHandler<A, R, CustomOneBot<E, A, R>>, private ob: CustomOneBot<E, A, R>) {
    }
    http(config: HttpServer[]) {
        const http = new HttpRegistry(this.action_handler, this.ob);
        for (const entry of config) {
            http.create(entry)
        }
        this.all.http = http
    }
    webhook(config: HttpClient[]) {
        const webhook = new WebhookRegistry();
        for (const entry of config) {
            webhook.create(entry)
        }
        this.all.webhook = webhook
    }
    ws(config: WebSocketServer[]) {
        const ws = new WsRegistry(this.action_handler, this.ob);
        for (const entry of config) {
            ws.create(entry)
        }
        this.all.ws = ws
    }
    wsr(config: WebSocketClient[]) {
        const wsr = new WsrRegistry(this.action_handler, this.ob);
        for (const entry of config) {
            wsr.create(entry)
        }
        this.all.wsr = wsr
    }
    closeAll() {
        this.all.http.close()
        this.all.ws.close()
        this.all.wsr.close()
    }
}

interface WsrConfig {
    url: string,
    reconnect_interval: number,
    add_callback: (arg0: WebSocket) => void,
    del_callback: (arg0: WebSocket | null) => void,
}

class Wsr {
    private url: string = ""
    private socket: WebSocket | null = null
    private reconnect_interval: number = 0
    private add_callback: (arg0: WebSocket) => void
    private del_callback: (arg0: WebSocket | null) => void
    private running: boolean = false
    constructor() {
        this.add_callback = () => { }
        this.del_callback = () => { }
    }
    reconnect() {
        logger.warn(`无法连接到 ${Logger.color2(this.url)}`)
        this.del_callback(this.socket)
        logger.info(`${this.reconnect_interval} 秒钟后重试`)
        setTimeout(() => {
            if (this.running) {
                this.socket = new WebSocket(this.url)
                this.socket.addEventListener("close", this.reconnect.bind(this))
                this.add_callback(this.socket)
            }
        }, this.reconnect_interval * 1000)
    }
    connect(config: WsrConfig) {
        logger.info(`正在启动 WebSocket 反向服务器。`)
        this.running = true
        this.url = config.url
        this.reconnect_interval = config.reconnect_interval
        this.add_callback = config.add_callback
        this.del_callback = config.del_callback
        logger.info(`开始尝试连接到 ${Logger.color2(this.url)}`)
        this.socket = new WebSocket(config.url)
        this.socket.addEventListener("close", this.reconnect.bind(this))
        this.add_callback(this.socket)
    }
    close() {
        if (this.socket === null) {
            this.running = false
        } else if (this.socket.readyState === WebSocket.OPEN) {
            this.running = false
            this.socket.close()
        }
    }
}

class Webhook {
    constructor(private url: string, private access_token: string | null | undefined) {
    }
    send(data: any) {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.access_token && headers.append('Authorization', this.access_token);
        fetch(this.url, {
            method: 'POST',
            headers: headers,
            body: data,
        }).catch(error => {
            console.log(error)
        })

    }
}

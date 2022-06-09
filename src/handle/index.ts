import { StandardAction } from "../action"
import { Resps, Resp, VersionContent } from "../resp"
import { CustomOneBot } from "../impls"

export abstract class ActionHandler<A, R, OB>{
    abstract handle(data: A, ob: OB): Promise<R>
}

export class DefaultHandler<E> extends ActionHandler<StandardAction, Resps, CustomOneBot<E, StandardAction, Resps>>{
    async handle(data: StandardAction, _ob: CustomOneBot<E, StandardAction, Resps>): Promise<Resps> {
        switch (data.action) {
            case "get_version":
                return Resp.success(get_version())
            default:
                return Resp.unsupported_action()
        }
    }
}

function get_version(): VersionContent {
    return VersionContent.Default
}

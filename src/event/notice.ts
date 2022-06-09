export type NoticeContent = NoticeContent.GroupMemberIncrease | NoticeContent.GroupMemberDecrease | NoticeContent.GroupMemberBan | NoticeContent.GroupMemberUnban | NoticeContent.GroupAdminSet | NoticeContent.GroupAdminUnset | NoticeContent.GroupMessageDelete | NoticeContent.PrivateMessageDelete | NoticeContent.FriendDecrease | NoticeContent.FriendIncrease

export namespace NoticeContent {
    export interface Extended {
        sub_type: string
        [prop: string]: any
    }
    /// 群成员增加
    export interface GroupMemberIncrease extends Extended {
        sub_type: string,
        group_id: string,
        user_id: string,
        operator_id: string,
    }
    /// 群成员减少
    export interface GroupMemberDecrease extends Extended {
        sub_type: string,
        group_id: string,
        user_id: string,
        operator_id: string,
    }
    /// 群成员禁言
    export interface GroupMemberBan extends Extended {
        sub_type: string,
        group_id: string,
        user_id: string,
        operator_id: string,
    }
    /// 群成员解除禁言
    export interface GroupMemberUnban extends Extended {
        sub_type: string,
        group_id: string,
        user_id: string,
        operator_id: string,
    }
    /// 群管理员设置
    export interface GroupAdminSet extends Extended {
        sub_type: string,
        group_id: string,
        user_id: string,
        operator_id: string,
    }
    /// 群管理员取消设置
    export interface GroupAdminUnset extends Extended {
        sub_type: string,
        group_id: string,
        user_id: string,
        operator_id: string,
    }
    /// 群消息删除
    export interface GroupMessageDelete extends Extended {
        sub_type: string,
        group_id: string,
        message_id: string,
        user_id: string,
        operator_id: string,
    }
    /// 好友增加
    export interface FriendIncrease extends Extended {
        sub_type: string,
        user_id: string,
    }
    /// 好友减少
    export interface FriendDecrease extends Extended {
        sub_type: string,
        user_id: string,
    }
    /// 私聊消息删除
    export interface PrivateMessageDelete extends Extended {
        sub_type: string,
        message_id: string,
        user_id: string,
    }
}

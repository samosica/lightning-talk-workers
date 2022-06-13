/**
 * 
 * @param schedule 
 * @param firstAnnouncementMessageId 1回目のアナウンスメッセージの ID
 * @returns
 */
function postChangeAnnouncementMessage(
    schedule: GatheringSchedule,
    firstAnnouncementMessageId: string
)
{
    const startTimeStr =
        new Intl.DateTimeFormat("ja-JP", {
            year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric"
        }).format(schedule.startTime);
    const text = `次回の LT 会が ${startTimeStr} に変更されました :bow:`;
    
    chat_postMessage(
        config.slack.token,
        config.slack.schedulingChannelId,
        text,
        {
            thread_ts: firstAnnouncementMessageId,
            reply_broadcast: true,
        }
    );
}

/**
 * 
 * @param firstAnnouncementMessageId 1回目のアナウンスメッセージの ID
 * @returns
 */
function postCancelAnnouncementMessage(
    firstAnnouncementMessageId: string
)
{
    const text = "予定していた LT 会は中止となりました :wave:";

    chat_postMessage(
        config.slack.token,
        config.slack.schedulingChannelId,
        text,
        {
            thread_ts: firstAnnouncementMessageId,
            reply_broadcast: true,
        }
    );
}

function scheduleOrderMessage(
    schedule: GatheringSchedule
): string
{
    const order = shuffle(config.members);
    const text = "発表順は " + order.join(" → ") + "です";

    const res = chat_scheduleMessage(
        config.slack.token,
        config.slack.mainChannelId,
        schedule.startTime,
        text
    );

    return res.scheduled_message_id;    
}

/**
 * 
 * @param orderMessageId 予約されている発表順序メッセージの ID
 */
function cancelOrderMessage(
    orderMessageId: string
){
    chat_deleteScheduledMessage(
        config.slack.token,
        config.slack.mainChannelId,
        orderMessageId
    );
}

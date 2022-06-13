/**
 * 
 * @param schedule 
 * @returns メッセージのタイムスタンプ ID
 */
function postFirstAnnouncementMessage(
    schedule: GatheringSchedule
): string
{
    const startTimeStr =
        new Intl.DateTimeFormat("ja-JP", {
            year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric"
        }).format(schedule.startTime);
    const text = `次回の LT 会は ${startTimeStr} に決まりました :tada:`;
    
    const res = chat_postMessage(
        config.slack.token,
        config.slack.schedulingChannelId,
        text
    );

    return res.ts;
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
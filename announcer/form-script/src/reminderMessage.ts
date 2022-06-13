/**
 * 
 * @param schedule
 * @returns 予約されたリマインドの ID
 */
function scheduleFirstReminderMessage(
    schedule: GatheringSchedule
): string
{
    const startTimeStr = timeRepresentation(schedule.startTime, schedule.firstReminderTime);
    const text = `${startTimeStr} より LT 会です`;

    const res = chat_scheduleMessage(
        config.slack.token,
        config.slack.mainChannelId,
        schedule.firstReminderTime,
        text
    );

    return res.scheduled_message_id;
}

/**
 * 
 * @param schedule 
 * @returns 予約されたリマインドの ID
 */
function scheduleSecondReminderMessage(
    schedule: GatheringSchedule
): string
{
    const startTimeStr = timeRepresentation(schedule.startTime, schedule.secondReminderTime);
    const monthlyFolder = getMonthlyFolder(schedule.startTime, config.folderId);
    const text =
        `${startTimeStr} より LT 会を行ないます。\n` +
        `スライドは ${monthlyFolder.getUrl()} にあります。\n` +
        "スライドのアップロードは左のサイドメニューから XXX を選び、" +
        "ファイルを送ることでも可能です。";

    const res = chat_scheduleMessage(
        config.slack.token,
        config.slack.mainChannelId,
        schedule.secondReminderTime,
        text
    );

    return res.scheduled_message_id;
}
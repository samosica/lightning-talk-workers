const config = (() => {
    const scriptProps = PropertiesService.getScriptProperties();
    const defaultDuration = new Date(0);
    defaultDuration.setHours(2, 0); // 2:00

    return {
        slack: {
            token: scriptProps.getProperty("slack/token")!,
            // チャンネルの表示名ではなく，一意に割り当てられた ID を指定する
            mainChannelId: scriptProps.getProperty("slack/mainChannelId")!,
            schedulingChannelId: scriptProps.getProperty("slack/schedulingChannelId")!,
        },
        calendarId: scriptProps.getProperty("calendarId")!,
        folderId: scriptProps.getProperty("folderId")!,
        spreadsheetId: scriptProps.getProperty("spreadsheetId")!,
        members: [/* fill here */],
        defaultDuration,
    };
})();

function constructGatheringScheduleFromResponse(res: GoogleAppsScript.Forms.FormResponse): GatheringSchedule{
    // @ts-ignore
    const [dateStr, startTimeStr, durationStr]: [string, string, string] =
        res.getItemResponses().map(ir => ir.getResponse());

    const startTime = (() => {
        const [year, month, day] = dateStr.split("-").map(s => parseInt(s, 10));
        const [hour, minute] = startTimeStr.split(":").map(s => parseInt(s, 10));
    
        return new Date(year, month - 1, day, hour, minute);
    })();

    const duration = (() => {
        if(durationStr === ""){
            return config.defaultDuration;
        }

        const [hour, minute] = durationStr.split(":").map(s => parseInt(s, 10));

        const duration = new Date(0);
        duration.setHours(hour, minute);

        return duration;
    })();

    return new GatheringSchedule(startTime, duration);
}

function addSchedule(
    schedule: GatheringSchedule
){
    const eventId = 
        CalendarApp.getCalendarById(config.calendarId)
                   .createEvent("LT会", schedule.startTime, schedule.endTime)
                   .getId();

    const firstReminderMessageId = scheduleFirstReminderMessage(schedule);

    Utilities.sleep(500);

    const secondReminderMessageId = scheduleSecondReminderMessage(schedule);

    Utilities.sleep(500);

    const orderMessageId = scheduleOrderMessage(schedule);

    Utilities.sleep(500);

    const firstAnnouncementMessageId = postFirstAnnouncementMessage(schedule);

    const spreadsheet = SpreadsheetApp.openById(config.spreadsheetId);
    const sheet = spreadsheet.getSheets()[0];
    const row = sheet.getLastRow() + 1;
    sheet.getRange(row, 1, 1, 2).insertCheckboxes();
    sheet.getRange(row, 3, 1, 8).setValues([[
        ...schedule.toStringArray(),
        eventId,
        firstReminderMessageId,
        secondReminderMessageId,
        orderMessageId,
        "'" + firstAnnouncementMessageId, // "'"を付けることで数値として解釈されるのを防ぐ :(
    ]]);
}

function onSubmit(e: GoogleAppsScript.Events.FormsOnFormSubmit){
    const schedule = constructGatheringScheduleFromResponse(e.response);
    if(schedule.startTime < new Date()){
        throw "Invalid start time";
    }
    addSchedule(schedule);
};

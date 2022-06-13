type ModifyOperation = {
    type: "modify",
    rowIndex: number, // spreadsheet における行番号
    newSchedule: GatheringSchedule,
    eventId: string,
    oldFirstReminderMessageId: string,
    oldSecondReminderMessageId: string,
    oldOrderMessageId: string,
    firstAnnouncementMessageId: string,
};

type DeleteOperation = {
    type: "delete",
    rowIndex: number, // spreadsheet における行番号
    oldEventId: string,
    oldFirstReminderMessageId: string,
    oldSecondReminderMessageId: string,
    oldOrderMessageId: string,
    firstAnnouncementMessageId: string,
};

type Operation = ModifyOperation | DeleteOperation;

function modifySchedule({
    rowIndex,
    newSchedule,
    eventId,
    oldFirstReminderMessageId,
    oldSecondReminderMessageId,
    oldOrderMessageId,
    firstAnnouncementMessageId,
}: ModifyOperation){
    // イベントの日時を変更する（Google カレンダー）
    CalendarApp.getCalendarById(config.calendarId)
               .getEventById(eventId)
               .setTime(newSchedule.startTime, newSchedule.endTime);

    // 古いメッセージの予約を取り消す（Slack）
    cancelReminderMessage(oldFirstReminderMessageId);

    Utilities.sleep(500);

    cancelReminderMessage(oldSecondReminderMessageId);

    Utilities.sleep(500);

    cancelOrderMessage(oldOrderMessageId);

    Utilities.sleep(500);

    // 新しいリマインドメッセージを予約する（Slack）
    const newFirstReminderMessageId = scheduleFirstReminderMessage(newSchedule);

    Utilities.sleep(500);

    const newSecondReminderMessageId = scheduleSecondReminderMessage(newSchedule);

    Utilities.sleep(500);

    const newOrderMessageId = scheduleOrderMessage(newSchedule);

    Utilities.sleep(500);

    postChangeAnnouncementMessage(
        newSchedule,
        firstAnnouncementMessageId
    );

    const sheet = SpreadsheetApp.getActiveSheet();

    // 新しいリマインドメッセージ ID をスプレッドシートに書き込む
    sheet.getRange(rowIndex, 7, 1, 3).setValues([[
        newFirstReminderMessageId,
        newSecondReminderMessageId,
        newOrderMessageId,
    ]]);

    // チェックボックスのチェックを外す
    sheet.getRange(rowIndex, 1, 1, 2).uncheck();
}

// 注意：deleteSchedule 関数はスプレッドシートからスケジュールを削除しない
// これは削除による行番号の不整合を避けるためである
// そのため，別にスケジュールを削除する必要がある
function deleteSchedule({
    oldEventId,
    oldFirstReminderMessageId,
    oldSecondReminderMessageId,
    oldOrderMessageId,
    firstAnnouncementMessageId,
}: DeleteOperation){
    // イベントを削除する（Google カレンダー）
    CalendarApp.getCalendarById(config.calendarId)
               .getEventById(oldEventId)
               .deleteEvent();

    // 古いメッセージの予約を取り消す（Slack）
    cancelReminderMessage(oldFirstReminderMessageId);

    Utilities.sleep(500);

    cancelReminderMessage(oldSecondReminderMessageId);

    Utilities.sleep(500);

    cancelOrderMessage(oldOrderMessageId);

    Utilities.sleep(500);

    postCancelAnnouncementMessage(firstAnnouncementMessageId);

    Utilities.sleep(500);
}
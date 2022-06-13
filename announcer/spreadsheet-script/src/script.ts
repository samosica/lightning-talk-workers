const config = (() => {
    const scriptProps = PropertiesService.getScriptProperties();

    return {
        slack: {
            token: scriptProps.getProperty("slack/token")!,
            // チャンネルの表示名ではなく，一意に割り当てられた ID を指定する
            mainChannelId: scriptProps.getProperty("slack/mainChannelId")!,
            schedulingChannelId: scriptProps.getProperty("slack/schedulingChannelId")!,
        },
        calendarId: scriptProps.getProperty("calendarId")!,
        folderId: scriptProps.getProperty("folderId")!,
        members: [/* fill here */],
    };
})();

/**
 * 
 * @returns オペレーションの配列．要素は index が昇順になるように並べられる
 */
function getOperations(): ReadonlyArray<Operation>{
    const sheet = SpreadsheetApp.getActiveSheet();
    const headerRowIndex = 4;
    const numSchedules = sheet.getLastRow() - headerRowIndex;
    // @ts-ignore
    const rawData: ReadonlyArray<[
        Boolean, // modify flag
        Boolean, // delete flag
        Date, // date
        Date, // start time
        Date, // duration
        string, // event id (Google Calendar)
        string, // first reminder message id (Slack)
        string, // second reminder message id (Slack)
        string, // order message id (Slack)
        string, // first announcement message id (Slack)
    ]> = sheet.getRange(headerRowIndex + 1, 1, numSchedules, 10).getValues();
    const result: ReadonlyArray<Operation> = rawData.flatMap(([
        modifyFlag,
        deleteFlag,
        date,
        startTime,
        duration,
        eventId,
        firstReminderMessageId,
        secondReminderMessageId,
        orderMessageId,
        firstAnnouncementMessageId,
    ], arrayIndex): ReadonlyArray<Operation> => {
        startTime.setFullYear(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );

        const rowIndex = arrayIndex + headerRowIndex + 1;

        // modify flag と delete flag の両方が立っていた場合，modify を行なう（fail safe）
        if(modifyFlag){
            const newSchedule = new GatheringSchedule(startTime, duration);

            if(newSchedule.startTime < new Date()){
                throw `Invalid start time at ${rowIndex}`;
            }

            return [{
                type: "modify",
                rowIndex,
                newSchedule,
                eventId,
                oldFirstReminderMessageId: firstReminderMessageId,
                oldSecondReminderMessageId: secondReminderMessageId,
                oldOrderMessageId: orderMessageId,
                firstAnnouncementMessageId,
            }];
        }

        if(deleteFlag){
            return [{
                type: "delete",
                rowIndex,
                oldEventId: eventId,
                oldFirstReminderMessageId: firstReminderMessageId,
                oldSecondReminderMessageId: secondReminderMessageId,
                oldOrderMessageId: orderMessageId,
                firstAnnouncementMessageId,
            }];
        }

        return [];
    });

    return result;
}

function perform(){
    const operations: ReadonlyArray<Operation> = getOperations();

    for(const operation of operations){
        switch(operation.type){
            case "modify": {
                modifySchedule(operation);
                break;
            }
            case "delete": {
                deleteSchedule(operation);
                break;
            }
        }
    }

    // 削除すべき行を削除する
    // このとき，行番号が小さい順に削除すると，それより下の行の番号がずれるので，
    // 行番号が大きい順に削除する
    operations.filter((op) => op.type === "delete")
              .map((op) => op.rowIndex)
              .reverse()
              .forEach((index) => {
                SpreadsheetApp.getActiveSheet().deleteRow(index);
              });
}

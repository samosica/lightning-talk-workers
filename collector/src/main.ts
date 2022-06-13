const config = (() => {
    const scriptProps = PropertiesService.getScriptProperties();
    
    return {
        LTListSpreadsheetId: scriptProps.getProperty('LTListSpreadsheetId')!,
        LTFolderId: scriptProps.getProperty('LTFolderId')!,
        lastVisitedFileIdListFileName: "lt-collector-last-visited-file-id-list",
    };
})();

// 月ごとにフォルダがあり，その下に LT のファイルがあることを想定している
function getFiles(){
    const LTFolder = DriveApp.getFolderById(config.LTFolderId);
    const iter = LTFolder.getFolders();
    const files = [];

    while(iter.hasNext()){
        const monthlyFolder = iter.next();
        const fileIter = monthlyFolder.getFiles();

        while(fileIter.hasNext()){
            const file = fileIter.next();
            files.push(file);
        }
    }

    return files;
}

function getLastVisitedFileIdList(): string[] {
    const iter = DriveApp.getFilesByName(config.lastVisitedFileIdListFileName);
    if(!iter.hasNext()){
        return [];
    }
    const file = iter.next();
    return JSON.parse(file.getBlob().getDataAsString());
}
  
function updateLastVisitFileIdList(list: string[]) {
    const iter = DriveApp.getFilesByName(config.lastVisitedFileIdListFileName);
    const content = JSON.stringify(list);
    if(!iter.hasNext()){
        DriveApp.createFile(config.lastVisitedFileIdListFileName, content);
        return;
    }
    const file = iter.next();
    file.setContent(content);
}

function addLTsToSpreadsheet(files: GoogleAppsScript.Drive.File[]){
    if(files.length === 0){
        return;
    }

    const spreadsheet = SpreadsheetApp.openById(config.LTListSpreadsheetId);
    const sheet = spreadsheet.getSheets()[0];
    const lastRow = sheet.getLastRow();

    sheet.getRange(lastRow + 1, 1, files.length, 4).setValues(
        files.map((file) => {
            // LTのタイトル, 発表者, 発表日時, URL
            return [ file.getName(), "?", file.getDateCreated(), file.getUrl() ]
        })
    );

    // 発表日時でソート（新しいものを上に並べる）
    sheet.getFilter().sort(3, false);
}

function batch(){
    const files = getFiles();
    const lastVisitedFileIdSet = new Set(getLastVisitedFileIdList());
    const newFiles = files.filter((f) => !lastVisitedFileIdSet.has(f.getId()));
    console.log("追加された LT の個数", newFiles.length);
    addLTsToSpreadsheet(newFiles);
    updateLastVisitFileIdList(files.map((f) => f.getId()));
}

function getMonthlyFolder(
    date: Date,
    parentId: string
){
    const parentFolder = DriveApp.getFolderById(parentId);
    const monthlyFolderName =
        new Intl.DateTimeFormat(
            'ja-JP',
            { year: '2-digit', month: '2-digit' }
        ).format(date).replace('/', ''); // "21/03" -> "2103"

    const iter = parentFolder.getFoldersByName(monthlyFolderName);
    if (iter.hasNext()) { // If the monthly folder already exists
        return iter.next();
    }
    
    const monthlyFolder = parentFolder.createFolder(monthlyFolderName);
    console.info("Created new monthly folder", monthlyFolder.getId());
    return monthlyFolder;
}
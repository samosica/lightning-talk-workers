/**
 * 
 * @param time 時間
 * @param baseTime 基準となる時間
 * @returns baseTime を基点とした time の文字列表現．本日と明日が用いられる．
 */
function timeRepresentation(time: Date, baseTime: Date): String{
    const timeStr = new Intl.DateTimeFormat("ja-JP", {
        hour: "numeric", minute: "numeric"
    }).format(time);

    const start = new Date(baseTime.valueOf());
    start.setHours(0, 0, 0, 0);

    const end = new Date(start.valueOf());
    end.setDate(end.getDate() + 1);

    if(start <= time && time < end){ // time と baseTime の日付が同じ
        return `本日 ${timeStr}`;
    }

    start.setDate(start.getDate() + 1);
    end.setDate(end.getDate() + 1);

    if(start <= time && time < end){ // time が baseTime の1日後
        return `明日 ${timeStr}`;
    }

    const dateStr = new Intl.DateTimeFormat("ja-JP", {
        year: "numeric", month: "numeric", day: "numeric"
    }).format(time);

    return `${dateStr} ${timeStr}`;
}

function shuffle<T>(array: ReadonlyArray<T>){
    const shuffledArray = [...array];

    for(let i = 0; i < shuffledArray.length; i++){
        const j = i + Math.floor(Math.random() * (shuffledArray.length - i));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }

    return shuffledArray;
}
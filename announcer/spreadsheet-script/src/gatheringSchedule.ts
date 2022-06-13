class GatheringSchedule{
    startTime: Date;
    endTime: Date;
    duration: Date;
    firstReminderTime: Date;
    secondReminderTime: Date;

    constructor(
        startTime: Date,
        duration: Date
    ){
        this.startTime = startTime;
        this.duration = duration;

        this.endTime = new Date(this.startTime.valueOf());
        this.endTime.setHours(this.endTime.getHours() + this.duration.getHours());
        this.endTime.setMinutes(this.endTime.getMinutes() + this.duration.getMinutes());

        // 最初にリマインドする時間は次のように決める：
        // 現在時刻が開催前日の 19:00 以降の場合：現在時刻から10分後
        // それ以外の場合：開催前日の 19:00
        this.firstReminderTime = new Date(this.startTime.valueOf());
        this.firstReminderTime.setDate(this.firstReminderTime.getDate() - 1);
        this.firstReminderTime.setHours(19, 0, 0, 0);

        if(new Date() > this.firstReminderTime){
            this.firstReminderTime = new Date();
            this.firstReminderTime.setMinutes(this.firstReminderTime.getMinutes() + 10);
        }

        // 2回目にリマインドする時間は次のように決める：
        // 午前中に開催する場合：開始時間の1時間前
        // 午後に開催する場合：開催日の 10:00
        this.secondReminderTime = new Date(this.startTime.valueOf());

        if(this.startTime.getHours() < 12){
            this.secondReminderTime.setHours(this.secondReminderTime.getHours() - 1);
        }else{
            this.secondReminderTime.setHours(10, 0, 0, 0);
        }
    }

    toStringArray(): [string, string, string]{
        const formatDate = (d: Date) => 
            new Intl.DateTimeFormat("ja-JP", {
                year: "numeric", month: "numeric", day: "numeric"
            }).format(d);
        const formatTime = (d: Date) => 
            new Intl.DateTimeFormat("ja-JP", {
                hour: "numeric", minute: "numeric"
            }).format(d);

        return [
            formatDate(this.startTime),
            formatTime(this.startTime),
            formatTime(this.duration),
        ];
    }
}
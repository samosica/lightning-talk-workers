function chat_postMessage(
    token: string,
    channel: string,
    text: string,
    options = {}
) {
    const args = { channel, text, ...options };
    const payload = JSON.stringify(args);
    const response = UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', {
        method: 'post',
        headers: {
            Authorization: `Bearer ${token}`
        },
        contentType: 'application/json; charset=UTF-8',
        payload,
    });
    return JSON.parse(response.getContentText("UTF-8"));
}

function chat_scheduleMessage(
    token: string,
    channel: string,
    post_at: Date,
    text: string,
    options = {}
) {
    const args = { 
        channel,
        text,
        post_at: Math.floor(post_at.getTime() / 1000),
        ...options
    };
    const payload = JSON.stringify(args);
    const response = UrlFetchApp.fetch('https://slack.com/api/chat.scheduleMessage', {
        method: 'post',
        headers: {
            Authorization: `Bearer ${token}`
        },
        contentType: 'application/json; charset=UTF-8',
        payload,
    });
    return JSON.parse(response.getContentText("UTF-8"));
}

function chat_scheduledMessages_list(
    token: string,
    options = {}
) {
    const payload = JSON.stringify(options);
    const response = UrlFetchApp.fetch('https://slack.com/api/chat.scheduledMessages.list', {
        method: 'post',
        headers: {
            Authorization: `Bearer ${token}`
        },
        contentType: 'application/json; charset=UTF-8',
        payload,
    });
    return JSON.parse(response.getContentText("UTF-8"));
}

function chat_deleteScheduledMessage(
    token: string,
    channel: string,
    scheduled_message_id: string,
    options = {}
) {
    const args = {
        channel,
        scheduled_message_id,
        ...options
    };
    const payload = JSON.stringify(args);
    const response = UrlFetchApp.fetch('https://slack.com/api/chat.deleteScheduledMessage', {
        method: 'post',
        headers: {
            Authorization: `Bearer ${token}`
        },
        contentType: 'application/json; charset=UTF-8',
        payload,
    });
    return JSON.parse(response.getContentText("UTF-8"));
}
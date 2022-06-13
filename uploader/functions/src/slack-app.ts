import { logger } from "firebase-functions";
// eslint-disable-next-line import/no-unresolved
import { getFirestore } from "firebase-admin/firestore";
import { App, AppOptions, ExpressReceiver } from "@slack/bolt";
import { PubSub } from "@google-cloud/pubsub";
import { config } from "./config";

const expressReceiver = new ExpressReceiver({
    signingSecret: config.slack.signingSecret,
    endpoints: "/events",
    processBeforeResponse: true, // FaaS-specific
});

const appOptions: AppOptions = {
    token: config.slack.token,
};

switch (config.mode) {
case "development": {
    appOptions.socketMode = true;
    appOptions.appToken = config.slack.appToken;
    appOptions.signingSecret = config.slack.signingSecret;
    break;
}
case "production": {
    appOptions.receiver = expressReceiver;
    break;
}
}

export const app = new App(appOptions);

app.error(async (e) => {
    logger.error(e.message);
});

/**
 *
 * @param id Message ID (= ts)
 * @returns Whether the message has been received
 */
const hasBeenReceived = async (id: string): Promise<boolean> => {
    const db = getFirestore();

    return db.runTransaction(async (t) => {
        const messageRef = db.collection("received-messages").doc(id);
        const message = await t.get(messageRef);

        if (message.exists) {
            return true;
        }

        t.set(messageRef, { id });

        return false;
    });
};

// In order to receive files only in DM, use message event rather than file_share event
app.event("message", async ({ message, say }) => {
    // This conditional ensures that message is of FileShareMessageEvent
    if ( message.subtype !== "file_share" ) {
        return;
    }

    // If message does not contain files
    if (!message.files || message.files.length === 0) {
        return;
    }

    // If message has been received
    if (await hasBeenReceived(message.ts)) {
        return;
    }

    logger.log("Received files:", message.files);

    const data = {
        files: message.files,
        user: message.user,
        posted: message.ts,
    };

    try {
        const pubSubClient = new PubSub();
        const buffer = Buffer.from(JSON.stringify(data));
        const messageId = await pubSubClient.topic("upload").publish(buffer);
        logger.log("Published a message for file upload:", messageId);
        say("アップロードを開始します。");
    } catch (e) {
        logger.error("Could not publish a message for file upload:", data);
        say("アップロードに失敗しました。再度お試しください。");
        return;
    }
});

export const expressApp = expressReceiver.app;

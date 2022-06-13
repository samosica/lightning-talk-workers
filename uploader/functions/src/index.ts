import * as functions from "firebase-functions";
// See https://stackoverflow.com/questions/69746672/unable-to-resolve-path-to-module-firebase-admin-app-eslint
// eslint-disable-next-line import/no-unresolved
import { initializeApp } from "firebase-admin/app";
import { google } from "googleapis";
import * as slackApp from "./slack-app";
import { uploadHandler } from "./upload";
import { config } from "./config";

initializeApp();

const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/drive"],
});
google.options({ auth });

process.env.TZ = "Asia/Tokyo";

export const slack =
    functions.region("asia-northeast1").https.onRequest(slackApp.expressApp);

export const upload =
    functions.region("asia-northeast1").pubsub.topic("upload").onPublish(
        async (message, context) => {
            await uploadHandler(message, context);
        }
    );

if (config.mode === "development") {
    (async () => {
        functions.logger.info("Running in development mode");
        await slackApp.app.start(3000);
        functions.logger.info(
            "Running Slack app. If you see the warning message \"Socket Mode is not turned on\", " +
            "go to your app page via https://api.slack.com/apps/ and turn on Socket Mode."
        );
    })();
}

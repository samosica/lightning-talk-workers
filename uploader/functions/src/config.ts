import { config as funConfig_ } from "firebase-functions";

interface Config {
    readonly mode: "development" | "production",
    readonly gdrive: {
        readonly folderId: string,
    },
    readonly slack: {
        readonly token: string,
        readonly signingSecret: string,
        readonly appToken?: string,
    },
}

const funConfig = funConfig_();

// The names of environment variables on Cloud Functions MUST NOT contain capital letters.
// Use underscore (_) instead.
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
export const config: Config = {
    mode: funConfig.app?.mode ?? "production",
    gdrive: {
        folderId: funConfig.gdrive.folder_id,
    },
    slack: {
        token: funConfig.slack.token,
        signingSecret: funConfig.slack.signing_secret,
        appToken: funConfig.slack.app_token,
    },
};
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import * as functions from "firebase-functions";
import { google, drive_v3 } from "googleapis";
import axios from "axios";
import { GenericMessageEvent } from "@slack/bolt";
import { app as slackApp } from "./slack-app";
import { config } from "./config";

// eslint-disable-next-line require-jsdoc
export const uploadHandler = async (message: functions.pubsub.Message, context: functions.EventContext): Promise<void> => {
    functions.logger.log("Received a message:", context.eventId);

    // The complex type is actually File in @slack/bolt, which is not exposed :(
    const { files, user, posted: posted_ }: {
        files: NonNullable<GenericMessageEvent["files"]>[number][],
        user: string,
        posted: string,
    } = message.json;
    const posted = new Date(parseInt(posted_, 10) * 1000);

    // eslint-disable-next-line require-jsdoc
    const say = async (text: string) => {
        await slackApp.client.chat.postMessage({
            token: config.slack.token,
            channel: user,
            text,
        });
    };

    // 1. In Google Drive, create a monthly folder if needed
    const drive = google.drive({ version: "v3" });
    let monthlyFolderId: string;

    try {
        monthlyFolderId = await getMonthlyFolder(
            posted.getFullYear(),
            posted.getMonth() + 1,
            config.gdrive.folderId,
            drive
        );
    } catch (e) {
        await say("アップロードに失敗しました。再度お試しください。");
        functions.logger.error("Could not get monthly folder");
        return;
    }

    // 2. Send the attached files to the folder
    let didFailToTransferFile = false;

    for (const file of files) {
        try {
            const fileId = await transferFileFromSlackToGDrive(
                file,
                monthlyFolderId,
                config.slack.token,
                drive
            );
            functions.logger.log("Uploaded file:", file, fileId);
            await say(`:ok: ${file.name}`);
        } catch (e) {
            console.log(e);
            didFailToTransferFile = true;
            functions.logger.error("Could not upload file:", file);
            await say(`:ng: ${file.name}`);
        }
    }

    if (didFailToTransferFile) {
        await say(":ok: の付いたファイルはアップロードされました。:ng: の付いたファイルは再送してください。");
    } else {
        await say("すべてのファイルをアップロードしました。");
    }
};

/**
 * Get a folder in Google Drive
 * If the specified folder does not exist, this function creates a new folder
 * with the given name and returns it
 * @param name
 * @param parentId The ID of the folder to be searched
 */
const getFolder = async (
    name: string,
    parentId: string,
    drive: drive_v3.Drive
): Promise<string> => {
    const res = await drive.files.list({
        q: `parents in '${parentId}' and name = '${name}' and mimeType = 'application/vnd.google-apps.folder'`,
        fields: "files(id)",
    });

    if (res.data.files && res.data.files.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return res.data.files[0].id!;
    }

    const res2 = await drive.files.create({
        requestBody: {
            name,
            parents: [parentId],
            mimeType: "application/vnd.google-apps.folder",
        },
        fields: "id",
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return res2.data.id!;
};

/**
 * Get a monthly folder (for example, 2104 for April 2021) in Google Drive
 * If the specified folder does not exist, this function creates a new folder
 * @param year
 * @param month
 * @param parentId The ID of the folder to be searched
 */
const getMonthlyFolder = (
    year: number,
    month: number,
    parentId: string,
    drive: drive_v3.Drive
): Promise<string> => {
    const folderName =
        (year % 100).toString().padStart(2, "0") +
        month.toString().padStart(2, "0");

    return getFolder(folderName, parentId, drive);
};

/**
 * Get a file in Google Drive
 * If the specified file does not exist, this function creates a new file
 * with the given name and returns it
 * @param name
 * @param parentId The ID of the folder to be searched
 */
const getFile = async (
    name: string,
    parentId: string,
    drive: drive_v3.Drive
): Promise<string> => {
    const res = await drive.files.list({
        q: `parents in '${parentId}' and name = '${name}'`,
        fields: "files(id)",
    });

    if (res.data.files && res.data.files.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return res.data.files[0].id!;
    }

    const res2 = await drive.files.create({
        requestBody: {
            name,
            parents: [parentId],
        },
        fields: "id",
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return res2.data.id!;
};

/**
 * Transfer a file in Slack to Google Drive
 * If there exists a file with the same name as the given one, overwrite the content
 * @param file
 * @param folderId
 * @param slackToken
 * @param drive
 * @returns The ID of the given file at Google Drive
 */
export const transferFileFromSlackToGDrive = async (
    // The complex type is actually File in @slack/bolt, which is not exposed :(
    file: NonNullable<GenericMessageEvent["files"]>[number],
    folderId: string,
    slackToken: string,
    drive: drive_v3.Drive
): Promise<string> => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const fileId = await getFile(file.name!, folderId, drive);

    // Is there a situation where url_private field is empty?
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const resOfDownload = await axios.get(file.url_private!, {
        headers: {
            "Authorization": `Bearer ${slackToken}`,
        },
        responseType: "stream",
    });

    const resOfUpload = await drive.files.update({
        fileId,
        media: {
            body: resOfDownload.data, // readable stream
        },
        fields: "id",
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return resOfUpload.data.id!;
};

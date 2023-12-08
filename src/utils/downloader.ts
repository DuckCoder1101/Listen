import { BrowserWindow, app, dialog } from "electron";
import { createWriteStream } from "fs";
import { get, IncomingMessage } from "http";
import { join } from "path";

import { Music } from "./types";

const acceptedFileTypes = ["mp3", "mp4"];

export default async function Download(music: Music, mediaURL: string) {
    const res = await new Promise(resolve => {
        get(mediaURL, (response) => {
            console.log(response.statusMessage);
            resolve(response.statusCode == 200 ? response : null);
        });
    }) as IncomingMessage | null;

    if (res != null) {
        const fileType = res.headers["content-type"]?.split("/")[1];

        if (!fileType || acceptedFileTypes.includes(fileType)) {
            console.log(fileType);
            return null;
        }

        const path = join(app.getPath("appData"), `ToListen/library/${music.name}.${fileType}`);
        const fileStream = createWriteStream(path);
        res.pipe(fileStream);

        return path;
    } else {
        dialog.showMessageBoxSync(BrowserWindow.getAllWindows()[0], {
            title: "Download falhado!",
            message: "Ocorreu erro durante o download de uma ou mais músicas, verifique o URL e tente novamente!",
            type: "error"
        });

        return null;
    }
}
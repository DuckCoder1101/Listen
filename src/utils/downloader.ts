import { BrowserWindow, app, dialog } from "electron";
import { createWriteStream } from "fs";
import { join } from "path";
import https from "https";
import http from "http";

import { Music } from "./types";

const acceptedFileTypes = [ "mp3", "ogg", "wav" ];

export default async function Download(music: Music, musicURL: string, mainWindow: BrowserWindow) {
    try {
        const res = await new Promise((resolve, reject) => {
            if (musicURL.startsWith("http://")) {
                http.get(musicURL, (res) => {
                    if (res.statusCode == 200 && !res.errored) resolve(res);
                    else reject(res.errored);
                });
            } else {
                https.get(musicURL, (res) => {
                    if (res.statusCode == 200 && !res.errored) resolve(res);
                    else reject(res.errored);
                });            
            }
        }) as http.IncomingMessage;

        const contentType = res.headers["content-type"]?.split("/")[1];
        if (!contentType || !acceptedFileTypes.includes(contentType)) {
            dialog.showMessageBox(mainWindow, {
                title: "Download falhado!",
                message: `O tipo de arquivo (${contentType}) retornado pelo servidor não é suportado pelo programa!`,
                type: "error"
            }); 

            return null;
        }

        const path = join(app.getPath("appData"), `/ToListen/library/${music.name}.${contentType}`);

        const fileStream = createWriteStream(path);
        res.pipe(fileStream);

        return path;

    } catch (err) {
        dialog.showMessageBox(mainWindow, {
            title: "Download falhado!",
            message: "Ocorreu erro durante o download da música, verifique o URL e tente novamente!",
            type: "error"
        }); 

        return null;
    }
}
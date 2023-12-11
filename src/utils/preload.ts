import { contextBridge, ipcRenderer } from "electron";

const sendChanels: string[] = [
    "add-musics-from-files",
    "add-music-from-url",
    "play-music",
    "pause-music",
    "(modal)-create-musics",
    "(modal)-alter-music",
    "backup",
    "delete-music",
    "alter-music",
    "show-dialog"
];

const receiveChannels: string[] = [
    "add-music-error",
    "update-musics-list",
    "(modal)-musics",
    "pause-music",
    "play-library",
    "restart-music",
    "set-music-loop"
];

contextBridge.exposeInMainWorld("api", {
    send: (channel: string, arg: any) => {
        if (sendChanels.includes(channel)) {
            ipcRenderer.send(channel, arg);
        }
    },

    receive: (channel: string, callback: (event: any, arg: any) => void) => {
        if (receiveChannels.includes(channel)) {
            ipcRenderer.on(channel, callback);
        }
    }
});
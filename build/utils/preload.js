"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const sendChanels = [
    "add-musics-from-files",
    "add-music-from-url",
    "play-music",
    "pause-music",
    "(modal)-create-musics",
    "(modal)-alter-music",
    "backup",
    "delete-music",
    "alter-music"
];
const receiveChannels = [
    "add-music-error",
    "update-musics-list",
    "(modal)-musics",
    "pause-music"
];
electron_1.contextBridge.exposeInMainWorld("api", {
    send: (channel, arg) => {
        if (sendChanels.includes(channel)) {
            electron_1.ipcRenderer.send(channel, arg);
        }
    },
    receive: (channel, callback) => {
        if (receiveChannels.includes(channel)) {
            electron_1.ipcRenderer.on(channel, callback);
        }
    }
});

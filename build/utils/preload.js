"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const sendChanels = [
    "add-musics-from-files",
    "add-music-from-url",
    "play-music",
    "pause-music",
    "(musics-modal)-create-musics",
    "(musics-modal)-alter-music",
    "backup",
    "delete-music",
    "alter-music",
    "show-dialog",
    "open-options-modal",
    "(options-modal)-save-options"
];
const receiveChannels = [
    "add-music-error",
    "update-musics-list",
    "(musics-modal)-musics",
    "pause-music",
    "play-library",
    "restart-music",
    "set-music-loop",
    "(options-modal)-options-list"
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

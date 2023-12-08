import { BrowserWindow, Notification } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";

export default async function checkForUpdates(mainWindow: BrowserWindow) {
    autoUpdater.autoDownload = true;
    autoUpdater.allowDowngrade = true;
    autoUpdater.autoRunAppAfterInstall = true;

    log.transports.file.level = "debug";
    autoUpdater.logger = log;

    await autoUpdater.checkForUpdates();

    autoUpdater.on("update-available", (info) => {
        new Notification({
            title: `ToListen está atualizando!`,
            body: `O programa será reiniciado em breve para aplicação da versão ${info.version}.`,
            silent: false,
            urgency: "normal"
        }).show();
    });

    autoUpdater.on("download-progress", (info) => {
        mainWindow.setProgressBar(info.percent, {
            mode: "indeterminate"
        });
    });

    autoUpdater.on("update-downloaded", () => {
        autoUpdater.quitAndInstall(true, true);
    });
}
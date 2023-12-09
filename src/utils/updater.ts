import { BrowserWindow, Notification } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";

export default async function CheckForUpdates(mainWindow: BrowserWindow) {
    autoUpdater.autoDownload = true;
    autoUpdater.allowDowngrade = true;
    autoUpdater.autoRunAppAfterInstall = true;

    log.transports.file.level = "debug";
    autoUpdater.logger = log;

    autoUpdater.checkForUpdates();

    autoUpdater.on("update-available", (info) => {
        new Notification({
            title: `ToListen está atualizando!`,
            body: `O programa será reiniciado em breve para aplicação da versão ${info.version}.`,
            silent: false,
            urgency: "normal"
        }).show();
    });

    await new Promise(resolve => {
        autoUpdater.on("update-not-available", resolve);
        autoUpdater.on("update-downloaded", (ev) => {
            autoUpdater.quitAndInstall(true, true);
            resolve(null);
        });
    });
}
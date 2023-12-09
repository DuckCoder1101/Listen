import { BrowserWindow, Notification } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";

export default async function CheckForUpdates(mainWindow: BrowserWindow) {
    autoUpdater.autoDownload = true;
    autoUpdater.allowDowngrade = true;
    autoUpdater.autoRunAppAfterInstall = true;

    log.transports.file.level = "debug";
    autoUpdater.logger = log;

    const result = await autoUpdater.checkForUpdates();
    if (result != null) {
        new Notification({
            title: `ToListen está atualizando!`,
            body: `O programa será reiniciado em breve para aplicação da versão ${result.updateInfo.version}.`,
            silent: false,
            urgency: "normal"
        }).show();

        await new Promise(resolve => {
            autoUpdater.on("update-downloaded", resolve);
        });

        autoUpdater.quitAndInstall(true, true);
    }
}
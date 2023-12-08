import { autoUpdater } from "electron-updater";
import electronLog from "electron-log";

export default function CheckForUpdates() {
    electronLog.transports.file.level = "debug";
    autoUpdater.logger = electronLog;

    autoUpdater.checkForUpdatesAndNotify({
        title: "Atualização do ToListen!",
        body: "O ToListen irá reiniciar para atualização em breve!."
    });

    autoUpdater.on("update-downloaded", () => {
        autoUpdater.quitAndInstall(true);
    });
}
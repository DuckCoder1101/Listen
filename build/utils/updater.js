"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_updater_1 = require("electron-updater");
const electron_log_1 = __importDefault(require("electron-log"));
function CheckForUpdates() {
    electron_log_1.default.transports.file.level = "debug";
    electron_updater_1.autoUpdater.logger = electron_log_1.default;
    electron_updater_1.autoUpdater.checkForUpdatesAndNotify({
        title: "Atualização do ToListen!",
        body: "O ToListen irá reiniciar para atualização em breve!."
    });
    electron_updater_1.autoUpdater.on("update-downloaded", () => {
        electron_updater_1.autoUpdater.quitAndInstall(true);
    });
}
exports.default = CheckForUpdates;

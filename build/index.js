"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const fs_1 = require("fs");
const path_1 = require("path");
const database_1 = require("./utils/database");
const tray_1 = __importDefault(require("./utils/tray"));
const ipcMainEvents_1 = __importDefault(require("./utils/ipcMainEvents"));
const updater_1 = __importDefault(require("./utils/updater"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        electron_1.app.setName("ToListen");
        electron_1.app.setAppUserModelId("ToListen");
        if (!electron_is_dev_1.default)
            (0, updater_1.default)();
        const mainWindow = new electron_1.BrowserWindow({
            title: electron_1.app.getName(),
            center: true,
            opacity: 0,
            autoHideMenuBar: true,
            icon: (0, path_1.join)(__dirname, "../public/icons/icon.png"),
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: true,
                preload: (0, path_1.join)(__dirname, "./utils/preload.js"),
                devTools: electron_is_dev_1.default
            }
        });
        const musics = yield (0, database_1.ReadDatabase)();
        const filteredMusics = musics.filter((music) => (0, fs_1.existsSync)(music.path));
        if (musics.length != filteredMusics.length) {
            electron_1.dialog.showMessageBoxSync(mainWindow, {
                title: "Músicas não encontradas!",
                message: "Algumas músicas foram excluídas por seus arquivos não existirem mais! \n Para evitar isso faça o backup da biblioteca.",
                type: "error"
            });
            (0, database_1.UpdateDatabase)(filteredMusics);
        }
        yield mainWindow.loadFile((0, path_1.join)(__dirname, "../public/html/mainwindow.html"));
        mainWindow.webContents.send("update-musics-list", filteredMusics);
        mainWindow.setOpacity(1);
        mainWindow.maximize();
        (0, tray_1.default)(mainWindow);
        (0, ipcMainEvents_1.default)(mainWindow);
        if (electron_is_dev_1.default) {
            mainWindow.webContents.openDevTools();
        }
        mainWindow.on("close", (ev) => {
            ev.preventDefault();
            mainWindow.hide();
            new electron_1.Notification({
                title: `${electron_1.app.getName()} ainda está em execução!`,
                body: "🎵 Tocando em 2° plano",
                silent: true,
                urgency: "low"
            }).show();
        });
    });
}
electron_1.app.on("ready", () => main());

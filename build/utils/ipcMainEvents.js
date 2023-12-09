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
const fs_1 = require("fs");
const path_1 = require("path");
const database_1 = require("./database");
const downloader_1 = __importDefault(require("./downloader"));
const isValidUrl = (urlString) => {
    var urlPattern = new RegExp('^(https?:\\/\\/)?' +
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
        '((\\d{1,3}\\.){3}\\d{1,3}))' +
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\#[-a-z\\d_]*)?$', 'i');
    return urlPattern.test(urlString);
};
const CreateModal = (defaultInfo, isFromDownload = false, isAChange = false) => __awaiter(void 0, void 0, void 0, function* () {
    const modalWindow = new electron_1.BrowserWindow({
        title: "Adicionar músicias",
        width: 500, height: 400,
        center: true, modal: true, alwaysOnTop: true,
        autoHideMenuBar: true, resizable: false, minimizable: false,
        icon: (0, path_1.join)(__dirname, "../public/icons/icon.png"),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            preload: (0, path_1.join)(__dirname, "./preload.js")
        }
    });
    yield modalWindow.loadFile((0, path_1.join)(__dirname, "../../public/html/modal.html"));
    modalWindow.webContents.send("(modal)-musics", { defaultInfo, isFromDownload, isAChange });
    modalWindow.on("close", (ev) => {
        ev.preventDefault();
        const res = electron_1.dialog.showMessageBoxSync(modalWindow, {
            title: "Fechar janela?",
            type: "warning",
            message: "Deseaja mesmo cancelar a operação?",
            buttons: ["Ok", "Cancelar"],
        });
        if (res == 0) {
            modalWindow.destroy();
        }
    });
});
function StartEvents(mainWindow) {
    electron_1.ipcMain.on("add-music-from-url", (ev, url) => {
        if (!url || !isValidUrl(url)) {
            electron_1.dialog.showMessageBoxSync(mainWindow, {
                title: "URL inválido",
                message: "O URL para download da música é inválido!",
                type: "error"
            });
        }
        else {
            CreateModal([{ id: -1, name: "", author: "", path: url }], true);
        }
    });
    electron_1.ipcMain.on("add-musics-from-files", () => __awaiter(this, void 0, void 0, function* () {
        const paths = electron_1.dialog.showOpenDialogSync(mainWindow, {
            title: "Adicionar músicas",
            defaultPath: electron_1.app.getPath("music"),
            properties: ["multiSelections"],
            filters: [
                {
                    name: "Music files",
                    extensions: ["mp3", "wav", "ogg"]
                }
            ]
        });
        if (paths != undefined && paths.length > 0) {
            const musics = [];
            paths.forEach((path) => musics.push({
                id: -1,
                name: "",
                author: "",
                path
            }));
            CreateModal(musics);
        }
    }));
    electron_1.ipcMain.on("(modal)-create-musics", (ev, info) => __awaiter(this, void 0, void 0, function* () {
        const databaseMusics = yield (0, database_1.ReadDatabase)();
        let allMusics = databaseMusics;
        info.musics.forEach((music) => {
            music.name = music.name.replace(/["']/g, "");
            music.author = music.author.replace(/["']/g, "");
            if (!allMusics.find((other) => other.name == music.name && other.path == music.path)) {
                music.id = allMusics.length;
                allMusics.push(music);
            }
        });
        if (info.isFromDownload) {
            const url = info.musics[0].path;
            const path = yield (0, downloader_1.default)(info.musics[0], url, mainWindow);
            if (!path)
                return ev.sender.close();
            allMusics.find(music => music == info.musics[0]).path = path;
        }
        (0, database_1.UpdateDatabase)(allMusics);
        ev.sender.close();
        mainWindow.webContents.send("update-musics-list", allMusics);
    }));
    electron_1.ipcMain.on("(modal)-alter-music", (ev, { id, name, author, path }) => __awaiter(this, void 0, void 0, function* () {
        let allMusics = yield (0, database_1.ReadDatabase)();
        name = name.replace(/["']/g, "");
        author = author.replace(/["']/g, "");
        if (allMusics[id] != undefined) {
            allMusics[id] = { id, name, author, path };
        }
        (0, database_1.UpdateDatabase)(allMusics);
        mainWindow.webContents.send("update-musics-list", allMusics);
        ev.sender.close();
    }));
    electron_1.ipcMain.on("backup", () => __awaiter(this, void 0, void 0, function* () {
        const path = (0, path_1.join)(electron_1.app.getPath("appData"), "/ToListen/library");
        let musics = yield (0, database_1.ReadDatabase)();
        for (let music of musics) {
            if (!music.path.startsWith(path)) {
                const newPath = (0, path_1.join)(path, `/${music.name}${(0, path_1.extname)(music.path)}`);
                (0, fs_1.copyFileSync)(music.path, newPath);
                music.path = newPath;
            }
        }
        (0, database_1.UpdateDatabase)(musics);
        mainWindow.webContents.send("update-musics-list", musics);
        electron_1.dialog.showMessageBoxSync(mainWindow, {
            title: "Backup concluído",
            message: "O backup da sua biblioteca foi concluído com sucesso!",
            type: "info"
        });
    }));
    electron_1.ipcMain.on("alter-music", (ev, musicId) => __awaiter(this, void 0, void 0, function* () {
        const allMusics = yield (0, database_1.ReadDatabase)();
        const targetMusic = allMusics.find((music) => music.id == musicId);
        CreateModal([targetMusic], false, true);
    }));
    electron_1.ipcMain.on("delete-music", (ev, musicId) => __awaiter(this, void 0, void 0, function* () {
        const allMusics = yield (0, database_1.ReadDatabase)();
        const targetMusic = allMusics.find((music) => music.id == musicId);
        const filteredMusics = allMusics.filter((music) => music.id != musicId);
        const path = (0, path_1.join)(electron_1.app.getPath("appData"), "/ToListen/library");
        (0, database_1.UpdateDatabase)(filteredMusics);
        mainWindow.webContents.send("update-musics-list", filteredMusics);
        if (targetMusic.path.startsWith(path)) {
            (0, fs_1.unlinkSync)(targetMusic.path);
        }
    }));
}
exports.default = StartEvents;

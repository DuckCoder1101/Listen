// Code by DuckCoder1101

import { app, BrowserWindow, dialog, Notification } from "electron";
import isDev from "electron-is-dev";
import { existsSync } from "fs";
import log from "electron-log";
import { join } from "path";

import { GetLibrary, SetLibrary } from "./utils/library";
import { GetAppOptions } from "./utils/options";
import StartEvents from "./utils/ipcMainEvents";
import CheckForUpdates from "./utils/updater";
import CreateTray from "./utils/tray";

async function main() {
    app.setName("ToListen");
    app.setAppUserModelId("ToListen");
    log.initialize({ preload: false });

    const mainWindow = new BrowserWindow({
        title: app.getName(),
        center: true,
        opacity: 0,
        autoHideMenuBar: true,
        icon: join(__dirname, "../public/icons/icon.png"),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            preload: join(__dirname, "./utils/preload.js"),
            devTools: isDev
        }
    });

    const musics = await GetLibrary();
    const filteredMusics = musics.filter((music) => existsSync(music.path));

    if (musics.length != filteredMusics.length) {
        dialog.showMessageBoxSync(mainWindow, {
            title: "Músicas não encontradas!",
            message: "Algumas músicas foram excluídas por seus arquivos não existirem mais! \n Para evitar isso faça o backup da biblioteca.",
            type: "warning"
        });

        SetLibrary(filteredMusics);
    }

    await mainWindow.loadFile(join(__dirname, "../public/html/mainwindow.html"));
    mainWindow.webContents.send("update-musics-list", filteredMusics);

    mainWindow.setOpacity(1);
    mainWindow.maximize();

    CreateTray(mainWindow);
    StartEvents(mainWindow);

    mainWindow.on("close", async (ev) => {
        const options = await GetAppOptions();

        if (options[0].value) {
            ev.preventDefault();
            mainWindow.hide();
    
            if (options[1].value) {
                new Notification({
                    title: `ToListen ainda está em execução!`,
                    body: "🎵 Tocando em 2° plano",
                    silent: true,
                    urgency: "low"
                }).show();
            }
        }
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    } else {
        CheckForUpdates(mainWindow);
    }
}

app.on("ready", () => main());
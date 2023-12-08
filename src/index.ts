import { app, BrowserWindow, dialog, Notification } from "electron";
import isDev from "electron-is-dev";
import { existsSync } from "fs";
import { join } from "path";

import { ReadDatabase, UpdateDatabase } from "./utils/database";
import CreateTray from "./utils/tray";
import StartEvents from "./utils/ipcMainEvents";

async function main() {
    app.setName("ToListen");
    app.setAppUserModelId("ToListen");

    const mainWindow = new BrowserWindow({
        title: app.getName(),
        center: true,
        opacity: 0,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            preload: join(__dirname, "./utils/preload.js"),
            devTools: isDev
        }
    });

    const musics = await ReadDatabase();
    const filteredMusics = musics.filter((music) => existsSync(music.path));

    if (musics.length != filteredMusics.length) {
        dialog.showMessageBoxSync(mainWindow, {
            title: "Músicas não encontradas!",
            message: "Algumas músicas foram excluídas por seus arquivos não existirem mais! \n Para evitar isso faça o backup da biblioteca.",
            type: "error"
        });

        UpdateDatabase(filteredMusics);
    }

    await mainWindow.loadFile(join(__dirname, "../public/html/mainwindow.html"));
    mainWindow.webContents.send("update-musics-list", filteredMusics);

    mainWindow.setOpacity(1);
    mainWindow.maximize();

    CreateTray(mainWindow);
    StartEvents(mainWindow);

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on("close", (ev) => {
        ev.preventDefault();
        mainWindow.hide();

        new Notification({
            title: `${app.getName()} ainda está em execução!`,
            body: "🎵 Tocando em 2° plano",
            silent: true,
            urgency: "low"
        }).show();
    });
}

app.on("ready", () => main());
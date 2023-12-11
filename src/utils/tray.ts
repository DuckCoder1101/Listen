import { app, BrowserWindow, Menu, Tray } from "electron";
import { join } from "path";

export default function CreateTray(mainWindow: BrowserWindow) {
    const tray = new Tray(join(__dirname, "../../public/icons/icon.png"));
    tray.setContextMenu(Menu.buildFromTemplate([
        {
            label: "Abrir",
            type: "normal",
            click: () => {
                mainWindow.show();
                mainWindow.maximize();
            }
        },
        {
            label: "Controles de música",
            type: "submenu",
            submenu: [
                {
                    label: "Tocar biblíoteca",
                    type: "normal",
                    click() {
                        mainWindow.webContents.send("play-library")
                    }
                },
                {
                    label: "Pausar música",
                    type: "normal",
                    click() {
                        mainWindow.webContents.send("pause-music")
                    }
                },
                {
                    label: "Reiniar música",
                    type: "normal",
                    click() {
                        mainWindow.webContents.send("restart-music")
                    }
                },
                {
                    label: "Loop",
                    type: "checkbox",
                    click(menuItem) {
                        mainWindow.webContents.send("set-music-loop", menuItem.checked)
                    },
                }
            ]
        },
        {
            label: "Fechar",
            type: "normal",
            click: () => {
                mainWindow.removeAllListeners("close");
                if (process.platform != "darwin") {
                    app.quit();
                }
            }
        }
    ]));
}
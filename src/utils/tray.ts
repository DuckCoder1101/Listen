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
                    label: "Pausar música",
                    type: "normal",
                    click: () => {
                        mainWindow.webContents.send("pause-music")
                    }
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
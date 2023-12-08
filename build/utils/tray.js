"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
function CreateTray(mainWindow) {
    const tray = new electron_1.Tray((0, path_1.join)(__dirname, "../../public/icons/tray.png"));
    tray.setContextMenu(electron_1.Menu.buildFromTemplate([
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
                        mainWindow.webContents.send("pause-music");
                    }
                }
            ]
        },
        {
            label: "Fechar",
            type: "normal",
            click: () => {
                if (process.platform != "darwin") {
                    electron_1.app.exit(0);
                }
            }
        }
    ]));
}
exports.default = CreateTray;

import { BrowserWindow, app, dialog, ipcMain } from "electron";
import { copyFileSync, unlinkSync } from "fs";
import { join, extname } from "path";

import { ModalCreateMusicResponse, Music } from "./types";
import { GetAppOptions, SetAppOptions } from "./options";
import { GetLibrary, SetLibrary } from "./library";
import Download from "./downloader";

const isValidUrl = (urlString: string) => {
    var urlPattern = new RegExp('^(https?:\\/\\/)?' +
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
        '((\\d{1,3}\\.){3}\\d{1,3}))' +
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\#[-a-z\\d_]*)?$', 'i');
    
    return urlPattern.test(urlString);
};

const OpenMusicsModal = async (defaultInfo: Music[], isFromDownload = false, isAChange = false) => {
    const modalWindow = new BrowserWindow({
        title: "Adicionar músicias",
        width: 500, height: 400,
        center: true, modal: true, alwaysOnTop: true,
        autoHideMenuBar: true, resizable: false, minimizable: false,
        icon: join(__dirname, "../public/icons/icon.png"),
        maximizable: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            preload: join(__dirname, "./preload.js")
        }
    });

    await modalWindow.loadFile(join(__dirname, "../../public/html/musicsmodal.html"));
    modalWindow.webContents.send("(musics-modal)-musics", { defaultInfo, isFromDownload, isAChange });

    modalWindow.on("close", (ev) => {
        ev.preventDefault();
        const res = dialog.showMessageBoxSync(modalWindow, {
            title: "Fechar janela?",
            type: "warning", 
            message: "Deseaja mesmo cancelar a operação?",
            buttons: [ "Ok", "Cancelar" ],
        });

        if (res == 0) {
            modalWindow.removeAllListeners("close");
            modalWindow.close();
        }
    });
};

const OpenOptionsModal = async () => {
    const modalWindow = new BrowserWindow({
        title: "Configurações",
        width: 500, height: 400,
        center: true, modal: true,
        autoHideMenuBar: true, resizable: false,
        icon: join(__dirname, "../public/icons/icon.png"),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            preload: join(__dirname, "./preload.js")
        }
    });

    await modalWindow.loadFile(join(__dirname, "../../public/html/optionsmodal.html"));
    modalWindow.webContents.send("(options-modal)-options-list", await GetAppOptions());
};

export default function StartEvents(mainWindow: BrowserWindow) {
    ipcMain.on("add-music-from-url", (ev, url: string) => {
        if (!url || !isValidUrl(url)) {
            dialog.showMessageBoxSync(mainWindow, {
                title: "URL inválido",
                message: "O URL para download da música é inválido!",
                type: "error"
            });
        } else {
            OpenMusicsModal([ { id: -1, name: "", author: "", path: url } ], true);
        }
    });

    ipcMain.on("add-musics-from-files", async () => {
        const paths = dialog.showOpenDialogSync(mainWindow, {
            title: "Adicionar músicas",
            defaultPath: app.getPath("music"),
            properties: [ "multiSelections" ],
            filters: [
                { 
                    name: "Music files", 
                    extensions: [ "mp3", "wav", "ogg" ]
                }
            ]
        });

        if (paths != undefined && paths.length > 0) {
            const musics: Music[] = [];
            paths.forEach((path) => musics.push({
                id: -1,
                name: "",
                author: "",
                path
            }));

            OpenMusicsModal(musics);
        } 
    });

    ipcMain.on("(musics-modal)-create-musics", async (ev, info: ModalCreateMusicResponse) => {
        const databaseMusics = await GetLibrary();
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
            const path = await Download(info.musics[0], url, mainWindow);

            if (!path) return ev.sender.close();

            (allMusics.find(music => music == info.musics[0]) as Music).path = path;
        }

        SetLibrary(allMusics);
        ev.sender.close();

        mainWindow.webContents.send("update-musics-list", allMusics);
    });

    ipcMain.on("(musics-modal)-alter-music", async (ev, { id, name, author, path }: Music) => {
        let allMusics = await GetLibrary();

        name = name.replace(/["']/g, "");
        author = author.replace(/["']/g, "");

        if (allMusics[id] != undefined) {
            allMusics[id] = { id, name, author, path };
        }

        SetLibrary(allMusics);

        mainWindow.webContents.send("update-musics-list", allMusics);
        ev.sender.close();
    });

    ipcMain.on("backup", async () => {
        const path = join(app.getPath("appData"), "/ToListen/library");
        let musics = await GetLibrary();

        for (let music of musics) {
            if (!music.path.startsWith(path)) {
                const newPath = join(path, `/${music.name}${extname(music.path)}`); 

                copyFileSync(music.path, newPath);
                music.path = newPath;
            }
        }

        SetLibrary(musics);
        mainWindow.webContents.send("update-musics-list", musics);

        dialog.showMessageBoxSync(mainWindow,  {
            title: "Backup concluído",
            message: "O backup da sua biblioteca foi concluído com sucesso!",
            type: "info"
        });
    });

    ipcMain.on("alter-music", async (ev, musicId: number) => {
        const allMusics = await GetLibrary();
        const targetMusic = allMusics.find((music) => music.id == musicId) as Music;

        OpenMusicsModal([ targetMusic ], false, true);
    });

    ipcMain.on("delete-music", async (ev, musicId: number) => {
        const allMusics = await GetLibrary();
        const targetMusic = allMusics.find((music) => music.id == musicId) as Music;
        const filteredMusics = allMusics.filter((music) => music.id != musicId);

        const path = join(app.getPath("appData"), "/ToListen/library");

        SetLibrary(filteredMusics);
        mainWindow.webContents.send("update-musics-list", filteredMusics);

        if (targetMusic.path.startsWith(path)) {
            unlinkSync(targetMusic.path);
        }
    });

    ipcMain.on("show-dialog", (ev, { type, message }) => {
        dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow() || mainWindow, {
            type,
            message
        });
    });

    ipcMain.on("open-options-modal", (ev) => {
        OpenOptionsModal();
    });

    ipcMain.on("(options-modal)-save-options", async (ev, newoptions: Array<{ id: number, value: boolean }>) => {
        let options = await GetAppOptions();

        newoptions.forEach(({ id, value }) => options[id].value = value);
        SetAppOptions(options);
        
        ev.sender.close();
    });
}
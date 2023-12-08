import { BrowserWindow, app, dialog, ipcMain } from "electron";
import { copyFileSync, unlinkSync } from "fs";
import { join, extname } from "path";

import { ModalCreateMusicResponse, Music } from "./types";
import { ReadDatabase, UpdateDatabase } from "./database";
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

const CreateModal = async (defaultInfo: Music[], isFromDownload = false, isAChange = false) => {
    const modalWindow = new BrowserWindow({
        title: "Adicionar músicias",
        width: 500, height: 400,
        center: true, modal: true, alwaysOnTop: true,
        autoHideMenuBar: true, resizable: false, minimizable: false,
        icon: join(__dirname, "../public/icons/icon.png"),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            preload: join(__dirname, "./preload.js")
        }
    });

    await modalWindow.loadFile(join(__dirname, "../../public/html/modal.html"));
    modalWindow.webContents.send("(modal)-musics", { defaultInfo, isFromDownload, isAChange });

    modalWindow.on("close", (ev) => {
        ev.preventDefault();
        const res = dialog.showMessageBoxSync(modalWindow, {
            title: "Fechar janela?",
            type: "warning", 
            message: "Deseaja mesmo cancelar a operação?",
            buttons: [ "Ok", "Cancelar" ],
        });

        if (res == 0) {
            modalWindow.destroy();
        }
    });
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
            url = url.replace("https://", "http://");
            CreateModal([ { id: -1, name: "", author: "", path: url } ], true);
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

            CreateModal(musics);
        } 
    });

    ipcMain.on("(modal)-create-musics", async (ev, info: ModalCreateMusicResponse) => {
        const databaseMusics = await ReadDatabase();
        let allMusics = [...databaseMusics, ...info.musics];

        info.musics.forEach((music) => music.id = allMusics.indexOf(music));

        if (info.isFromDownload) {
            const url = info.musics[0].path;
            const path = await Download(info.musics[0], url);

            if (path != null) {
                (allMusics.find(music => music == info.musics[0]) as Music).path = path;
            } else {
                allMusics = allMusics.filter(music => music != info.musics[0]);
            }
        }

        UpdateDatabase(allMusics);
        ev.sender.close();

        mainWindow.webContents.send("update-musics-list", allMusics);
    });

    ipcMain.on("(modal)-alter-music", async (ev, { id, name, author, path }: Music) => {
        let allMusics = await ReadDatabase();

        if (allMusics[id] != undefined) {
            allMusics[id] = { id, name, author, path };
        }

        UpdateDatabase(allMusics);

        mainWindow.webContents.send("update-musics-list", allMusics);
        ev.sender.close();
    });

    ipcMain.on("backup", async () => {
        const path = join(app.getPath("appData"), "/ToListen/library");
        let musics = await ReadDatabase();

        for (let music of musics) {
            if (!music.path.startsWith(path)) {
                const newPath = join(path, `/${music.name}${extname(music.path)}`); 

                copyFileSync(music.path, newPath);
                music.path = newPath;
            }
        }

        UpdateDatabase(musics);
        mainWindow.webContents.send("update-musics-list", musics);

        dialog.showMessageBoxSync(mainWindow,  {
            title: "Backup concluído",
            message: "O backup da sua biblioteca foi concluído com sucesso!",
            type: "info"
        });
    });

    ipcMain.on("alter-music", async (ev, musicId: number) => {
        const allMusics = await ReadDatabase();
        const targetMusic = allMusics.find((music) => music.id == musicId) as Music;

        CreateModal([ targetMusic ], false, true);
    });

    ipcMain.on("delete-music", async (ev, musicId: number) => {
        const allMusics = await ReadDatabase();
        const targetMusic = allMusics.find((music) => music.id == musicId) as Music;
        const filteredMusics = allMusics.filter((music) => music.id != musicId);

        const path = join(app.getPath("appData"), "/ToListen/library");

        UpdateDatabase(filteredMusics);
        mainWindow.webContents.send("update-musics-list", filteredMusics);

        if (targetMusic.path.startsWith(path)) {
            unlinkSync(targetMusic.path);
        }
    });
}
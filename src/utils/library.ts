import { app } from "electron";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import isDev from "electron-is-dev";
import { join } from "path";

import { Music } from "./types";

const appDataPath = join(app.getPath("appData"), "/ToListen");
const databasePath = join(appDataPath, "/database.json");
const libraryPath = join(appDataPath, "/library");

export async function GetLibrary(): Promise<Music[]> {
    try {
        if (!existsSync(databasePath)) {
            if (!existsSync(appDataPath)) {
                mkdirSync(appDataPath);
            }

            writeFileSync(databasePath, JSON.stringify({ data: [] }), { encoding: "utf-8" });
        }

        if (!existsSync(libraryPath)) {
            mkdirSync(libraryPath);
        }
        
        const json = readFileSync(databasePath, { encoding: "utf-8" });
        const { data } = await JSON.parse(json);

        return data;
    } catch (err) {
        if (isDev) console.log(err);
        return [];
    }
}

export function SetLibrary(data: Music[]): boolean {
    try {
        const json = JSON.stringify({ data });
        writeFileSync(databasePath, json, {
            encoding: "utf-8"
        });

        return true;
    } catch (err) {
        if (isDev) console.log(err);
        return false;
    }
}
import { app } from "electron";
import isDev from "electron-is-dev";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

import { Music } from "./types";

const path = join(app.getPath("appData"), "/ToListen/database.json");
console.log(path);

export async function ReadDatabase(): Promise<Music[]> {
    try {
        if (existsSync(path)) {
            const rawFile = readFileSync(path, { encoding: "utf-8" });
            const json = await JSON.parse(rawFile);

            return json.data;
        }

        mkdirSync(join(app.getPath("appData"), "ToListen"));
        mkdirSync(join(app.getPath("appData"), "ToListen/library"));

        writeFileSync(path, 
            JSON.stringify({ data: [] }),
            { encoding: "utf-8" }
        );

        return [];
    } catch (err) {
        if (isDev) console.log(err);
        return [];
    }
}

export function UpdateDatabase(data: Music[]): boolean {
    try {
        const json = JSON.stringify({ data });
        writeFileSync(path, json, {
            encoding: "utf-8"
        });

        return true;
    } catch (err) {
        if (isDev) console.log(err);
        return false;
    }
}
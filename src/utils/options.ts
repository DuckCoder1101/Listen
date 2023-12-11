import { app } from "electron";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import isDev from "electron-is-dev";
import { join } from "path";

import { AppOption } from "./types";

const defaultOptions: AppOption[] = [
    {
        id: 0,
        description: "Executar em segundo plano",
        value: true
    },
    {
        id: 1,
        description: "Notificar ao ocultar janela",
        value: true
    }
];

const appDataPath = join(app.getPath("appData"), "/ToListen");
const optionsPath = join(appDataPath, "/options.json");

export async function GetAppOptions(): Promise<AppOption[]> {
    try {
        if (!existsSync(optionsPath)) {
            if (!existsSync(appDataPath)) {
                mkdirSync(appDataPath);
            }

            writeFileSync(
                optionsPath, 
                JSON.stringify({ options: defaultOptions }), 
                { encoding: "utf-8" }
            );

            return defaultOptions;
        }

        const json = readFileSync(optionsPath, { encoding: "utf-8" });
        const { options } = await JSON.parse(json) as { options: AppOption[]};

        for (const option of options) {
            if (option.description == undefined || typeof(option.value) != "boolean") {
                SetAppOptions(defaultOptions);
                return defaultOptions;
            }
        }

        return options;
    } catch (err) {
        if (isDev) console.log(err);
        return defaultOptions;
    }
}

export function SetAppOptions(options: AppOption[]) {
    const json = JSON.stringify({ options });
    writeFileSync(optionsPath, json, { encoding: "utf-8" });
}
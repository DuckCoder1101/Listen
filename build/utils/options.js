"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetAppOptions = exports.GetAppOptions = void 0;
const electron_1 = require("electron");
const fs_1 = require("fs");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const path_1 = require("path");
const defaultOptions = [
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
const appDataPath = (0, path_1.join)(electron_1.app.getPath("appData"), "/ToListen");
const optionsPath = (0, path_1.join)(appDataPath, "/options.json");
function GetAppOptions() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!(0, fs_1.existsSync)(optionsPath)) {
                if (!(0, fs_1.existsSync)(appDataPath)) {
                    (0, fs_1.mkdirSync)(appDataPath);
                }
                (0, fs_1.writeFileSync)(optionsPath, JSON.stringify({ options: defaultOptions }), { encoding: "utf-8" });
                return defaultOptions;
            }
            const json = (0, fs_1.readFileSync)(optionsPath, { encoding: "utf-8" });
            const { options } = yield JSON.parse(json);
            for (const option of options) {
                if (option.description == undefined || typeof (option.value) != "boolean") {
                    SetAppOptions(defaultOptions);
                    return defaultOptions;
                }
            }
            return options;
        }
        catch (err) {
            if (electron_is_dev_1.default)
                console.log(err);
            return defaultOptions;
        }
    });
}
exports.GetAppOptions = GetAppOptions;
function SetAppOptions(options) {
    const json = JSON.stringify({ options });
    (0, fs_1.writeFileSync)(optionsPath, json, { encoding: "utf-8" });
}
exports.SetAppOptions = SetAppOptions;

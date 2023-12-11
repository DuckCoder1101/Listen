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
exports.SetLibrary = exports.GetLibrary = void 0;
const electron_1 = require("electron");
const fs_1 = require("fs");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const path_1 = require("path");
const appDataPath = (0, path_1.join)(electron_1.app.getPath("appData"), "/ToListen");
const databasePath = (0, path_1.join)(appDataPath, "/database.json");
const libraryPath = (0, path_1.join)(appDataPath, "/library");
function GetLibrary() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!(0, fs_1.existsSync)(databasePath)) {
                if (!(0, fs_1.existsSync)(appDataPath)) {
                    (0, fs_1.mkdirSync)(appDataPath);
                }
                (0, fs_1.writeFileSync)(databasePath, JSON.stringify({ data: [] }), { encoding: "utf-8" });
            }
            if (!(0, fs_1.existsSync)(libraryPath)) {
                (0, fs_1.mkdirSync)(libraryPath);
            }
            const json = (0, fs_1.readFileSync)(databasePath, { encoding: "utf-8" });
            const { data } = yield JSON.parse(json);
            return data;
        }
        catch (err) {
            if (electron_is_dev_1.default)
                console.log(err);
            return [];
        }
    });
}
exports.GetLibrary = GetLibrary;
function SetLibrary(data) {
    try {
        const json = JSON.stringify({ data });
        (0, fs_1.writeFileSync)(databasePath, json, {
            encoding: "utf-8"
        });
        return true;
    }
    catch (err) {
        if (electron_is_dev_1.default)
            console.log(err);
        return false;
    }
}
exports.SetLibrary = SetLibrary;

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
exports.UpdateDatabase = exports.ReadDatabase = void 0;
const electron_1 = require("electron");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const fs_1 = require("fs");
const path_1 = require("path");
const path = (0, path_1.join)(electron_1.app.getPath("appData"), "/ToListen/database.json");
console.log(path);
function ReadDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if ((0, fs_1.existsSync)(path)) {
                const rawFile = (0, fs_1.readFileSync)(path, { encoding: "utf-8" });
                const json = yield JSON.parse(rawFile);
                return json.data;
            }
            (0, fs_1.mkdirSync)((0, path_1.join)(electron_1.app.getPath("appData"), "ToListen"));
            (0, fs_1.mkdirSync)((0, path_1.join)(electron_1.app.getPath("appData"), "ToListen/library"));
            (0, fs_1.writeFileSync)(path, JSON.stringify({ data: [] }), { encoding: "utf-8" });
            return [];
        }
        catch (err) {
            if (electron_is_dev_1.default)
                console.log(err);
            return [];
        }
    });
}
exports.ReadDatabase = ReadDatabase;
function UpdateDatabase(data) {
    try {
        const json = JSON.stringify({ data });
        (0, fs_1.writeFileSync)(path, json, {
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
exports.UpdateDatabase = UpdateDatabase;

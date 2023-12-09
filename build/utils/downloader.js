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
const electron_1 = require("electron");
const fs_1 = require("fs");
const path_1 = require("path");
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const acceptedFileTypes = ["mp3", "ogg", "wav"];
function Download(music, musicURL, mainWindow) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield new Promise((resolve, reject) => {
                if (musicURL.startsWith("http://")) {
                    http_1.default.get(musicURL, (res) => {
                        if (res.statusCode == 200 && !res.errored)
                            resolve(res);
                        else
                            reject(res.errored);
                    });
                }
                else {
                    https_1.default.get(musicURL, (res) => {
                        if (res.statusCode == 200 && !res.errored)
                            resolve(res);
                        else
                            reject(res.errored);
                    });
                }
            });
            const contentType = (_a = res.headers["content-type"]) === null || _a === void 0 ? void 0 : _a.split("/")[1];
            if (!contentType || !acceptedFileTypes.includes(contentType)) {
                electron_1.dialog.showMessageBox(mainWindow, {
                    title: "Download falhado!",
                    message: `O tipo de arquivo (${contentType}) retornado pelo servidor não é suportado pelo programa!`,
                    type: "error"
                });
                return null;
            }
            const path = (0, path_1.join)(electron_1.app.getPath("appData"), `/ToListen/library/${music.name}.${contentType}`);
            const fileStream = (0, fs_1.createWriteStream)(path);
            res.pipe(fileStream);
            return path;
        }
        catch (err) {
            electron_1.dialog.showMessageBox(mainWindow, {
                title: "Download falhado!",
                message: "Ocorreu erro durante o download da música, verifique o URL e tente novamente!",
                type: "error"
            });
            return null;
        }
    });
}
exports.default = Download;

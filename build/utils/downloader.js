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
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs_1 = require("fs");
const http_1 = require("http");
const path_1 = require("path");
const acceptedFileTypes = ["mp3", "mp4"];
function Download(music, mediaURL) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield new Promise(resolve => {
            (0, http_1.get)(mediaURL, (response) => {
                console.log(response.statusMessage);
                resolve(response.statusCode == 200 ? response : null);
            });
        });
        if (res != null) {
            const fileType = (_a = res.headers["content-type"]) === null || _a === void 0 ? void 0 : _a.split("/")[1];
            if (!fileType || acceptedFileTypes.includes(fileType)) {
                console.log(fileType);
                return null;
            }
            const path = (0, path_1.join)(electron_1.app.getPath("appData"), `ToListen/library/${music.name}.${fileType}`);
            const fileStream = (0, fs_1.createWriteStream)(path);
            res.pipe(fileStream);
            return path;
        }
        else {
            electron_1.dialog.showMessageBoxSync(electron_1.BrowserWindow.getAllWindows()[0], {
                title: "Download falhado!",
                message: "Ocorreu erro durante o download de uma ou mais músicas, verifique o URL e tente novamente!",
                type: "error"
            });
            return null;
        }
    });
}
exports.default = Download;

const builder = require("electron-builder");

builder.build({
    config: {
        compression: "normal",
        removePackageScripts: true,
        removePackageKeywords: true,
        icon: "public/icons/icon.ico",
        productName: "ToListen",
        executableName: "ToListen",
        appId: "ToListen",

        directories: {
            output: "dist/",
            buildResources: "public/icons"
        },
        files: [
            "build/",
            "public/"
        ],

        win: {
            target: "nsis"
        },
        nsis: {
            packElevateHelper: false,
            createDesktopShortcut: true,
            createStartMenuShortcut: true,
            deleteAppDataOnUninstall: true,
            artifactName: "ToListen-Setup-${buildVersion}.${ext}",
            shortcutName: "ToListen",
            installerIcon: "public/icons/icon.ico",
            installerHeaderIcon: "public/icons/icon.ico",
            language: "0x0416",
            uninstallerIcon: "public/icons/icon.ico",
            uninstallDisplayName: "ToListen"
        }
    }
});
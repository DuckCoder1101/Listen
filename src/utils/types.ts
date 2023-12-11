export type Music = {
    id: number;
    name: string;
    author: string;
    path: string;
};

export type ModalCreateMusicResponse = {
    isFromDownload: boolean;
    isAChange: boolean;
    musics: Music[];
};

export type AppOption = {
    id: number;
    description: string;
    value: boolean;
}
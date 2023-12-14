var musics = [];
var menuMusicId = null;
var playingMusicId = null;
var isUserChangingTime = false;
var isInLoop = false;

const PlayButtonClicked = (ev) => {
    const musicId = ev.currentTarget.getAttribute("data-music-id");

    if (playingMusicId == musicId)  PauseMusic();
    else PlayMusic(musicId);
};

const PlayMusic = async (musicId) => {
    const playingMusicImage = document.querySelector("#playing-music-image");
    const playingMusicName = document.querySelector("#playing-music-name");
    const volumeInput = document.querySelector("#volume-input");
    const timeInput = document.querySelector("#time-input");

    const music = await musics[musicId];
    if (!music) return;

    if (playingMusicId != null) {
        const oldMusicBtn = document.querySelector(`[data-music-id="${playingMusicId}"]`);

        ChangePlayIcon(false, oldMusicBtn);
        RemoveAllAudio();
    }

    playingMusicId = musicId;
    ChangePlayIcon(true, document.querySelector(`[data-music-id="${musicId}"]`));

    try {
        const audio = document.body.appendChild(new Audio(music.path));
        audio.volume = volumeInput.value;
        
        await audio.play();
    
        audio.addEventListener("ended", () => {
            if (!isInLoop) {
                const index = musicId +1 < musics.length ? musicId +1 : 0;    
                PlayMusic(musics[index].id);
            } else {
                audio.currentTime = 0;
                audio.play();
            }
        });
    
        playingMusicImage.setAttribute("src", "");
        playingMusicName.innerHTML = music.name;
    
        timeInput.setAttribute("max", audio.duration);
        timeInput.removeAttribute("disabled");
    } catch {
        PauseMusic();
    }
    
    // window.api.send("play-music", musicId);
};

const PauseMusic = () => {
    const playingMusicImage = document.querySelector("#playing-music-image");
    const playingMusicName = document.querySelector("#playing-music-name");
    const timeInput = document.querySelector("#time-input");

    RemoveAllAudio();
    ChangePlayIcon(false, document.querySelector(`[data-music-id="${playingMusicId}"]`));

    playingMusicId = null; 

    playingMusicImage.setAttribute("src", "");
    playingMusicName.innerHTML = "Sem música";

    timeInput.value = 0;
    timeInput.setAttribute("max", 0);
    timeInput.setAttribute("disabled", true);
 
    // window.api.send("pause-music");
};

const RemoveAllAudio = () => {
    for (const el of document.querySelectorAll("audio")) {
        el.pause();
        el.remove();
    }
};

const ChangePlayIcon = (pause, element) => {
    if (element == null) return;

    const icon = element.querySelector("i");

    icon.classList.remove(pause ? "bx-play-circle" : "bx-pause-circle");
    icon.classList.add(pause ? "bx-pause-circle" : "bx-play-circle");
};

const Update = () => {
    if (playingMusicId != null && !isUserChangingTime) {
        const audio = document.querySelector("audio");
        const timeInput = document.querySelector("#time-input");

        if (audio != null) {
            timeInput.value = audio.currentTime;
        } else {
            PauseMusic();
        }
    }
};

const ShowOptions = (ev, musicId) => {
    if (ev.button == 2) {
        const musicOptions = document.querySelector("#music-options");
        const x = ev.clientX -5;
        const y = ev.clientY -5;
    
        musicOptions.style.left = `${x}px`;
        musicOptions.style.top = `${y}px`;
    
        musicOptions.classList.remove("d-none");
        menuMusicId = musicId;
    }
};

const HideOptions = () => {
    const musicOptions = document.querySelector("#music-options");
    
    musicOptions.classList.add("d-none");
    menuMusicId = null;
};

async function main() {
    const addMusicsFromFiles = document.querySelector("#add-musics-from-files");
    const addMusicFromURL = document.querySelector("#add-music-from-url");

    const volumeInput = document.querySelector("#volume-input");
    const volumeIcon = document.querySelector("#volume-icon");
    const timeInput = document.querySelector("#time-input");
    const musicLoop = document.querySelector("#music-loop");

    const openOptionsBtn = document.querySelector("#open-options");
    const musicURLInput = document.querySelector("#music-url");
    const backupBtn = document.querySelector("#backup");
    
    const musicsList = document.querySelector("#musics-list");
    
    const musicOptions = document.querySelector("#music-options");
    const deleteMusic = document.querySelector("#delete-music");
    const alterMusic = document.querySelector("#alter-music");
    
    addMusicFromURL.addEventListener("click", () => {
        window.api.send("add-music-from-url", musicURLInput.value);
        musicURLInput.value = "";
    });

    addMusicsFromFiles.addEventListener("click", () => {
        window.api.send("add-musics-from-files");
    });

    volumeInput.addEventListener("change", (ev) => {
        const volume = ev.currentTarget.value;
        const audio = document.querySelector("audio");

        if (audio != null) {
            audio.volume = volume;
        }

        volumeIcon.classList.remove("bx-volume-full", "bx-volume-low", "bx-volume-mute");
        volumeIcon.classList.add(
            volume == 0 ? "bx-volume-mute" :
            volume <= .45 ? "bx-volume-low" :
            "bx-volume-full"
        );
    });

    timeInput.addEventListener("change", (ev) => {
        if (playingMusicId != null) {
            const audio = document.querySelector("audio");
            audio.currentTime = ev.currentTarget.value;
        }
    });

    timeInput.addEventListener("mouseenter", (ev) => {
        isUserChangingTime = true;
    });

    timeInput.addEventListener("mouseleave", (ev) => {
        isUserChangingTime = false;
    });

    backupBtn.addEventListener("click", () => {
        const playingMusicImage = document.querySelector("#playing-music-image");
        const playingMusicName = document.querySelector("#playing-music-name");
        const timeInput = document.querySelector("#time-input");

        RemoveAllAudio();
        playingMusicId = null; 
    
        playingMusicImage.setAttribute("src", "");
        playingMusicName.innerHTML = "Sem música";
    
        timeInput.value = 0;
        timeInput.setAttribute("max", 0);
        timeInput.setAttribute("disabled", true);

        window.api.send("backup");
    });

    musicOptions.addEventListener("mouseleave", () => {
        HideOptions();
    });

    deleteMusic.addEventListener("click", () => {
        if (menuMusicId != null) {
            if (playingMusicId == menuMusicId) {
                PauseMusic();
            }

            window.api.send("delete-music", menuMusicId);
            HideOptions();
        }
    });

    alterMusic.addEventListener("click", () => {
        if (menuMusicId != null) {
            window.api.send("alter-music", menuMusicId);
            HideOptions();
        }
    });

    musicLoop.addEventListener("click", () => {
        isInLoop = !isInLoop;

        if (isInLoop) {
            musicLoop.classList.add("active");
        } else {
            musicLoop.classList.remove("active");
        }
    });

    openOptionsBtn.addEventListener("click", () => {
        window.api.send("open-options-modal");
    });

    window.api.receive("update-musics-list", (ev, newMusics) => {
        musics = newMusics;
        let html = ``;

        for (const music of musics) {
            html += `
            <li class="list-group-item mb-1 d-flex justify-content-center align-items-center" onmousedown="ShowOptions(event, ${music.id})">
                <img class="ms-2 me-3 img-fluid rounded-circle bg-secondary" width="45px" height="45px" style="max-width: 5%;" />

                <div class="text-break">
                    <b class="me-2">${music.name}</b> <br />
                    ${music.author}
                </div>

                <div class="flex-fill">
                    <button class="play-button p-2 badge bg-primary rounded-circle border-0 float-end" data-music-id="${music.id}" onclick="PlayButtonClicked(event)">
                        <i class='bx bx-play-circle'></i>
                    </button>
                </div>
            </li>
            `;
        }

        musicsList.innerHTML = html;
    });

    window.api.receive("pause-music", (ev) => {
        if (playingMusicId != null) {
            RemoveAllAudio();
            ChangePlayIcon(
                false, 
                document.querySelector(`[data-music-id="${playingMusicId}"]`)
            );
        }
    });

    window.api.receive("play-library", () => {  
        PlayMusic(0);
    });

    window.api.receive("restart-music", () => {
        if (playingMusicId != null) {
            PlayMusic(playingMusicId);
        }
    });

    window.api.receive("set-music-loop", (ev, loop) => {
        isInLoop = loop;
    });

    window.addEventListener("keydown", (ev) => {
        if (ev.code == "Space" && playingMusicId != null) {
            PauseMusic();
        }
    });
    
    setInterval(() => Update(), 100);
};

window.onload = main;
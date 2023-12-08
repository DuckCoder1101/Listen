const musics = [];
var currentMusic = 0;
var isFromDownload = false;
var isAChange = false;

async function main() {
    const previousMusicBtn = document.querySelector("#previous-music");
    const nextMusicBtn = document.querySelector("#next-music");
    const formData = document.querySelector("#form-data");

    const ChangeCurrentMusic = () => {
        formData.innerHTML = `
            <div class='mb-1'>
                <label class='form-label'>Caminho</label>
                <input class='form-control' type='text' id='path' name='path' value='${musics[currentMusic].path}' readonly />
            </div>

            <div class='mb-1'>
                <label class='form-label'>Nome</label>
                <input class='form-control' type='text' id='music-name' value='${musics[currentMusic].name}' name='nome' required />
            </div>

            <div class='mb-1'>
                <label class='form-label'>Autor</label>
                <input class='form-control' type='text' id='music-author' value='${musics[currentMusic].author}' name='author' required />
            </div>
        `;
    }

    window.api.receive("(modal)-musics", (ev, info) => {
        isFromDownload = info.isFromDownload;
        isAChange = info.isAChange;

        for (const music of info.defaultInfo) {
            musics.push(music);
        }

        if (info.defaultInfo.length == 1) {
            nextMusicBtn.innerHTML = "Salvar";
        }

        ChangeCurrentMusic();
    });

    previousMusicBtn.addEventListener("click", () => {
        currentMusic = currentMusic > 0 ? currentMusic -1 : 0;
        ChangeCurrentMusic();

        nextMusicBtn.innerHTML = "Próxima";
        previousMusicBtn.setAttribute("disabled", currentMusic == 0);
    });

    nextMusicBtn.addEventListener("click", () => {
        const name = document.querySelector("#music-name").value;
        const author = document.querySelector("#music-author").value;

        if (!name || !author) return;

        musics[currentMusic].name = name;
        musics[currentMusic].author = author;

        if (currentMusic < musics.length -1) {
            currentMusic++;
            ChangeCurrentMusic();

            nextMusicBtn.innerHTML = currentMusic == musics.length -1 ? "Salvar" : "Próxima";
            previousMusicBtn.setAttribute("disabled", false);
        } else {
            if (isAChange) {
                window.api.send("(modal)-alter-music", musics[0])
            } else {
                window.api.send("(modal)-create-musics", {
                    musics,
                    isFromDownload
                });
            }
        }
    });
}

window.onload = main;
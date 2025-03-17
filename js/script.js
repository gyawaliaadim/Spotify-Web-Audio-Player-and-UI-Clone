let currFolder;
async function getAudioDuration(path) {
    return new Promise((resolve) => {
        const audio = new Audio(path);
        audio.addEventListener('loadedmetadata', () => {
            resolve(audio.duration);
        });
    });
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
async function getCover(songListForCover, folder) {
    let checkCover = false;
    let cover = '';
    for (let index = 0; index < songListForCover.length; index++) {
        const element = songListForCover[index];
        if (element == "cover.jpg") {
            checkCover = true;
            break;
        }
    }
    if (checkCover) {
        return `albums/${folder}/cover.jpg`;
    } else {
        return '/assets/svgs/playlist.svg';
    }
}

async function fetchData(path) {
    let rawFolderData = await (await fetch(path)).text();
    let folderData = document.createElement("div");
    folderData.innerHTML = rawFolderData;
    let anchors = folderData.getElementsByTagName("a");
    let folderNames = Array.from(anchors)
        .map(anchor => anchor.innerHTML)
        .filter(name => name !== '.htaccess');

    return folderNames;
}

class Spotify {
    constructor() {
        this.index = 0;
        this.currSongList = [];
        this.currSong = new Audio();
        this.shuffleSVG = document.querySelector("#shuffle");
        this.previous = document.querySelector("#previous");
        this.play = document.querySelector("#play");
        this.next = document.querySelector("#next");
        this.repeatSVG = document.querySelector("#repeat");
        this.repeatToggle = null;
        this.shuffleToggle = null;
    }

    async playSong(path) {
        if (path !== null) {
            // Extract the folder name from the path
            const pathSegments = path.split('/');
            const folderName = pathSegments[pathSegments.length - 2];

            // Extract the artist (group) from the folder name
            const artist = folderName.split(' - ')[0];
            this.group = artist;
            // Extract the song title from the file name
            const fileName = pathSegments[pathSegments.length - 1];
            const songTitle = fileName.replace(/\.mp3$/i, '');
            this.currSongName = songTitle;
            this.currSongPath = path;
            document.querySelector(".songNameWidget").innerText = program.currSongName;

            document.querySelector(".songArtistWidget").innerText = program.group;
            document.querySelector(".nowPlayingSong").getElementsByTagName("img")[0].style.display = "inline";
            document.querySelector("#dot").innerText = "•";
            document.querySelector(".nowPlayingSong").getElementsByTagName("img")[0].src = program.cover;
            program.currSong.src = path;
            program.currSong.play();
            program.play.src = program.play.src.replace("play.svg", "pause.svg")
            program.currSong.play();

        }
    }

    pauseSong() {
        if (program.currSong.paused) {
            program.play.src = program.play.src.replace("play.svg", "pause.svg")
            program.currSong.play();

        } else {
            program.play.src = program.play.src.replace("pause.svg", "play.svg")
            program.currSong.pause();

        }
    }

    repeatSong() {
        if (program.repeatToggle) {
            program.repeatToggle = false;
            program.repeatSVG.src = program.repeatSVG.src.replace("repeatTrue.svg", "repeat.svg");
            // console.log("hello")
        }
        else {
            program.repeatToggle = true;
            program.repeatSVG.src = program.repeatSVG.src.replace("repeat.svg", "repeatTrue.svg")
            // console.log("bye")
        }
        // Implementation for repeat method
    }
    previousSong() {
        let list = program.currSongList;
        if (program.shuffleToggle) {
            list = shuffle(list);
        }

        let index = list.indexOf(program.currSongPath)
        if ((index - 1) >= 0) {
            program.playSong(list[index - 1])
        }
    }
    nextSong() {

        let list = program.currSongList;
        if (program.shuffleToggle) {
            list = shuffle(list);
        }

        let index = list.indexOf(program.currSongPath)
        if ((index + 1) >= 0) {
            program.playSong(list[index + 1])
        }
    }
    shuffleSong() {
        if (program.shuffleToggle) {
            program.shuffleToggle = false;
            program.shuffleSVG.src = program.shuffleSVG.src.replace("shuffleTrue.svg", "shuffle.svg");
        }
        else {
            program.shuffleToggle = true;
            program.shuffleSVG.src = program.shuffleSVG.src.replace("shuffle.svg", "shuffleTrue.svg");
        }
    }

    async folder(folderName = false, songList, cover) {
        this.currSongList = [];
        this.cover = cover;
        let artistInfo = document.querySelector(".artistInfo");

        if (!folderName) {
            let divs = artistInfo.getElementsByTagName("div");
            artistInfo.innerHTML = `<div style="display:flex; width:100%; height:100%; 
            justify-content:center; align-items:center; color:white; font-size:2rem;">
                Select a Folder
            </div>`;
        }
        else {
            this.currFolder = folderName;
            this.currFolderPath = `/albums/${program.currFolder}/`;
            // console.log(program.currFolderPath)
            let folder = document.getElementById(`${folderName}`).querySelector("#artistPlay");
            folder.src = "/assets/svgs/arrowRightGreen.svg";
            let clickedName = folderName.split(" - ")[0];
            let clickedGroup = folderName.split(" - ")[1];
            let songListForCover = await fetchData(`albums/${folderName}`);
            // console.log(songListForCover)
            cover = await getCover(songListForCover, folderName);
            let tr = ``;
            for (let index = 0; index < songList.length; index++) {

                const element = songList[index];
                let songTitle = element[1].replace(/\.mp3$/i, '');
                this.currSongList.push(program.currFolderPath + songTitle + ".mp3");
                const durationInSeconds = await getAudioDuration(program.currFolderPath + songTitle + ".mp3");
                const formattedDuration = secondsToMinutesSeconds(durationInSeconds);
                tr += `
                <tr class="songRow">
                    <td id="songIndex">${element[0]}</td>
                    <td>${songTitle}</td>
                    <td>${formattedDuration}</td>
                </tr>
                `;
            }

            artistInfo.innerHTML = `
            <div class="header">
                <div class="coverOut">
                    <img src="${cover}" alt="">
                </div>
                <div class="infoOut">
                    <h1>${clickedName}</h1>
                    <h2>${clickedGroup}</h2>
                </div>
            </div>
            <div class="songsList">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tr}
                    </tbody>
                </table>
            </div>
            `;

            this.group = (program.currFolder.split(" - ")[0])
            let songElements = Array.from(document.querySelectorAll(".songRow"));
            songElements.forEach(e => {
                e.addEventListener("click", async element => {
                    element.stopPropagation();
                    this.currSongName = e.querySelectorAll('td')[1].innerText;
                    this.currSongPath = `${this.currFolderPath}${this.currSongName}.mp3`;
                    // this.currGroup=program.currFolder

                    // this.songsPlayed.push(program.currSongPath);
                    // this.index += 1;
                    program.playSong(program.currSongPath, "play");
                    // console.log(program.currSongPath)
                });
            });
        }
    }

    async displayData() {
        let folderNames = await fetchData("albums/");
        // console.log(folderNames)
        let library = document.querySelector(".albumsLibrary");
        for (let index = 0; index < folderNames.length; index++) {
            if (index == 0) {
                continue;
            }
            let folder = folderNames[index];
            folder = folder.replace("/", "");
            let folderName = folder.split(" - ")[0];
            let songListForCover = await fetchData(`albums/${folder}`);
            let group = folder.split(" - ")[1];
            let cover = await getCover(songListForCover, folder);

            library.innerHTML += `
            <div class="albumIn" id="${folder}">
                <div id="coverIn">
                    <img id="cover" src="${cover}" 
                    onerror="this.onerror=null; this.src='/assets/svgs/playlist.svg';" 
                    alt="Cover Image">
                </div>
                <div class="infoIn">
                    <div id="folderName" style="display:none;">${folder}</div>
                    <div class="artistNameIn">
                        <h2>${folderName}</h2>
                    </div>
                    <div class="detailsIn">
                        ${group}
                    </div>
                </div>
                <img id="artistPlay" src="/assets/svgs/arrowRight.svg" alt="">
            </div>
            `;
        }
    }

    async main() {
        await program.folder(null);
        await program.displayData();
        let i = 0;
        let albumElements = Array.from(document.querySelector(".albumsLibrary").querySelectorAll(".albumIn"));
        let folderClick;
        albumElements.forEach(e => {
            e.addEventListener("click", async element => {
                element.stopPropagation();
                i = i + 1;
                if (i > 1) {
                    let folderImg = document.getElementById(`${folderClick}`).querySelector("#artistPlay");
                    folderImg.src = "/assets/svgs/arrowRight.svg";
                }
                folderClick = (element.currentTarget.querySelector("#folderName").innerText);
                // console.log(folderClick)
                let cover = e.querySelector("#cover").src;
                let rawSongList1 = await fetchData(`albums/${folderClick}`);
                let rawSongList2 = [];
                let songList = [];
                for (let index = 1; index < rawSongList1.length; index++) {
                    const element = rawSongList1[index];
                    if (element.toLowerCase().includes(".mp3")) {
                        rawSongList2.push(element);
                    }
                }
                for (let index = 0; index < rawSongList2.length; index++) {
                    const element = rawSongList2[index];
                    songList.push([index + 1, element]);
                }
                program.folder(folderClick, songList, cover);

                // console.log(folderClick,songList)
            });
        });
        // Select the seek bar
        const seekBar = document.querySelector("#timeControl");

        // When song metadata loads, set max value of seek bar
        program.currSong.addEventListener("loadedmetadata", () => {
            seekBar.max = program.currSong.duration;
        });

        // Update the seek bar as the song plays
        program.currSong.addEventListener("timeupdate", () => {
            document.querySelector("#currentTime").innerText = `${secondsToMinutesSeconds(program.currSong.currentTime)}`;
            document.querySelector("#remainingTime").innerText = `${secondsToMinutesSeconds(program.currSong.duration)}`;
            // Update seek bar position
            seekBar.value = program.currSong.currentTime;
        });

        program.currSong.addEventListener("ended", () => {
            if (program.repeatToggle) {
                program.currSong.currentTime = 0;
                program.currSong.play();
            }
            else {
                program.nextSong();
            }
        });

        // Allow user to seek by dragging the range input
        seekBar.addEventListener("input", () => {
            program.currSong.currentTime = seekBar.value;
        });


        document.querySelector(".volumeControl > img").addEventListener("click", e => {
            if (e.target.src.includes("unmute.svg")) {
                e.target.src = e.target.src.replace("unmute.svg", "mute.svg")
                program.currSong.volume = 0;
                document.querySelector(".volumeControl").getElementsByTagName("input")[0].value = 0;
            }
            else {
                e.target.src = e.target.src.replace("mute.svg", "unmute.svg")
                program.currSong.volume = .10;
                document.querySelector(".volumeControl").getElementsByTagName("input")[0].value = 10;
            }

        })
        const volumeBar = document.querySelector("#volume");

        // Update volume on input change
        volumeBar.addEventListener("input", () => {
            program.currSong.volume = volumeBar.value / 100;  // Convert to 0-1 range
        });
        program.repeatSVG.addEventListener("click", () => {
            program.repeatSong();
        });

        program.shuffleSVG.addEventListener("click", () => {
            program.shuffleSong();
        })
        program.play.addEventListener("click", () => {
            program.pauseSong();

        })
        program.previous.addEventListener("click", () => {
            // program.pauseSong()
            // currSong.pause()
            // console.log("Previous clicked")
            program.previousSong();
        })

        // Add an event listener to next
        program.next.addEventListener("click", () => {
            // program.pauseSong()
            program.nextSong();

        })

    }
}

let program = new Spotify();
program.main();

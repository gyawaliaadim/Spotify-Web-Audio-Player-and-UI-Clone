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
        return `/albums/${folder}/cover.jpg`;
    } else {
        return '/assets/svgs/playlist.svg';
    }
}

async function fetchData(path) {
    console.log("Hello")
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
    async playSong(path) {
        if (path !== null) {
            const pathSegments = path.split('/');
            const folderName = pathSegments[pathSegments.length - 2];
            const artist = folderName.split(' - ')[0];
            this.group = artist;
            const fileName = pathSegments[pathSegments.length - 1];
            const songTitle = fileName.replace(/\.mp3$/i, '');
            this.currSongName = songTitle;
            this.currSongPath = path;
            document.querySelector(".songNameWidget").innerText = program.currSongName;
            document.querySelector(".songArtistWidget").innerText = program.group;
            document.querySelector(".nowPlayingSong").getElementsByTagName("img")[0].style.display = "inline";
            document.querySelector("#dot").innerText = "•";
            document.querySelector(".nowPlayingSong").getElementsByTagName("img")[0].src = program.cover;
            program.currSong.src = `${path}`;
            program.currSong.play();
            program.play.src = program.play.src.replace("play.svg", "pause.svg");
            program.currSong.play();
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
        } else {
            this.currFolder = folderName;
            this.currFolderPath = `/${program.currFolder}/`;
            let folder = document.getElementById(`${folderName}`).querySelector("#artistPlay");
            folder.src = "/assets/svgs/arrowRightGreen.svg";
            let clickedName = folderName.split(" - ")[0];
            let clickedGroup = folderName.split(" - ")[1];
            let songListForCover = await fetchData(`/${folderName}/`);
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

            this.group = (program.currFolder.split(" - ")[0]);
            let songElements = Array.from(document.querySelectorAll(".songRow"));
            songElements.forEach(e => {
                e.addEventListener("click", async element => {
                    element.stopPropagation();
                    this.currSongName = e.querySelectorAll('td')[1].innerText;
                    this.currSongPath = `${this.currFolderPath}${this.currSongName}.mp3`;
                    program.playSong(program.currSongPath, "play");
                });
            });
        }
    }

    async displayData() {
        let folderNames = await fetchData("/albums/");
        let library = document.querySelector(".albumsLibrary");
        for (let index = 0; index < folderNames.length; index++) {
            if (index == 0) {
                continue;
            }
            let folder = folderNames[index];
            folder = folder.replace("/", "");
            let folderName = folder.split(" - ")[0];
            let songListForCover = await fetchData(`/albums/${folder}/`);
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
}




main();
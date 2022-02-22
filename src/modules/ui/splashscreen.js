import boat from "../../assets/boat.svg";

function createSplashScreen() {
    const splashScreen = document.createElement("div");
    splashScreen.id = "splash-screen";
    splashScreen.classList.add("splash-screen");

    const splashTitle = document.createElement("p");
    splashTitle.id = "splash-title";
    splashTitle.classList.add("splash-title");
    splashTitle.textContent = "BATTLESHIP";

    const playBtn = document.createElement("button");
    playBtn.id = "play-btn";
    playBtn.classList.add("play-btn");
    playBtn.disabled = true;
    playBtn.onclick = removeSplashScreen;
    playBtn.addEventListener("animationend", () => {
        playBtn.disabled = false;
    });

    const boatImg = new Image();
    boatImg.src = boat;
    boatImg.alt = "Boat";

    playBtn.appendChild(boatImg);

    splashScreen.append(splashTitle, playBtn);
    return splashScreen;
}

function removeSplashScreen() {
    const splashScreen = document.getElementById("splash-screen");
    splashScreen.classList.add("animate-remove");
    splashScreen.addEventListener("animationend", () => {
        splashScreen.remove();
    });
}

export { removeSplashScreen, createSplashScreen };
export default { removeSplashScreen, createSplashScreen };

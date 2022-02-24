// Module imports
import { createPlayer } from "./modules/factories/player";
import { createMainMenu } from "./modules/ui/mainMenu/mainMenu";
import { renderSetupPhaseFor } from "./modules/ui/setupPhase/setupPhase";
import { createSplashScreen } from "./modules/ui/splashscreen";

// Asset imports
import "./styles.css";

// const body = document.querySelector("body");
// body.appendChild(createSplashScreen());

const mainMenu = createMainMenu();
const main = document.getElementById("main");
main.append(mainMenu);

const gameTitle = document.getElementById("game-title");
gameTitle.onclick = () => {
    const mainMenu = createMainMenu();
    const main = document.getElementById("main");
    main.innerHTML = "";
    main.append(mainMenu);
};

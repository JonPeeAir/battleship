// Module imports
import { createPlayer } from "./modules/factories/player";
import { createFleetUI } from "./modules/ui/setupPhase/components/fleetUi";
import { createGameboardUI } from "./modules/ui/setupPhase/components/gameboardUI";
import { createGameButtons } from "./modules/ui/setupPhase/components/gameButtons";

// Asset imports
import "./styles.css";

const p1 = createPlayer("p1");
const fleetUI = createFleetUI(p1.fleet);
const gameboardUI = createGameboardUI(p1.gameboard);
const gameButtons = createGameButtons();

const gameContent = document.getElementById("game-content");
gameContent.player = p1;
gameContent.appendChild(fleetUI);
gameContent.appendChild(gameboardUI);

const main = document.getElementById("main");
main.appendChild(gameButtons);

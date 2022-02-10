// Module imports
import { createPlayer } from "./modules/factories/player";
import { createFleetUI } from "./modules/ui/setupPhase/components/fleetUi";
import { createGameboardUI } from "./modules/ui/setupPhase/components/gameboardUI";

// Asset imports
import "./styles.css";

const p1 = createPlayer("p1");
const gameboardUI = createGameboardUI(p1.gameboard);
const fleetUI = createFleetUI(p1.fleet);

const gameContent = document.getElementById("game-content");
gameContent.appendChild(fleetUI);
gameContent.appendChild(gameboardUI);

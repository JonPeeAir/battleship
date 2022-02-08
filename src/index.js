import { createGameboard } from "./modules/factories/gameboard";
import { createPlayer } from "./modules/factories/player";
import { createShip } from "./modules/factories/ship";
import { createFleetUI } from "./modules/ui/setupPhase/components/fleetUi";
import { createGameboardUI } from "./modules/ui/setupPhase/components/gameboardUI";
import "./styles.css";

// import setupDragAndDrop from "./modules/ui/utils/drag";

// setupDragAndDrop();

const p1 = createPlayer("p1");
const gameboardUI = createGameboardUI(p1.gameboard);
const fleetUI = createFleetUI(p1.fleet);

const gameContent = document.getElementById("game-content");
gameContent.appendChild(fleetUI);
gameContent.appendChild(gameboardUI);

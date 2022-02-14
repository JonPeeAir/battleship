// Module imports
import { createPlayer } from "./modules/factories/player";
import { renderGamePhaseFor } from "./modules/ui/gamePhase/gamePhase";
import { renderSetupPhaseFor } from "./modules/ui/setupPhase/setupPhase";

// Asset imports
import "./styles.css";

const main = document.getElementById("main");

// const p1 = createPlayer("p1");
// const setupPhase = renderSetupPhaseFor(p1);
// main.appendChild(setupPhase);

const p1 = createPlayer("p1");
p1.gameboard.randomize(p1.fleet);

const p2 = createPlayer("p2");
p2.gameboard.randomize(p2.fleet);

const gamePhase = renderGamePhaseFor(p1, p2);
main.appendChild(gamePhase);

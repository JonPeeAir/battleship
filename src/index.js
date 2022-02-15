// Module imports
import { createPlayer } from "./modules/factories/player";
import { renderSetupPhaseFor } from "./modules/ui/setupPhase/setupPhase";

// Asset imports
import "./styles.css";

const p1 = createPlayer("p1");
const setupPhase = renderSetupPhaseFor(p1);

const main = document.getElementById("main");
main.appendChild(setupPhase);

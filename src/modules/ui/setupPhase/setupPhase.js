import { createBot } from "../../factories/bot";
import { createFleetUI } from "./components/fleetUI";
import { createGameboardUI } from "./components/gameboardUI";
import { createGameButtons } from "./components/gameButtons";

function renderSetupPhaseFor(p1, p2) {
    const setupPhase = document.createElement("div");
    setupPhase.id = "setup-phase";
    setupPhase.classList.add("setup-phase");
    setupPhase.players = { p1, p2 };

    const fleetUI = createFleetUI(p1.fleet);
    const gameboardUI = createGameboardUI(p1.gameboard);
    const gameButtons = createGameButtons();

    const gameContent = document.createElement("div");
    gameContent.id = "game-content";
    gameContent.classList.add("game-content");

    const setupInstructions = document.createElement("p");
    setupInstructions.textContent = `Place Your Ships, ${p1.name}`;
    setupInstructions.classList.add("setup-instructions");

    gameContent.append(setupInstructions, fleetUI, gameboardUI);

    setupPhase.append(gameContent, gameButtons);

    return setupPhase;
}

export { renderSetupPhaseFor };
export default { renderSetupPhaseFor };

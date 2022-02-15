import { createPlayer } from "../../factories/player";
import { createFleetUI } from "./components/fleetUI";
import { createGameboardUI } from "./components/gameboardUI";
import { createGameButtons } from "./components/gameButtons";

function renderSetupPhaseFor(player, enemy = createPlayer("p2")) {
    const setupPhase = document.createElement("div");
    setupPhase.id = "setup-phase";
    setupPhase.classList.add("setup-phase");

    const fleetUI = createFleetUI(player.fleet);
    const gameboardUI = createGameboardUI(player.gameboard);
    const gameButtons = createGameButtons();

    const gameContent = document.createElement("div");
    gameContent.id = "game-content";
    gameContent.classList.add("game-content");
    gameContent.player = player;
    gameContent.enemy = enemy;
    gameContent.append(fleetUI, gameboardUI);

    setupPhase.append(gameContent, gameButtons);

    return setupPhase;
}

export { renderSetupPhaseFor };
export default { renderSetupPhaseFor };

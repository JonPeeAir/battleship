import { createEnemyUI } from "./components/enemyUI";
import { createPlayerUI } from "./components/playerUI";

function renderGamePhaseFor(player, enemy) {
    const gamePhase = document.createElement("div");
    gamePhase.id = "game-phase";
    gamePhase.classList.add("game-phase");

    const gameContent = document.createElement("div");
    gameContent.id = "game-content";
    gameContent.classList.add("game-content");

    const playerUI = createPlayerUI(player);
    enemy.gameboard.randomize(enemy.fleet);
    const enemyUI = createEnemyUI(enemy, player);

    gameContent.append(playerUI, enemyUI);

    const gameDescription = document.createElement("p");
    gameDescription.id = "game-description";
    gameDescription.classList.add("game-description");
    gameDescription.textContent = "It's your turn";

    gamePhase.append(gameContent, gameDescription);

    return gamePhase;
}

export { renderGamePhaseFor };
export default { renderGamePhaseFor };

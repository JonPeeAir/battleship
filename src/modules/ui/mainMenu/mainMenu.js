import { createPlayer } from "../../factories/player";
import { renderSetupPhaseFor } from "../setupPhase/setupPhase";

function createMainMenu() {
    const mainMenu = document.createElement("div");
    mainMenu.id = "main-menu";
    mainMenu.classList.add("main-menu");

    const menuInstructions = document.createElement("p");
    menuInstructions.id = "menu-instructions";
    menuInstructions.classList.add("menu-instructions");
    menuInstructions.textContent = "Choose A Gamemode";

    const localGameContainer = document.createElement("div");
    localGameContainer.id = "local-game-container";
    localGameContainer.classList.add("gamemode-container");

    const localGameBtn = document.createElement("button");
    localGameBtn.id = "local-game-btn";
    localGameBtn.classList.add("menu-btn");
    localGameBtn.innerHTML = `<i class="bi bi-person"></i> <br> ------- <br> <i class="bi bi-person"></i>`;

    const localGameLabel = document.createElement("p");
    localGameLabel.id = "local-game-label";
    localGameLabel.classList.add("mode-label");
    localGameLabel.textContent = "VS. PLAYER";

    localGameContainer.append(localGameBtn, localGameLabel);

    const botGameContainer = document.createElement("div");
    botGameContainer.id = "bot-game-container";
    botGameContainer.classList.add("gamemode-container");

    const botGameBtn = document.createElement("button");
    botGameBtn.id = "bot-game-btn";
    botGameBtn.classList.add("menu-btn");
    botGameBtn.innerHTML = `<i class="bi bi-person"></i> <br> ------- <br> <i class="bi bi-robot"></i>`;
    botGameBtn.onclick = () => {
        const player = createPlayer("player");
        const setupPhase = renderSetupPhaseFor(player);

        const main = document.getElementById("main");
        main.innerHTML = "";
        main.appendChild(setupPhase);
    };

    const botGameLabel = document.createElement("p");
    botGameLabel.id = "bot-game-label";
    botGameLabel.classList.add("mode-label");
    botGameLabel.textContent = "VS. BOT";

    botGameContainer.append(botGameBtn, botGameLabel);

    mainMenu.append(menuInstructions, localGameContainer, botGameContainer);

    return mainMenu;
}

export { createMainMenu };
export default { createMainMenu };

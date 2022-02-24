import { createBot } from "../../../factories/bot";
import { createPlayer } from "../../../factories/player";
import { renderSetupPhaseFor } from "../../setupPhase/setupPhase";

function createPlayerNamePrompt(playerType, playerLabel) {
    const playerNamePrompt = document.createElement("div");
    playerNamePrompt.classList.add("player-name-prompt");

    const label = document.createElement("label");
    label.htmlFor = `${playerLabel}-input`;
    label.textContent = `${playerLabel}`;

    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = "25";
    input.id = `${playerLabel}-input`;
    input.placeholder = playerType === "bot" ? "Optional" : "Enter your name";
    input.required = playerType === "bot" ? false : true;

    playerNamePrompt.append(label, input);

    return playerNamePrompt;
}

function createPlayerNamesPrompt(gamemode) {
    const playerNames = document.createElement("div");
    playerNames.id = "player-names";
    playerNames.classList.add("player-names");

    const instructions = document.createElement("p");
    instructions.id = "name-instructions";
    instructions.classList.add("name-instructions");
    instructions.textContent = "Please Input Your Name(s)";

    const form = document.createElement("form");
    form.autocomplete = "off";

    if (gamemode === "botGame") {
        const playerInput = createPlayerNamePrompt("player", "Your Name");
        const botInput = createPlayerNamePrompt("bot", "Bot's Name?");
        form.append(playerInput, botInput);

        form.onsubmit = e => {
            e.preventDefault();
            const playerName = playerInput.children[1].value;
            const botName = botInput.children[1].value;

            const player = createPlayer(playerName);
            const bot = botName === "" ? createBot() : createBot(botName);

            const main = document.getElementById("main");
            main.innerHTML = "";
            main.appendChild(renderSetupPhaseFor(player, bot));
        };
    } else if (gamemode === "localGame") {
        form.appendChild(createPlayerNamePrompt("player", "Player 1"));
        form.appendChild(createPlayerNamePrompt("player", "Player 2"));
    }

    const submitBtn = document.createElement("input");
    submitBtn.type = "submit";
    submitBtn.value = "Start Game";
    form.appendChild(submitBtn);

    playerNames.append(instructions, form);

    return playerNames;
}

export { createPlayerNamesPrompt };
export default { createPlayerNamesPrompt };

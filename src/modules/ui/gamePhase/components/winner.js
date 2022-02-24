import { createMainMenu } from "../../mainMenu/mainMenu";
import { renderSetupPhaseFor } from "../../setupPhase/setupPhase";

function createWinnerScreen(player, enemy) {
    const winnerContainer = document.createElement("div");
    winnerContainer.id = "winner-container";
    winnerContainer.classList.add("winner-container");

    const winnerScreen = document.createElement("div");
    winnerScreen.id = "winner-screen";
    winnerScreen.classList.add("winner-screen");

    const winnerText = document.createElement("p");
    winnerText.textContent = "Sample Text";
    winnerText.id = "winner-text";
    winnerText.classList.add("winner-text");

    const playAgainBtn = document.createElement("button");
    playAgainBtn.textContent = "Play Again";
    playAgainBtn.id = "play-again-btn";
    playAgainBtn.classList.add("winner-screen-btn");
    playAgainBtn.onclick = () => {
        player.reset();
        enemy.reset();
        enemy.gameboard.randomize(enemy.fleet);
        const main = document.getElementById("main");
        main.innerHTML = "";
        main.appendChild(renderSetupPhaseFor(player, enemy));
    };

    const mainMenuBtn = document.createElement("button");
    mainMenuBtn.textContent = "Main Menu";
    mainMenuBtn.id = "main-menu-btn";
    mainMenuBtn.classList.add("winner-screen-btn");
    mainMenuBtn.onclick = () => {
        const mainMenu = createMainMenu();
        const main = document.getElementById("main");
        main.innerHTML = "";
        main.append(mainMenu);
    };

    winnerScreen.append(winnerText, mainMenuBtn, playAgainBtn);

    winnerContainer.appendChild(winnerScreen);

    return winnerContainer;
}

function displayWinner(winnerName) {
    const winnerText = document.getElementById("winner-text");
    winnerText.textContent = `${winnerName} wins the game!`;

    const winnerContainer = document.getElementById("winner-container");
    winnerContainer.style.visibility = "visible";
    winnerContainer.style.opacity = "1";
}

function hideWinner() {}

export { createWinnerScreen, displayWinner, hideWinner };
export default { createWinnerScreen, displayWinner, hideWinner };

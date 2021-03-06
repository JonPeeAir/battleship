import { createBot } from "../../../factories/bot";
import { displayWinner } from "./winner";

// const bot = createBot();
function makeBotMove(bot) {
    const playerBoardUI = document.getElementById("your-board");
    const player = playerBoardUI.player;

    const moveData = bot.smartAttack(player);
    const row = moveData.row;
    const col = moveData.col;
    const hit = moveData.hit;

    const gameDescription = document.getElementById("game-description");

    const cellContent = playerBoardUI.rows[row].cells[col].children[0];
    if (hit) {
        cellContent.style.backgroundColor = "rgb(237, 142, 142)";
        playerBoardUI.classList.remove("ship-hit", "ship-miss");
        setTimeout(() => {
            playerBoardUI.classList.add("ship-hit");
            gameDescription.textContent = `${bot.name} hits a ship!!`;
        }, 100);
    } else {
        const missIcon = document.createElement("p");
        missIcon.classList.add("miss-icon");
        missIcon.textContent = "·";

        cellContent.appendChild(missIcon);

        playerBoardUI.classList.remove("ship-hit", "ship-miss");
        setTimeout(() => {
            playerBoardUI.classList.add("ship-miss");
            gameDescription.textContent = `${bot.name} misses`;
        }, 100);
    }
}

function performAttack(cell, player, enemy) {
    const gameDescription = document.getElementById("game-description");
    const attackBoard = document.getElementById("opponent-board");

    const hit = player.attack(enemy, cell.row, cell.col);
    if (hit) {
        cell.style.backgroundColor = "rgb(237, 142, 142)";
        gameDescription.textContent = "It's a hit!!";
    } else {
        const missIcon = document.createElement("p");
        missIcon.classList.add("miss-icon");
        missIcon.textContent = "·";

        cell.appendChild(missIcon);

        gameDescription.textContent = "You missed";
    }
    cell.classList.add("isHit");
    attackBoard.style.pointerEvents = "none";
    document
        .querySelectorAll("*")
        .forEach(node => (node.style.cursor = "wait"));

    setTimeout(() => {
        gameDescription.textContent = `${enemy.name} is making a move`;
        setTimeout(() => {
            makeBotMove(enemy);
            setTimeout(() => {
                gameDescription.textContent = "It's your turn";
                attackBoard.style.pointerEvents = "";
                document
                    .querySelectorAll("*")
                    .forEach(node => (node.style.cursor = ""));
            }, 1000);
        }, 1500);
    }, 1000);

    // makeBotMove(enemy);

    if (player.hasLost()) {
        displayWinner(enemy.name);
    } else if (enemy.hasLost()) {
        displayWinner(player.name);
    }
}

function createBoardLabel() {
    const boardLabel = document.createElement("h2");
    boardLabel.classList.add("board-label");
    boardLabel.textContent = "Enemy Waters";

    return boardLabel;
}

function createEnemyBoardUI(enemy, player) {
    // Create playerBoardUI
    const enemyBoardUI = document.createElement("table");
    enemyBoardUI.id = "opponent-board";
    enemyBoardUI.classList.add("gameboard");
    // Attach player object to playerBoardUI
    enemyBoardUI.player = enemy;

    // Create table body for playerBoard
    const tbody = document.createElement("tbody");
    for (let i = 0; i < enemy.gameboard.size; i++) {
        // Create row that will hold cells
        const row = document.createElement("tr");
        for (let j = 0; j < enemy.gameboard.size; j++) {
            // Create cell
            const cell = document.createElement("td");

            // Create cell content
            const cellContent = document.createElement("div");
            cellContent.classList.add("cell-content");
            cellContent.classList.add("target");

            // Make cell content aware of its position in the board
            cellContent.row = i;
            cellContent.col = j;

            cellContent.onclick = () => {
                performAttack(cellContent, player, enemy);
            };

            cell.appendChild(cellContent);
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    }
    enemyBoardUI.appendChild(tbody);

    return enemyBoardUI;
}

function createEnemyUI(enemy, player) {
    const enemyArea = document.createElement("div");
    enemyArea.id = "opponent-area";
    enemyArea.classList.add("player-area");

    enemyArea.append(createBoardLabel(), createEnemyBoardUI(enemy, player));

    return enemyArea;
}

export { createEnemyUI };
export default { createEnemyUI };

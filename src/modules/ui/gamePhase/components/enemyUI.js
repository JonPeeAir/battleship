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

            // Make cell content aware of its position in the board
            cellContent.row = i;
            cellContent.col = j;

            cellContent.onclick = () => {
                const hit = player.attack(enemy, i, j);
                if (hit) {
                    cellContent.style.backgroundColor = "rgba(0, 0, 0, 0.25)";
                } else {
                    cellContent.style.backgroundColor = "rgba(255, 0, 0, 0.25)";
                }

                console.log(enemy.hasLost());
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

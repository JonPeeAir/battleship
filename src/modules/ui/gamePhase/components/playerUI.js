function createBoardCover(size) {
    const boardCover = document.createElement("table");
    boardCover.id = "board-cover";
    boardCover.classList.add("gameboard", "board-cover");

    const tbody = document.createElement("tbody");
    for (let i = 0; i < size; i++) {
        const row = document.createElement("tr");
        for (let j = 0; j < size; j++) {
            const cell = document.createElement("td");
            const cellContent = document.createElement("div");
            cellContent.classList.add("cell-content");
            cell.appendChild(cellContent);
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    }
    boardCover.appendChild(tbody);

    return boardCover;
}

function createBoardLabel() {
    const boardLabel = document.createElement("h2");
    boardLabel.classList.add("board-label");
    boardLabel.textContent = "Your ships ";

    const visibilityIcon = document.createElement("i");
    visibilityIcon.classList.add("bi", "bi-eye-slash");
    visibilityIcon.style.cursor = "pointer";
    visibilityIcon.onclick = () => {
        const boardCover = document.getElementById("board-cover");
        const boardCoverLabel = document.getElementById("board-cover-label");
        if (visibilityIcon.classList.contains("bi-eye")) {
            visibilityIcon.classList.replace("bi-eye", "bi-eye-slash");
            boardCover.style.opacity = "1";
            boardCoverLabel.style.opacity = "1";
        } else {
            visibilityIcon.classList.replace("bi-eye-slash", "bi-eye");
            boardCover.style.opacity = "0";
            boardCoverLabel.style.opacity = "0";
        }
    };

    boardLabel.appendChild(visibilityIcon);

    return boardLabel;
}

function createPlayerBoardUI(player) {
    // Create playerBoardUI
    const playerBoardUI = document.createElement("table");
    playerBoardUI.id = "your-board";
    playerBoardUI.classList.add("gameboard");
    // Attach player object to playerBoardUI
    playerBoardUI.player = player;

    // Create table body for playerBoard
    const tbody = document.createElement("tbody");
    for (let i = 0; i < player.gameboard.size; i++) {
        // Create row that will hold cells
        const row = document.createElement("tr");
        for (let j = 0; j < player.gameboard.size; j++) {
            // Create cell
            const cell = document.createElement("td");

            // Create cell content
            const cellContent = document.createElement("div");
            cellContent.classList.add("cell-content");
            // Make cell content aware of its position in the board
            cellContent.row = i;
            cellContent.col = j;

            cell.appendChild(cellContent);
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    }
    playerBoardUI.appendChild(tbody);

    player.gameboard.ships.forEach(battleship => {
        const coords = battleship.coords;
        coords.forEach(coord => {
            const row = coord[0];
            const col = coord[1];

            const cellContent = playerBoardUI.rows[row].cells[col].children[0];
            cellContent.style.backgroundColor = "rgba(0, 0, 255, 0.25";
        });
    });

    playerBoardUI.appendChild(createBoardCover(player.gameboard.size));

    const boardCoverLabel = document.createElement("p");
    boardCoverLabel.id = "board-cover-label";
    boardCoverLabel.classList.add("board-cover-label");
    boardCoverLabel.innerHTML =
        "Click on the <i class='bi bi-eye-slash'></i> to see your ships";

    playerBoardUI.appendChild(boardCoverLabel);

    return playerBoardUI;
}

function createPlayerUI(player) {
    const playerArea = document.createElement("div");
    playerArea.id = "your-area";
    playerArea.classList.add("player-area");

    playerArea.append(createBoardLabel(), createPlayerBoardUI(player));

    return playerArea;
}

export { createPlayerUI };
export default { createPlayerUI };

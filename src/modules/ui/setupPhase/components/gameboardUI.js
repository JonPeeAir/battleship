// Module imports
import Drag from "../../utils/drag";

function getDomCells() {
    const gameboardUI = document.getElementById("gameboard");
    const domCells = new Array(gameboardUI.rows.length);
    for (let i = 0; i < domCells.length; i++) {
        domCells[i] = new Array(gameboardUI.rows[i].cells.length);
        for (let j = 0; j < domCells[i].length; j++) {
            domCells[i][j] = gameboardUI.rows[i].cells[j].firstChild;
        }
    }
    return domCells;
}

function createGameboardUI(gameboard) {
    // Create gameboardUI
    const gameboardUI = document.createElement("table");
    gameboardUI.id = "gameboard";
    gameboardUI.classList.add("gameboard");
    // Attach gameboard object to gameboardUI
    gameboardUI.gameboard = gameboard;

    // Create table body for gameboard
    const tbody = document.createElement("tbody");
    for (let i = 0; i < gameboard.size; i++) {
        // Create row that will hold cells
        const row = document.createElement("tr");
        for (let j = 0; j < gameboard.size; j++) {
            // Create cell
            const cell = document.createElement("td");

            // Create cell content
            const cellContent = document.createElement("div");
            cellContent.classList.add("cell-content");
            // Make cell content aware of its position in the board
            cellContent.row = i;
            cellContent.col = j;
            // Attach cell content event listeners
            cellContent.addEventListener("dragover", Drag.dragOverHandler);
            cellContent.addEventListener("dragleave", Drag.dragLeaveHandler);
            cellContent.addEventListener("drop", Drag.dropHandler);

            cell.appendChild(cellContent);
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    }
    gameboardUI.appendChild(tbody);

    return gameboardUI;
}

export { createGameboardUI, getDomCells };
export default { createGameboardUI, getDomCells };

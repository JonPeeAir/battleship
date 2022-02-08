import Drag from "../../utils/drag";

function createGameboardUI(gameboard) {
    const gameboardUI = document.createElement("table");
    gameboardUI.id = "gameboard";
    gameboardUI.classList.add("gameboard");

    const tbody = document.createElement("tbody");
    for (let i = 0; i < gameboard.size; i++) {
        const row = document.createElement("tr");

        for (let j = 0; j < gameboard.size; j++) {
            const cell = document.createElement("td");

            const cellContent = document.createElement("div");
            cellContent.row = i;
            cellContent.col = j;
            cellContent.classList.add("cell-content");
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

export { createGameboardUI };
export default { createGameboardUI };

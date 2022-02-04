const BOARD_SIZE = 10;

// Store table cells into a 2D array
const domTable = document.getElementById("gameboard").children[0];
const domCells = new Array(domTable.rows.length);
for (let i = 0; i < domCells.length; i++) {
    domCells[i] = new Array(domTable.rows[i].cells.length);
    for (let j = 0; j < domCells[i].length; j++) {
        domCells[i][j] = domTable.rows[i].cells[j];
    }
}

// This is a global because we are only able to access this once; during its mouse down event
// And the other functions need to know the dragged ship part index
let draggedShipPartIdx;

// To be put on ship parts
function mouseDownHandler(event) {
    const ship = event.target.parentElement;
    draggedShipPartIdx = Array.from(ship.children).indexOf(event.target);
}

// To be put on ships
function dragStartHandler(event) {
    const shipData = {
        id: event.target.id,
        length: event.target.dataset.length,
    };
    event.dataTransfer.setData("text/plain", JSON.stringify(shipData));
}

// To be put on ships
function onClickHandler(event) {
    const ship = event.target.parentElement;
    if (ship.parentElement.tagName === "TD") {
        ship.classList.toggle("vertical-ship");
    }
}

// To be put on cells
function dragOverHandler(event) {
    event.preventDefault();

    // Get info about the dragged ship
    const shipData = JSON.parse(event.dataTransfer.getData("text/plain"));
    const shipId = shipData.id;
    const shipLength = Number(shipData.length);
    const ship = document.getElementById(shipId);
    const shipIsVertical = ship.classList.contains("vertical-ship");

    // Get info about the hovered cell
    const thisCellContent = event.target;
    const thisCell = thisCellContent.parentElement;
    const rowList = Array.from(domTable.rows);
    const thisRowIdx = rowList.indexOf(thisCell.parentElement);
    const thisColIdx = domCells[thisRowIdx].indexOf(thisCell);

    // Compute for the index of the head cell
    let headCellIdx = shipIsVertical
        ? thisRowIdx - draggedShipPartIdx // when ship is vertical; get the index of head cell's row
        : thisColIdx - draggedShipPartIdx; // when ship is horizontal; get the index of the head cell in its row

    // If ship placement if valid...
    if (headCellIdx > -1 && headCellIdx + shipLength <= BOARD_SIZE) {
        // Change cell background colors based on the ship's head, length, and orientatation
        let cellContent;
        for (let i = 0; i < shipLength; i++) {
            const row = shipIsVertical ? headCellIdx + i : thisRowIdx;
            const col = shipIsVertical ? thisColIdx : headCellIdx + i;
            cellContent = domCells[row][col].children[0];
            cellContent.style.backgroundColor = "rgba(0, 255, 0, 0.25)";
        }
    }
}

// To be put on cells
function dragLeaveHandler(event) {
    event.preventDefault();

    // Get info about the dragged ship
    const shipData = JSON.parse(event.dataTransfer.getData("text/plain"));
    const shipId = shipData.id;
    const shipLength = Number(shipData.length);
    const ship = document.getElementById(shipId);
    const shipIsVertical = ship.classList.contains("vertical-ship");

    // Get info about the hovered cell
    const thisCellContent = event.target;
    const thisCell = thisCellContent.parentElement;
    const rowList = Array.from(domTable.rows);
    const thisRowIdx = rowList.indexOf(thisCell.parentElement);
    const thisColIdx = domCells[thisRowIdx].indexOf(thisCell);

    // Compute for the index of the head cell
    let headCellIdx = shipIsVertical
        ? thisRowIdx - draggedShipPartIdx // when ship is vertical; get the index of head cell's row
        : thisColIdx - draggedShipPartIdx; // when ship is horizontal; get the index of the head cell in its row

    // If ship placement if valid...
    if (headCellIdx > -1 && headCellIdx + shipLength <= BOARD_SIZE) {
        // Remove cell background colors based on the ship's head, length, and orientatation
        let cellContent;
        for (let i = 0; i < shipLength; i++) {
            const row = shipIsVertical ? headCellIdx + i : thisRowIdx;
            const col = shipIsVertical ? thisColIdx : headCellIdx + i;
            cellContent = domCells[row][col].children[0];
            cellContent.style.backgroundColor = "";
        }
    }
}

// To be put on cells
function dropHandler(event) {
    event.preventDefault();

    // Get info about the dragged ship
    const shipData = JSON.parse(event.dataTransfer.getData("text/plain"));
    const shipId = shipData.id;
    const shipLength = Number(shipData.length);
    const ship = document.getElementById(shipId);
    const shipIsVertical = ship.classList.contains("vertical-ship");

    // Get info about the hovered cell
    const thisCellContent = event.target;
    const thisCell = thisCellContent.parentElement;
    const rowList = Array.from(domTable.rows);
    const thisRowIdx = rowList.indexOf(thisCell.parentElement);
    const thisColIdx = domCells[thisRowIdx].indexOf(thisCell);

    // Compute for the index of the head cell
    let headCellIdx = shipIsVertical
        ? thisRowIdx - draggedShipPartIdx // when ship is vertical; head index is based on the rows
        : thisColIdx - draggedShipPartIdx; // when ship is horizontal; head index is based on the columns

    // If ship placement if valid...
    if (headCellIdx > -1 && headCellIdx + shipLength <= BOARD_SIZE) {
        // change ship position to absolute before dropping
        ship.style.position = "absolute";
        ship.style.top = "0px";
        ship.style.left = "0px";

        // Drop the ship in head cell
        const headCell = shipIsVertical
            ? domCells[headCellIdx][thisColIdx]
            : domCells[thisRowIdx][headCellIdx];
        headCell.appendChild(ship);

        // Remove cell background colors based on the ship's head, length, and orientatation
        let cellContent;
        for (let i = 0; i < shipLength; i++) {
            const row = shipIsVertical ? headCellIdx + i : thisRowIdx;
            const col = shipIsVertical ? thisColIdx : headCellIdx + i;
            cellContent = domCells[row][col].children[0];
            cellContent.style.backgroundColor = "";
        }
    }
}

function setupDragAndDrop() {
    const shipParts = document.getElementsByClassName("ship-part");
    for (const shipPart of shipParts) {
        shipPart.addEventListener("mousedown", mouseDownHandler);
    }

    const ships = document.getElementsByClassName("ship");
    for (const ship of ships) {
        ship.addEventListener("dragstart", dragStartHandler);
        ship.addEventListener("click", onClickHandler);
    }

    const cells = document.getElementsByClassName("cell-content");
    for (const cell of cells) {
        cell.addEventListener("dragover", dragOverHandler);
        cell.addEventListener("dragleave", dragLeaveHandler);
        cell.addEventListener("drop", dropHandler);
    }
}

export default setupDragAndDrop;

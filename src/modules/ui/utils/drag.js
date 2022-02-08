import ship from "../../factories/ship";

const BOARD_SIZE = 10;

function getShipCoords(ship, headCell) {
    const shipUICoords = [];
    const shipLength = Number(ship.dataset.length);
    const shipIsVertical = ship.classList.contains("vertical-ship");

    for (let i = 0; i < shipLength; i++) {
        const row = shipIsVertical ? headCell.row + i : headCell.row;
        const col = shipIsVertical ? headCell.col : headCell.col + i;
        shipUICoords.push([row, col]);
    }

    return shipUICoords;
}

function getShipBoundaryCoords(shipCoords) {
    const shipBoundaryCoords = [];

    shipCoords.forEach(coord => {
        for (let row = coord[0] - 1; row < coord[0] + 2; row++) {
            for (let col = coord[1] - 1; col < coord[1] + 2; col++) {
                const coordInShipBorder = shipBoundaryCoords.some(shipCoord => {
                    return shipCoord[0] === row && shipCoord[1] === col;
                });
                const coordInShipPart = shipCoords.some(shipCoord => {
                    return shipCoord[0] === row && shipCoord[1] === col;
                });
                const coordIsOutOfBoard =
                    row < 0 ||
                    row >= BOARD_SIZE ||
                    col < 0 ||
                    col >= BOARD_SIZE;

                if (coordInShipBorder || coordInShipPart || coordIsOutOfBoard) {
                    continue;
                }

                shipBoundaryCoords.push([row, col]);
            }
        }
    });

    return shipBoundaryCoords;
}

function getShipSpace(ship, headCell) {
    const shipCoords = getShipCoords(ship, headCell);
    const shipSpace = shipCoords.concat(getShipBoundaryCoords(shipCoords));
    return shipSpace;
}

// This is a global because we are only able to access this once; during its mouse down event
// And the other functions need to know the dragged ship part index
let shipPartIndx;

// To be put on ship parts
function mouseDownHandler(event) {
    const ship = event.target.parentElement;
    shipPartIndx = Array.from(ship.children).indexOf(event.target);
}

// To be put on ships
function dragStartHandler(event) {
    // const shipData = {
    //     id: event.target.id,
    //     length: event.target.dataset.length,
    // };
    event.dataTransfer.setData("text/plain", event.target.id);
}

// To be put on ships
function onClickHandler(event) {
    const ship = event.target.parentElement;
    if (ship.parentElement.tagName === "DIV") {
        ship.classList.toggle("vertical-ship");
    }
}

// To be put on the ship zone/fleet
function fleetDragOver(event) {
    event.preventDefault();
    const fleet = document.getElementById("fleet");
    fleet.style.backgroundColor = "rgba(255, 0, 0, 0.25)";
}

// To be put on the ship zone/fleet
function fleetDragLeave(event) {
    event.preventDefault();
    const fleet = document.getElementById("fleet");
    fleet.style.backgroundColor = "";
}

// To be put on the ship zone/fleet
function fleetDrop(event) {
    event.preventDefault();

    const domTable = document.getElementById("gameboard").children[0];
    const domCells = new Array(domTable.rows.length);
    for (let i = 0; i < domCells.length; i++) {
        domCells[i] = new Array(domTable.rows[i].cells.length);
        for (let j = 0; j < domCells[i].length; j++) {
            domCells[i][j] = domTable.rows[i].cells[j].firstChild;
        }
    }

    const shipID = event.dataTransfer.getData("text/plain");
    const shipUI = document.getElementById(shipID);
    const shipLength = shipUI.dataset.length;
    const shipWasVertical = shipUI.classList.contains("vertical-ship");
    shipUI.style.position = "";
    shipUI.classList.remove("vertical-ship");
    const oldHeadCell = shipUI.parentElement.classList.contains("cell-content")
        ? shipUI.parentElement
        : undefined;
    const fleet = document.getElementById("fleet");
    fleet.style.backgroundColor = "";

    const shipCategories = Array.from(
        document.getElementsByClassName("ship-category"),
    );
    const thisShipCategory = shipCategories.find(shipCategory => {
        return shipCategory.dataset.length === shipLength;
    });
    thisShipCategory.appendChild(shipUI);

    if (oldHeadCell) {
        console.log("fleet there was an old head");
        for (let i = 0; i < shipLength; i++) {
            const oldRow = shipWasVertical
                ? oldHeadCell.row + i
                : oldHeadCell.row;
            const oldCol = shipWasVertical
                ? oldHeadCell.col
                : oldHeadCell.col + i;
            console.log("there is an old head cell");
            const oldCellContent = domCells[oldRow][oldCol];
            oldCellContent.innerHTML = "";
        }
    }
}

// To be put on cells
function dragOverHandler(event) {
    event.preventDefault();

    // Store cells in 2D array for easy access
    // Cells refer to "div.cell-content" and not "td"
    const domTable = document.getElementById("gameboard").children[0];
    const domCells = new Array(domTable.rows.length);
    for (let i = 0; i < domCells.length; i++) {
        domCells[i] = new Array(domTable.rows[i].cells.length);
        for (let j = 0; j < domCells[i].length; j++) {
            domCells[i][j] = domTable.rows[i].cells[j].firstChild;
        }
    }

    // Get info about the dragged ship
    const shipId = event.dataTransfer.getData("text/plain");
    const shipUI = document.getElementById(shipId);
    const shipLength = Number(shipUI.dataset.length);
    const shipIsVertical = shipUI.classList.contains("vertical-ship");

    // Get info about the hovered cell
    const thisCell = event.target;

    const shipIsWithinBorders = shipIsVertical
        ? thisCell.row - shipPartIndx > -1 &&
          thisCell.row - shipPartIndx + shipLength <= BOARD_SIZE
        : thisCell.col - shipPartIndx > -1 &&
          thisCell.col - shipPartIndx + shipLength <= BOARD_SIZE;

    if (!shipIsWithinBorders) return;

    const headCell = shipIsVertical
        ? domCells[thisCell.row - shipPartIndx][thisCell.col]
        : domCells[thisCell.row][thisCell.col - shipPartIndx];

    // const shipSpace = [];
    // getShipSpace(shipUI, headCell).forEach(coord => {
    //     shipSpace.push(domCells[coord[0]][coord[1]]);
    // });

    // const otherShipFoundInSpace = shipSpace.some(cell => {
    //     return cell.firstChild;
    // });
    // console.log(otherShipFoundInSpace);

    // Change cell background colors based on the ship's head, length, and orientatation
    for (let i = 0; i < shipLength; i++) {
        const row = shipIsVertical ? headCell.row + i : headCell.row;
        const col = shipIsVertical ? headCell.col : headCell.col + i;
        let cellContent = domCells[row][col];
        cellContent.style.backgroundColor = "rgba(0, 255, 0, 0.25)";
    }
}

// To be put on cells
function dragLeaveHandler(event) {
    event.preventDefault();
    if (!event.target.classList.contains("cell-content")) return;

    // Store cells in 2D array for easy access
    // Cells refer to "div.cell-content" and not "td"
    const domTable = document.getElementById("gameboard").children[0];
    const domCells = new Array(domTable.rows.length);
    for (let i = 0; i < domCells.length; i++) {
        domCells[i] = new Array(domTable.rows[i].cells.length);
        for (let j = 0; j < domCells[i].length; j++) {
            domCells[i][j] = domTable.rows[i].cells[j].firstChild;
        }
    }

    // Get info about the dragged ship
    const shipId = event.dataTransfer.getData("text/plain");
    const shipUI = document.getElementById(shipId);
    const shipLength = Number(shipUI.dataset.length);
    const shipIsVertical = shipUI.classList.contains("vertical-ship");

    // Get info about the hovered cell
    const thisCell = event.target;

    const shipIsWithinBorders = shipIsVertical
        ? thisCell.row - shipPartIndx > -1 &&
          thisCell.row - shipPartIndx + shipLength <= BOARD_SIZE
        : thisCell.col - shipPartIndx > -1 &&
          thisCell.col - shipPartIndx + shipLength <= BOARD_SIZE;

    if (!shipIsWithinBorders) return;

    const headCell = shipIsVertical
        ? domCells[thisCell.row - shipPartIndx][thisCell.col]
        : domCells[thisCell.row][thisCell.col - shipPartIndx];

    // Change cell background colors based on the ship's head, length, and orientatation
    for (let i = 0; i < shipLength; i++) {
        const row = shipIsVertical ? headCell.row + i : headCell.row;
        const col = shipIsVertical ? headCell.col : headCell.col + i;
        let cellContent = domCells[row][col];
        cellContent.style.backgroundColor = "";
    }
}

// To be put on cells
function dropHandler(event) {
    event.preventDefault();

    // Store cells in 2D array for easy access
    // Cells refer to "div.cell-content" and not "td"
    const domTable = document.getElementById("gameboard").children[0];
    const domCells = new Array(domTable.rows.length);
    for (let i = 0; i < domCells.length; i++) {
        domCells[i] = new Array(domTable.rows[i].cells.length);
        for (let j = 0; j < domCells[i].length; j++) {
            domCells[i][j] = domTable.rows[i].cells[j].firstChild;
        }
    }

    // Get info about the dragged ship
    const shipID = event.dataTransfer.getData("text/plain");
    const shipUI = document.getElementById(shipID);
    const shipLength = Number(shipUI.dataset.length);
    const shipIsVertical = shipUI.classList.contains("vertical-ship");

    // Get info about the hovered cell
    const thisCell = event.target;
    const oldHeadCell = shipUI.parentElement.classList.contains("cell-content")
        ? shipUI.parentElement
        : undefined;

    const shipIsWithinBorders = shipIsVertical
        ? thisCell.row - shipPartIndx > -1 &&
          thisCell.row - shipPartIndx + shipLength <= BOARD_SIZE
        : thisCell.col - shipPartIndx > -1 &&
          thisCell.col - shipPartIndx + shipLength <= BOARD_SIZE;

    if (!shipIsWithinBorders) return;

    const headCell = shipIsVertical
        ? domCells[thisCell.row - shipPartIndx][thisCell.col]
        : domCells[thisCell.row][thisCell.col - shipPartIndx];

    const shipSpace = [];
    getShipSpace(shipUI, headCell).forEach(coord => {
        shipSpace.push(domCells[coord[0]][coord[1]]);
    });

    const otherShipFoundInSpace = shipSpace.some(cell => {
        const filler = cell.querySelector("div[data-from]");
        return filler !== null && filler.dataset.from !== shipID;
    });

    console.log(otherShipFoundInSpace);

    // change ship position to absolute before dropping
    shipUI.style.position = "absolute";
    shipUI.style.top = "0px";
    shipUI.style.left = "0px";

    // Drop the ship in the head cell
    headCell.appendChild(shipUI);

    // Change cell background colors based on the ship's head, length, and orientatation
    for (let i = 0; i < shipLength; i++) {
        const row = shipIsVertical ? headCell.row + i : headCell.row;
        const col = shipIsVertical ? headCell.col : headCell.col + i;
        const cellContent = domCells[row][col];
        cellContent.style.backgroundColor = "";
        const fillerValue = document.createElement("div");
        fillerValue.dataset.from = shipID;
        cellContent.appendChild(fillerValue);

        if (oldHeadCell) {
            const oldRow = shipIsVertical
                ? oldHeadCell.row + i
                : oldHeadCell.row;
            const oldCol = shipIsVertical
                ? oldHeadCell.col
                : oldHeadCell.col + i;
            const oldCellContent = domCells[oldRow][oldCol];
            const filler = oldCellContent.querySelector("div[data-from]");
            filler.remove();
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

export {
    mouseDownHandler,
    dragStartHandler,
    onClickHandler,
    dragOverHandler,
    dragLeaveHandler,
    dropHandler,
    setupDragAndDrop,
    fleetDragOver,
    fleetDragLeave,
    fleetDrop,
};

export default {
    mouseDownHandler,
    dragStartHandler,
    onClickHandler,
    dragOverHandler,
    dragLeaveHandler,
    dropHandler,
    setupDragAndDrop,
    fleetDragOver,
    fleetDragLeave,
    fleetDrop,
};

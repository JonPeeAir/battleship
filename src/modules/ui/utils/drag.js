import { getDomCells } from "../setupPhase/components/gameboardUI";

// We need this to be global because other event listeners cant access this
let shipPartIndx;

// To be put on ship parts
function mouseDownHandler(event) {
    const ship = this.parentElement;
    shipPartIndx = Array.from(ship.children).indexOf(event.target);
}

// To be put on ships
function dragStartHandler(event) {
    // If shipPartIndx is undefined for some reason, set it to the middle-most index
    if (shipPartIndx === undefined)
        shipPartIndx = Math.floor(this.battleship.ship.length / 2);

    // This highlights the restricted areas in the board
    const gameboardUI = document.getElementById("gameboard");
    const domCells = getDomCells();
    const shipUIsOnBoard = Array.from(gameboardUI.querySelectorAll(".ship"));
    shipUIsOnBoard.forEach(shipUI => {
        // Do not highlight this ship's restricted areas
        if (shipUI === this) return;

        const shipCoords = shipUI.battleship.coords;
        const shipAreaCoords = shipUI.battleship.areaCoords;
        const shipBorderCoords = shipAreaCoords.filter(coord => {
            return shipCoords.every(shipCoord => {
                return shipCoord.toString() !== coord.toString();
            });
        });

        shipBorderCoords.forEach(coord => {
            const row = coord[0];
            const col = coord[1];
            const borderCell = domCells[row][col];
            borderCell.style.backgroundColor = "rgb(237, 142, 142)";
        });
    });

    // This is the main purpose of the dragStartHandler
    event.dataTransfer.setData("text/plain", event.target.id);
}

function dragEndHandler(event) {
    event.preventDefault();

    // This removes the highlighted restricted areas in the board
    const gameboardUI = document.getElementById("gameboard");
    const domCells = getDomCells();
    const shipUIsOnBoard = Array.from(gameboardUI.querySelectorAll(".ship"));
    shipUIsOnBoard.forEach(shipUI => {
        const shipCoords = shipUI.battleship.coords;
        const shipAreaCoords = shipUI.battleship.areaCoords;
        const shipBorderCoords = shipAreaCoords.filter(coord => {
            return shipCoords.every(shipCoord => {
                return shipCoord.toString() !== coord.toString();
            });
        });

        shipBorderCoords.forEach(coord => {
            const row = coord[0];
            const col = coord[1];
            const borderCell = domCells[row][col];
            borderCell.style.backgroundColor = "";
        });
    });
}

// To be put on ships
function onClickHandler(event) {
    // Get info about clicked ship
    const shipUI = this;

    // If shipUI's parent is not gameboardUI, you shouldn't rotate it
    if (!shipUI.parentElement.classList.contains("cell-content")) return;

    // If shipUI's parent is gameboardUI, get more info about the ship and gameboard
    const battleship = shipUI.battleship;
    const gameboard = document.getElementById("gameboard").gameboard;

    // Attempt to rotate ship in gameboard
    try {
        gameboard.rotateShip(battleship);
    } catch (error) {
        console.error(error);

        // If an error occurs, toggle the error class and return
        shipUI.classList.remove("ship-error");
        setTimeout(() => {
            shipUI.classList.add("ship-error");
        }, 100);

        return;
    }

    // If successful, rotate shipUI
    shipUI.classList.toggle("vertical-ship");

    // and remove the "ship-error" class if it was ever applied
    shipUI.classList.remove("ship-error");
}

// To be put on the ship zone/fleet
function fleetDragOver(event) {
    event.preventDefault();
    this.style.backgroundColor = "rgba(0, 0, 0, 0.10)";
}

// To be put on the ship zone/fleet
function fleetDragLeave(event) {
    event.preventDefault();
    this.style.backgroundColor = "";
}

// To be put on the ship zone/fleet
function fleetDrop(event) {
    event.preventDefault();

    // Get ship details
    const shipID = event.dataTransfer.getData("text/plain");
    const shipUI = document.getElementById(shipID);
    const battleship = shipUI.battleship;
    const shipLength = battleship.ship.length;

    // Get gameboard details
    const gameboardUI = document.getElementById("gameboard");
    const gameboard = gameboardUI.gameboard;

    // Get fleet container details
    const fleetUI = this;
    const thisShipCategory = Array.from(fleetUI.children).find(child => {
        return Number(child.dataset.length) === shipLength;
    });

    // Reset ship styles and data
    shipUI.classList.remove("vertical-ship");
    shipUI.classList.remove("ship-error");
    shipUI.style.position = "";
    battleship.ship.orientation = "h";
    battleship.hRow = undefined;
    battleship.hCol = undefined;

    // Remove ship from gameboard
    gameboard.removeShip(battleship);

    // Change fleet background color back to normal
    fleetUI.style.backgroundColor = "";

    // Then finally drop the ship in its category
    thisShipCategory.appendChild(shipUI);

    const startBtn = document.getElementById("start-btn");
    if (fleetUI.querySelectorAll(".ship").length > 0) {
        startBtn.dispatchEvent(new Event("boardIsNotSet"));
    }
}

// To be put on cells
function dragOverHandler(event) {
    event.preventDefault();

    const eventData = event.dataTransfer.getData("text/plain");
    // Exit early for unwanted events
    if (eventData.match(/ship/) === null || event.target !== this) return;

    // Get ship details
    const shipUI = document.getElementById(eventData);
    const battleship = shipUI.battleship;
    const shipLength = battleship.ship.length;
    const shipIsVertical = battleship.ship.orientation === "v";

    // Get head cell details // "this" refers to the hovered cell
    const hRow = shipIsVertical ? this.row - shipPartIndx : this.row;
    const hCol = shipIsVertical ? this.col : this.col - shipPartIndx;

    // Get gameboard details
    const domCells = getDomCells();
    const gameboardUI = document.getElementById("gameboard");
    const gameboard = gameboardUI.gameboard;

    // Save a reference to the previous head cell coords
    const prevRow = battleship.hRow;
    const prevCol = battleship.hCol;

    // Change battleship head cell coords to new head cell coords
    battleship.hRow = hRow;
    battleship.hCol = hCol;

    // Test the validity of the new position
    try {
        gameboard.checkPlacementOf(battleship);
        // The code below won't execute if the code above throws an error
        for (let i = 0; i < shipLength; i++) {
            const row = shipIsVertical ? hRow + i : hRow;
            const col = shipIsVertical ? hCol : hCol + i;
            let cellContent = domCells[row][col];
            cellContent.style.backgroundColor = "rgb(142, 237, 142)";
        }
    } catch (error) {
        return;
    } finally {
        // Always return the battleship to its previous coords after
        battleship.hRow = prevRow;
        battleship.hCol = prevCol;
    }
}

// To be put on cells
function dragLeaveHandler(event) {
    event.preventDefault();

    const eventData = event.dataTransfer.getData("text/plain");
    // Exit early for unwanted events
    if (eventData.match(/ship/) === null || event.target !== this) return;

    // Get ship details
    const shipID = event.dataTransfer.getData("text/plain");
    const shipUI = document.getElementById(shipID);
    const battleship = shipUI.battleship;
    const shipLength = battleship.ship.length;
    const shipIsVertical = battleship.ship.orientation === "v";

    // Get head cell details // "this" refers to the hovered cell
    const hRow = shipIsVertical ? this.row - shipPartIndx : this.row;
    const hCol = shipIsVertical ? this.col : this.col - shipPartIndx;

    // Get gameboard details
    const domCells = getDomCells();
    const gameboardUI = document.getElementById("gameboard");
    const gameboard = gameboardUI.gameboard;

    // Save a reference to the previous head cell coords
    const prevRow = battleship.hRow;
    const prevCol = battleship.hCol;

    // Change battleship head cell coords to new head cell coords
    battleship.hRow = hRow;
    battleship.hCol = hCol;

    // Check if we need to remove the drag over background change
    try {
        gameboard.checkPlacementOf(battleship);
        // The code below won't execute if the code above throws an error
        for (let i = 0; i < shipLength; i++) {
            const row = shipIsVertical ? hRow + i : hRow;
            const col = shipIsVertical ? hCol : hCol + i;
            let cellContent = domCells[row][col];
            cellContent.style.backgroundColor = "";
        }
    } catch (error) {
        return;
    } finally {
        // Always return the battleship to its previous coords after
        battleship.hRow = prevRow;
        battleship.hCol = prevCol;
    }
}

// To be put on cells
function dropHandler(event) {
    event.preventDefault();

    const eventData = event.dataTransfer.getData("text/plain");
    // Exit early for unwanted events
    if (eventData.match(/ship/) === null || event.target !== this) return;

    // Get ship details
    const shipID = event.dataTransfer.getData("text/plain");
    const shipUI = document.getElementById(shipID);
    const battleship = shipUI.battleship;
    const shipLength = battleship.ship.length;
    const shipIsVertical = battleship.ship.orientation === "v";

    // Get head cell details // "this" refers to the hovered cell
    const hRow = shipIsVertical ? this.row - shipPartIndx : this.row;
    const hCol = shipIsVertical ? this.col : this.col - shipPartIndx;

    // Get gameboard details
    const domCells = getDomCells();
    const gameboardUI = document.getElementById("gameboard");
    const gameboard = gameboardUI.gameboard;

    // Try to put/move the battleship in gameboard
    try {
        shipUI.battleship = gameboard.moveShip(battleship, hRow, hCol);
    } catch (error) {
        console.error("Unable to move ship, attempting to put ship instead");
        try {
            shipUI.battleship = gameboard.putShip(battleship.ship, hRow, hCol);
        } catch (error) {
            console.error(error);

            // If putting/moving didn't work, apply the "ship-error" style
            shipUI.classList.remove("ship-error");
            setTimeout(() => {
                shipUI.classList.add("ship-error");
            }, 100);
            return;
        }
    }

    // change ship position to absolute before dropping
    shipUI.style.position = "absolute";

    // Drop the shipUI in the head cell
    domCells[hRow][hCol].appendChild(shipUI);

    // Remove the "ship-error" class if it was ever applied
    shipUI.classList.remove("ship-error");

    // Remove the drag over background changes
    for (let i = 0; i < shipLength; i++) {
        const row = shipIsVertical ? hRow + i : hRow;
        const col = shipIsVertical ? hCol : hCol + i;
        let cellContent = domCells[row][col];
        cellContent.style.backgroundColor = "";
    }

    // Alert the start button if the board is ready
    const fleetUI = document.getElementById("fleet");
    const startBtn = document.getElementById("start-btn");
    if (fleetUI.querySelectorAll(".ship").length > 0) {
        startBtn.dispatchEvent(new Event("boardIsNotSet"));
    } else {
        startBtn.dispatchEvent(new Event("boardIsSet"));
    }
}

export {
    mouseDownHandler,
    dragStartHandler,
    dragEndHandler,
    onClickHandler,
    dragOverHandler,
    dragLeaveHandler,
    dropHandler,
    fleetDragOver,
    fleetDragLeave,
    fleetDrop,
};

export default {
    mouseDownHandler,
    dragStartHandler,
    dragEndHandler,
    onClickHandler,
    dragOverHandler,
    dragLeaveHandler,
    dropHandler,
    fleetDragOver,
    fleetDragLeave,
    fleetDrop,
};

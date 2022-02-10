import events from "events";
import { isShip } from "./ship";

// Edit this if you want to change overall gameboard size
const BOARD_SIZE = 10;

const battleShipProto = {
    get coords() {
        const coords = [];
        for (let i = 0; i < this.ship.length; i++) {
            if (this.ship.orientation === "h") {
                coords.push([this.hRow, this.hCol + i]);
            } else if (this.ship.orientation === "v") {
                coords.push([this.hRow + i, this.hCol]);
            }
        }
        return coords;
    },

    get areaCoords() {
        const areaCoords = new Set();
        this.coords.forEach(coord => {
            for (let row = coord[0] - 1; row < coord[0] + 2; row++) {
                for (let col = coord[1] - 1; col < coord[1] + 2; col++) {
                    if (
                        row < 0 ||
                        row >= BOARD_SIZE ||
                        col < 0 ||
                        col >= BOARD_SIZE
                    ) {
                        continue;
                    }
                    areaCoords.add(JSON.stringify([row, col]));
                }
            }
        });
        return Array.from(areaCoords).map(coord => JSON.parse(coord));
    },
};

function createBattleShip(ship, headRow, headColumn) {
    // Basically a ship object with data about its location on the board
    const battleShip = { ship, hRow: headRow, hCol: headColumn };
    return Object.assign(Object.create(battleShipProto), battleShip);
}

const boardProto = (() => {
    // Private helper method
    function randFrom(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);

        // Returns random int from min to max
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    // Private helper method
    function updateShips(row, col) {
        this.ships.forEach(ship => {
            const attackHits = ship.coords.some(coord => {
                return coord.toString() === [row, col].toString();
            });

            const hitIndex = ship.coords.findIndex(coord => {
                return coord.toString() === [row, col].toString();
            });

            if (attackHits) {
                ship.ship.hitShip(hitIndex);
                // Then alert subscribers of a ship update if the attack hits
                this.event.emit("shipUpdate");
            }
        });
    }

    return {
        setBoard() {
            this.set = true;
        },

        unsetBoard() {
            this.set = false;
        },

        shipCrossesTheBorders(battleship) {
            const coords = battleship.coords;
            for (let i = 0; i < coords.length; i++) {
                if (coords[i].some(c => c < 0 || c >= this.size)) {
                    return true;
                }
            }
            return false;
        },

        shipIsTooCloseToOtherShips(battleship) {
            const shipUsedToBeOnBoard = this.containsShip(battleship);
            if (shipUsedToBeOnBoard) this.removeShip(battleship);

            const thisAreaCoords = battleship.areaCoords;
            for (let i = 0; i < this.ships.length; i++) {
                const otherShipCoords = this.ships[i].coords;
                for (let j = 0; j < otherShipCoords.length; j++) {
                    if (
                        thisAreaCoords.some(areaCoord => {
                            return (
                                areaCoord.toString() ===
                                otherShipCoords[j].toString()
                            );
                        })
                    ) {
                        if (shipUsedToBeOnBoard) this.ships.push(battleship);
                        return true;
                    }
                }
            }

            if (shipUsedToBeOnBoard) this.ships.push(battleship);
            return false;
        },

        containsShip(battleship) {
            return this.ships.some(ship => ship === battleship);
        },

        putShip(ship, headRow, headColumn) {
            // Initial error checks
            if (this.set)
                throw new Error("Cannot put new ship when the board is set");
            if (!isShip(ship))
                throw new Error("Invalid ship passed to Gameboard.putShip");

            // Attempt to create battleShip
            const battleShip = createBattleShip(ship, headRow, headColumn);

            // Check if ship position is valid
            if (
                this.shipCrossesTheBorders(battleShip) ||
                this.shipIsTooCloseToOtherShips(battleShip)
            ) {
                throw new Error("Ship position is invalid, unable to put ship");
            }

            // Push the battleShip if no errors were thrown
            this.ships.push(battleShip);

            // Return battleship if putting ship was successful
            return battleShip;
        },

        removeShip(battleShip) {
            const battleShipIndex = this.ships.findIndex(
                otherBattleShip => battleShip === otherBattleShip,
            );
            if (battleShipIndex > -1) {
                return this.ships.splice(battleShipIndex, 1)[0];
            }
            return undefined;
        },

        moveShip(battleShip, headRow, headColumn) {
            // Initial error checks
            if (this.set)
                throw new Error("Cannot move ship when the board is set");
            if (this.ships.every(ship => ship !== battleShip)) {
                throw new Error(
                    `You must put this ship in the board first before moving it`,
                );
            }

            // Save a reference to the current head coords
            const prevRow = battleShip.hRow;
            const prevCol = battleShip.hCol;

            // Attempt to move ship to new head coords
            battleShip.hRow = headRow;
            battleShip.hCol = headColumn;

            // Check if new ship position is valid
            if (
                this.shipCrossesTheBorders(battleShip) ||
                this.shipIsTooCloseToOtherShips(battleShip)
            ) {
                // If new coords not valid, revert back to old coords
                battleShip.hRow = prevRow;
                battleShip.hCol = prevCol;

                // Then throw error
                const errMsg = "Ship position is invalid, unable to move ship";
                throw new Error(errMsg);
            }

            // Return ship index if moving the ship was successful
            return battleShip;
        },

        rotateShip(battleShip) {
            // Initial error checks
            if (this.set)
                throw new Error("Cannot rotate ship when the board is set");

            if (this.ships.every(ship => ship !== battleShip))
                throw new Error(
                    `You must put this ship in the board first before rotating it`,
                );

            // Attempt to rotate Ship
            battleShip.ship.changeOrientation();

            // Check if new ship position is valid
            if (
                this.shipCrossesTheBorders(battleShip) ||
                this.shipIsTooCloseToOtherShips(battleShip)
            ) {
                // If rotation is not valid, go back to its previous orientation
                battleShip.ship.changeOrientation();

                // Then throw error
                const errMsg = "Ship position is invalid, unable to move ship";
                throw new Error(errMsg);
            }

            // Return ship index if rotating the ship was successful
            return battleShip;
        },

        receiveAttack(row, col) {
            // Error checks
            if (!this.set)
                throw new Error("Cannot receive attack unless board is set");
            if (row < 0 || row >= this.size || col < 0 || col >= this.size)
                throw new Error("Invalid coords, found outside of board");
            if (this.playArea[row][col] === true)
                throw new Error("This spot has already been hit");

            // If no errors were thrown, safely update the board
            this.playArea[row][col] = true;

            // Then alert subscribers of a board update
            this.event.emit("boardUpdate");

            // Then update the ships if the attack hits
            updateShips.call(this, row, col);
        },

        randomize() {
            // Error checks
            if (this.set)
                throw new Error("Cannot randomize ships when the board is set");
            if (this.ships.length === 0)
                throw new Error(
                    "Randomize has no effect, consider adding some ships",
                );

            for (let i = 0; i < this.ships.length; i++) {
                while (true) {
                    try {
                        const ship = this.ships[i];
                        // Move ship to random location
                        this.moveShip(ship, randFrom(0, 9), randFrom(0, 9));
                        // With a 50% chance, change ship orientation
                        if (randFrom(0, 1)) this.rotateShip(ship);
                    } catch (e) {
                        continue;
                    }
                    break;
                }
            }
        },

        locateShipsOnBoard() {
            const board = new Array(this.size);
            for (let i = 0; i < this.size; i++) {
                board[i] = new Array(this.size).fill(" ");
            }

            this.ships.forEach(battleShip => {
                for (let i = 0; i < battleShip.ship.length; i++) {
                    const row = battleShip.coords[i][0];
                    const col = battleShip.coords[i][1];
                    board[row][col] = "O";
                    if (battleShip.ship.hit[i]) {
                        board[row][col] = "X";
                    }
                }
            });

            // Return 10x10 array where spots are marked where ships are located
            return board;
        },

        visualizeShips() {
            const board = this.locateShipsOnBoard();

            let str = "                  SHIPS VISUALIZED\n";
            str = str.concat(
                "        | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |\n",
            );
            str = str.concat(
                "    ----+---------------------------------------+\n",
            );

            for (let i = 0; i < board.length; i++) {
                let row = `      ${i} |`;
                for (let j = 0; j < board[i].length; j++) {
                    row = row.concat(` ${board[i][j]} |`);
                }
                row = row.concat(
                    "\n    ----+---------------------------------------+\n",
                );
                str = str.concat(row);
            }

            console.log(str);
        },

        visualizeAttacks() {
            const board = this.playArea;

            let str = "             ATTACKS RECEIVED VISUALIZED\n";
            str = str.concat(
                "        | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |\n",
            );
            str = str.concat(
                "    ----+---------------------------------------+\n",
            );

            for (let i = 0; i < board.length; i++) {
                let row = `      ${i} |`;
                for (let j = 0; j < board[i].length; j++) {
                    row = row.concat(` ${board[i][j] ? "X" : " "} |`);
                }
                row = row.concat(
                    "\n    ----+---------------------------------------+\n",
                );
                str = str.concat(row);
            }

            console.log(str);
        },

        hasLost() {
            if (!this.set)
                throw new Error("Cannot determine if board is not set");
            return this.ships.every(battleShip => battleShip.ship.isSunk());
        },

        reset() {
            this.unsetBoard();
            this.playArea.forEach(column => {
                column.fill(false);
            });
            this.ships.length = 0;
        },
    };
})();

function createGameboard() {
    const size = BOARD_SIZE;
    let playArea = new Array(size);
    for (let i = 0; i < playArea.length; i++) {
        playArea[i] = new Array(size).fill(false);
    }
    let setValue = false;
    let event = new events.EventEmitter();

    const gameboard = Object.assign(Object.create(boardProto), {
        size,
        playArea,
        ships: [],
    });

    Object.defineProperties(gameboard, {
        set: {
            get: () => setValue,
            set: newValue => {
                if (newValue === true || newValue === false) {
                    setValue = newValue;
                } else {
                    throw new Error("Invalid assignment to set");
                }
            },
        },
        event: {
            get: () => event,
            set: newEvent => (event = newEvent),
        },
    });

    return Object.freeze(gameboard);
}

function isGameboard(gameboard) {
    return (
        gameboard.hasOwnProperty("size") &&
        gameboard.hasOwnProperty("playArea") &&
        gameboard.hasOwnProperty("ships") &&
        gameboard.hasOwnProperty("event") &&
        gameboard.hasOwnProperty("set") &&
        Object.getPrototypeOf(gameboard) === boardProto
    );
}

// This allows external modules to import individual functions
export { createGameboard, createBattleShip, isGameboard };

// This allows external modules to import all functions as a single object
export default { createGameboard, createBattleShip, isGameboard };

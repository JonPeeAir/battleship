import { isShip } from "./ship";

// Edit this if you want to change overall gameboard size
const BOARD_SIZE = 10;

/* -------------------------------------------------- */
/* ---------------- BATTLESHIP CLASS ---------------- */
/* -------------------------------------------------- */
/* - Basically a ship object with data about its ---- */
/* - location on the board -------------------------- */
/* -------------------------------------------------- */

const bShipProto = {
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

    // This returns an array of coords that other ships are not allowed to enter
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
    return Object.assign(Object.create(bShipProto), {
        ship,
        hRow: headRow,
        hCol: headColumn,
    });
}
/* -------------------------------------------------- */
/* -------------END OF BATTLESHIP CLASS-------------- */
/* -------------------------------------------------- */

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
        let shipWasHit = false;

        this.ships.forEach(ship => {
            const attackHits = ship.coords.some(coord => {
                return coord.toString() === [row, col].toString();
            });

            const hitIndex = ship.coords.findIndex(coord => {
                return coord.toString() === [row, col].toString();
            });

            if (attackHits) {
                ship.ship.hitShip(hitIndex);
                shipWasHit = true;
            }
        });

        return shipWasHit;
    }

    // Private helper method
    function shipCrossesTheBorders(battleship) {
        const coords = battleship.coords;
        for (let i = 0; i < coords.length; i++) {
            if (coords[i].some(c => c < 0 || c >= this.size)) {
                return true;
            }
        }
        return false;
    }

    // Private helper method
    function shipIsTooCloseToOtherShips(battleship) {
        const shipInShipList = this.ships.some(s => s === battleship);
        // If battleship is a placed on the board, remove the ship from the board to avoid checking on itself
        if (shipInShipList) this.removeShip(battleship);

        // Check if other ships in the list are found within this ship's area coords
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
                    // If ship was removed, put it back before returning
                    if (shipInShipList) this.ships.push(battleship);
                    return true;
                }
            }
        }
        // If ship was removed, put it back before returning
        if (shipInShipList) this.ships.push(battleship);
        return false;
    }

    return {
        checkPlacementOf(battleship) {
            if (shipCrossesTheBorders.call(this, battleship)) {
                throw new Error("Ship crosses the borders");
            }

            if (shipIsTooCloseToOtherShips.call(this, battleship)) {
                throw new Error("Ship is too close to other ships");
            }
        },

        putShip(ship, headRow, headColumn) {
            // Initial error checks
            if (!isShip(ship))
                throw new Error("Invalid ship passed to Gameboard.putShip");

            // Attempt to create battleShip
            const battleship = createBattleShip(ship, headRow, headColumn);

            // Check if ship position is valid
            try {
                this.checkPlacementOf(battleship);
            } catch (error) {
                error.message = error.message + ", unable to put ship";
                throw error;
            }

            // Push the battleship if no errors were thrown
            this.ships.push(battleship);

            // Return battleship if putting ship was successful
            return battleship;
        },

        removeShip(battleShip) {
            const battleShipIndex = this.ships.findIndex(
                otherBattleShip => battleShip === otherBattleShip,
            );
            if (battleShipIndex < 0) {
                return undefined;
            }
            return this.ships.splice(battleShipIndex, 1)[0];
        },

        moveShip(battleship, headRow, headColumn) {
            // Initial error checks
            if (this.ships.every(ship => ship !== battleship)) {
                throw new Error(
                    `You must put this ship in the board first before moving it`,
                );
            }

            // Save a reference to the current head coords
            const prevRow = battleship.hRow;
            const prevCol = battleship.hCol;

            // Attempt to move ship to new head coords
            battleship.hRow = headRow;
            battleship.hCol = headColumn;

            // Test new ship position
            try {
                this.checkPlacementOf(battleship);
            } catch (error) {
                // If new position is not valid, revert back to old coords
                battleship.hRow = prevRow;
                battleship.hCol = prevCol;

                // Then throw error
                error.message = error.message + ", unable to move ship";
                throw error;
            }

            // Return the ship if moving it was successful
            return battleship;
        },

        rotateShip(battleship) {
            // Initial error checks
            if (this.ships.every(ship => ship !== battleship))
                throw new Error(
                    `You must put this ship in the board first before rotating it`,
                );

            // Attempt to rotate Ship
            battleship.ship.changeOrientation();

            // Check if new ship orientation is valid
            try {
                this.checkPlacementOf(battleship);
            } catch (error) {
                // If orientation is not valid, go back to its previous orientation
                battleship.ship.changeOrientation();

                // Then throw error
                error.message = error.message + ", unable to rotate ship";
                throw error;
            }

            // Return ship index if rotating the ship was successful
            return battleship;
        },

        receiveAttack(row, col) {
            // Error checks
            if (row < 0 || row >= this.size || col < 0 || col >= this.size)
                throw new Error("Invalid coords, found outside of board");
            if (this.playArea[row][col] === true)
                throw new Error("This spot has already been hit");

            // If no errors were thrown, safely update the board
            this.playArea[row][col] = true;

            // Then update the ships if the attack hits and return a boolean value for whether a ship was hit or not
            return updateShips.call(this, row, col);
        },

        randomize(ships = []) {
            // Error checks
            if (ships.length === 0 && this.ships.length === 0)
                throw new Error(
                    "Randomize has no effect, consider adding some ships",
                );

            // Combine 'ships' with ships on board
            const allShips = ships.concat(this.ships.map(s => s.ship));

            // Remove all ships on board
            this.reset();

            while (true) {
                const startTime = new Date();

                allShips.forEach(ship => {
                    while (true) {
                        // If the loop is taking too long, exit the loop
                        const timeNow = new Date();
                        if (timeNow - startTime >= 250) {
                            break;
                        }

                        let battleship;
                        try {
                            // Put ship on random location
                            battleship = this.putShip(
                                ship,
                                randFrom(0, 9),
                                randFrom(0, 9),
                            );
                            // With a 50% chance, change ship orientation
                            if (randFrom(0, 1)) this.rotateShip(battleship);
                        } catch (e) {
                            this.removeShip(battleship);
                            continue;
                        }
                        break;
                    }
                });

                // If the forEach loop was taking too long, restart the whole randomize process again
                const timeNow = new Date();
                if (timeNow - startTime >= 250) {
                    this.reset();
                    continue;
                } else {
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
            return this.ships.every(battleShip => battleShip.ship.isSunk());
        },

        reset() {
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

    const gameboard = Object.assign(Object.create(boardProto), {
        size,
        playArea,
        ships: [],
    });

    return Object.freeze(gameboard);
}

function isGameboard(gameboard) {
    return (
        gameboard.hasOwnProperty("size") &&
        gameboard.hasOwnProperty("playArea") &&
        gameboard.hasOwnProperty("ships") &&
        Object.getPrototypeOf(gameboard) === boardProto
    );
}

// This allows external modules to import individual functions
export { createGameboard, createBattleShip, isGameboard };

// This allows external modules to import all functions as a single object
export default { createGameboard, createBattleShip, isGameboard };

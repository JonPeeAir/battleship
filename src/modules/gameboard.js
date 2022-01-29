import { intersectionWith as intersect, isEqual, findIndex } from "lodash";
import events from "events";
import { isShip } from "./ship";

const battleShipProto = {
    get coords() {
        const coords = [];
        for (let i = 0; i < this.ship.length; i++) {
            if (this.ship.orientation === "h") {
                coords.push([this.headX + i, this.headY]);
            } else if (this.ship.orientation === "v") {
                coords.push([this.headX, this.headY + i]);
            }
        }
        return coords;
    },
};

function createBattleShip(ship, headX, headY) {
    // Basically a ship object with data about its location on the board
    const battleShip = { ship, headX, headY };
    return Object.assign(Object.create(battleShipProto), battleShip);
}

const boardProto = (() => {
    // Private helper method
    function shipCollidesWithOtherShips(battleShip) {
        for (let i = 0; i < this.ships.length; i++) {
            const thisCoords = battleShip.coords;
            const shipsCoords = this.ships[i].coords;
            if (intersect(thisCoords, shipsCoords, isEqual).length > 0) {
                return true;
            }
        }
        return false;
    }

    // Private helper method
    function shipCrossesTheBorders(battleShip) {
        const coords = battleShip.coords;
        for (let i = 0; i < coords.length; i++) {
            if (coords[i].some(v => v < 0 || v >= this.size)) {
                return true;
            }
        }
        return false;
    }

    // Private helper method
    function updateShips(xPos, yPos) {
        this.ships.forEach(battleShip => {
            const attackHits = battleShip.coords.some(v =>
                isEqual(v, [xPos, yPos]),
            );
            const hitIndex = findIndex(battleShip.coords, item =>
                isEqual(item, [xPos, yPos]),
            );

            if (attackHits) {
                battleShip.ship.hitShip(hitIndex);
                // Alert subscribers of ship update if the attack hits
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

        putShip(ship, headX, headY) {
            if (this.set) {
                throw new Error(
                    "Cannot put anymore ships when the board is set",
                );
            }
            if (!isShip(ship)) {
                throw new Error("Invalid ship passed to Gameboard.putShip");
            }

            const battleShip = createBattleShip(ship, headX, headY);

            // Function.call allows us to pass the context of "this" to the Function
            // We do this because shipCrossesTheBorder() and shipCollidesWithOtherShips() need to know the context of "this"
            if (shipCrossesTheBorders.call(this, battleShip)) {
                throw new Error(
                    "Ship found outside the borders, unable to put ship",
                );
            }
            if (shipCollidesWithOtherShips.call(this, battleShip)) {
                throw new Error(
                    "Ship collides with other ships, unable to put ship",
                );
            }

            // Push the battleShip if no errors were thrown
            this.ships.push(battleShip);

            // Return ship index if putting battleShip was successful
            return this.ships.length - 1;
        },

        moveShip(shipIndex, headX, headY) {
            if (this.set) {
                throw new Error("Cannot move ship when the board is set");
            }
            if (shipIndex < 0 || shipIndex >= this.ships.length) {
                throw new Error(
                    `Ship at index [${shipIndex}] does not exist, unable to move ship`,
                );
            }

            // Pop the ship from ships array and store into battleShip
            const battleShip = this.ships.splice(shipIndex, 1)[0];

            // Save a reference to the old head coords
            const oldX = battleShip.headX;
            const oldY = battleShip.headY;

            // Update the battleShip with the new head coords
            battleShip.headX = headX;
            battleShip.headY = headY;

            // Test collision
            if (shipCrossesTheBorders.call(this, battleShip)) {
                // New coords collide with borders so revert back to old coords
                battleShip.headX = oldX;
                battleShip.headY = oldY;

                // And put the battleShip back in the array
                this.ships.splice(shipIndex, 0, battleShip);

                throw new Error(
                    "Ship found outside the borders, unable to put ship",
                );
            }

            if (shipCollidesWithOtherShips.call(this, battleShip)) {
                // New coords collide with other ships so revert back to old coords
                battleShip.headX = oldX;
                battleShip.headY = oldY;

                // And put the battleShip back in the array
                this.ships.splice(shipIndex, 0, battleShip);

                throw new Error(
                    "Ship collides with other ships, unable to move ship",
                );
            }

            // If no errors were thrown, we can safely put moved battleShip back into array
            this.ships.splice(shipIndex, 0, battleShip);

            // And return ship index if moving the ship was successful
            return shipIndex;
        },

        rotateShip(shipIndex) {
            if (this.set) {
                throw new Error("Cannot rotate ship when the board is set");
            }
            if (shipIndex < 0 || shipIndex >= this.ships.length) {
                throw new Error(
                    `Ship at index [${shipIndex}] does not exist, unable to rotate ship`,
                );
            }

            // Pop the ship from ships array and store into shipObj
            const battleShip = this.ships.splice(shipIndex, 1)[0];

            // Attempt to rotate Ship
            battleShip.ship.changeOrientation();

            // Test collision
            if (shipCrossesTheBorders.call(this, battleShip)) {
                // Put ship back to its previous orientation
                battleShip.ship.changeOrientation();
                // Then put it back in the array
                this.ships.splice(shipIndex, 0, battleShip);

                throw new Error(
                    "Ship found outside the borders, unable to rotate ship",
                );
            }
            if (shipCollidesWithOtherShips.call(this, battleShip)) {
                // Put ship back to its previous orientation
                battleShip.ship.changeOrientation();
                // Then put it back in the array
                this.ships.splice(shipIndex, 0, battleShip);

                throw new Error(
                    "Ship collides with other ships, unable to rotate ship",
                );
            }

            // If no errors were thrown, we can safely put rotated battleShip back into array
            this.ships.splice(shipIndex, 0, battleShip);

            // Return ship index if rotating the ship was successful
            return shipIndex;
        },

        receiveAttack(xPos, yPos) {
            if (!this.set) {
                throw new Error("Cannot receive attack unless board is set");
            }
            if (xPos < 0 || xPos >= this.size) {
                throw new Error("Invalid xPos");
            }
            if (yPos < 0 || yPos >= this.size) {
                throw new Error("Invalid yPos");
            }
            if (this.playArea[xPos][yPos] === true) {
                throw new Error("This spot has already been hit");
            }

            // If no errors were thrown, safely update the board
            this.playArea[xPos][yPos] = true;

            // Then alert subscribers of a board update
            this.event.emit("boardUpdate");

            // Then update the ships if the attack hits
            updateShips.call(this, xPos, yPos);
        },

        hasLost() {
            if (!this.set) {
                throw new Error(
                    "Cannot determine win status unless board is set",
                );
            }
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
    const size = 10;
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
export { createGameboard, isGameboard };

// This allows external modules to import all functions as a single object
export default { createGameboard, isGameboard };

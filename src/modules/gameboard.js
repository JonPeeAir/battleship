import events from "events";

const gameboardProto = {
    width: 10,
    height: 10,

    receiveAttack(xPos, yPos) {
        this.playArea[xPos][yPos] = true;
        this.checkAndUpdateShips(xPos, yPos);

        this.eventEmitter.emit("boardUpdate");
    },

    checkAndUpdateShips(xPos, yPos) {
        this.ships.forEach(shipObj => {
            if (shipObj.ship.orientation === "h") {
                if (shipObj.yPos === yPos) {
                    if (
                        xPos >= shipObj.xPos &&
                        xPos < shipObj.xPos + shipObj.ship.length
                    ) {
                        shipObj.ship.hitShip(xPos - shipObj.xPos);
                    }
                }
            } else if (shipObj.ship.orientation === "v") {
                if (shipObj.xPos === xPos) {
                    if (
                        yPos >= shipObj.yPos &&
                        yPos < shipObj.yPos + shipObj.ship.length
                    ) {
                        shipObj.ship.hitShip(yPos - shipObj.yPos);
                    }
                }
            }
        });
    },

    checkIfAllShipsHaveSunk() {
        for (let i = 0; i < gameboard.ships.length; i++) {
            if (!gameboard.ships[i].ship.isSunk()) {
                console.log("There are still ships left");
                return false;
            }
        }

        console.log("All ships have sunk");
        return true;
    },

    set() {
        // this permanently sets the gameboard so that it becomes uneditable
        delete this.putShip;
        this.ships.forEach(shipObj => {
            delete shipObj.ship.changeOrientation;
        });
    },
};

function gameboardFactory() {
    const grid = new Array(gameboardProto.height);
    for (let i = 0; i < grid.length; i++) {
        grid[i] = new Array(gameboardProto.width).fill(false);
    }

    const gameboard = Object.assign(Object.create(gameboardProto), {
        playArea: grid,
        ships: [],
        putShip(ship, xPos, yPos) {
            const shipObj = { ship, xPos, yPos };
            this.ships.push(shipObj);
        },
        eventEmitter: new events.EventEmitter(),
    });

    gameboard.eventEmitter.on("boardUpdate", gameboard.checkIfAllShipsHaveSunk);

    return gameboard;
}

export { gameboardFactory };

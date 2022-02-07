import { createGameboard } from "./gameboard";
import { createShip } from "./ship";

const playerProto = (() => {
    function shipAlreadyInBoard(ship, gameboard) {
        return gameboard.ships.some(battleship => {
            return battleship.ship === ship;
        });
    }

    function findShipInBoard(ship, gameboard) {
        return gameboard.ships.find(battleship => {
            return battleship.ship === ship;
        });
    }

    return {
        placeShip(shipIndex, headRow, headCol) {
            if (shipIndex < 0 || shipIndex >= this.fleet.length) {
                throw new Error("The ship at shipIndex doesn't exist");
            }
            const ship = this.fleet[shipIndex];
            const board = this.gameboard;
            if (
                board.shipCrossesTheBorders(ship, headRow, headCol) ||
                board.shipCollidesWithOtherShips(ship, headRow, headCol)
            ) {
                throw new Error("Ship position is invalid; unable to put ship");
            }

            // If no errors were thrown
            if (shipAlreadyInBoard(ship, board)) {
                // Update existing ship on board
                findShipInBoard(ship, board).hRow = headRow;
                findShipInBoard(ship, board).hCol = headCol;
            } else {
                board.putShip(ship, headRow, headCol);
            }
        },

        attack(oppGameboard, row, col) {},
    };
})();

function createPlayer(name) {
    const player = Object.assign(Object.create(playerProto), {
        name,
        gameboard: createGameboard(),
        fleet: new Array(10),
    });

    // Initialize player.fleet with default set of ships
    for (let i = 0; i < 4; i++) {
        player.fleet[i] = createShip(1);
    }
    for (let i = 0; i < 3; i++) {
        player.fleet[i + 4] = createShip(2);
    }
    player.fleet[7] = createShip(3);
    player.fleet[8] = createShip(3);
    player.fleet[9] = createShip(4);

    return player;
}

export { createPlayer };
export default { createPlayer };

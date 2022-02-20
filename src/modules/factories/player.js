import { createGameboard } from "./gameboard";
import { createShip } from "./ship";

const playerProto = (() => {
    return {
        isReady() {
            return this.fleet.every(ship => {
                return this.gameboard.ships.some(battleship => {
                    return battleship.ship === ship;
                });
            });
        },

        attack(player, row, col) {
            if (!isPlayer(player)) {
                throw new Error("Invalid player passed in to attack");
            }

            if (!player.isReady()) {
                throw new Error("Cannot attack a player that is not ready");
            }

            if (player === this) {
                throw new Error("Cannot attack itself");
            }

            // If no errors were thrown, proceed with the attack
            return player.gameboard.receiveAttack(row, col);
        },

        hasLost() {
            return this.fleet.every(ship => ship.isSunk());
        },

        reset() {
            this.gameboard.reset();
            this.fleet.forEach(ship => ship.reset());
        },
    };
})();

function createDefaultFleet() {
    const fleet = new Array(10);
    for (let i = 0; i < 4; i++) {
        fleet[i] = createShip(1);
    }
    for (let i = 0; i < 3; i++) {
        fleet[i + 4] = createShip(2);
    }
    fleet[7] = createShip(3);
    fleet[8] = createShip(3);
    fleet[9] = createShip(4);

    return fleet;
}

function createPlayer(name) {
    const player = Object.assign(Object.create(playerProto), {
        name,
        gameboard: createGameboard(),
        fleet: createDefaultFleet(),
    });

    return player;
}

function isPlayer(player) {
    return (
        player.hasOwnProperty("name") &&
        player.hasOwnProperty("gameboard") &&
        player.hasOwnProperty("fleet") &&
        playerProto.isPrototypeOf(player)
    );
}

export { createPlayer, isPlayer };
export default { createPlayer, isPlayer };

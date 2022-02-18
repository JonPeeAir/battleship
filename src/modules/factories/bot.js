import { createPlayer } from "./player";

function createShipInfo(row, col) {
    return { row, col, direction: undefined, oppDirection: false };
}

function isValidShipInfo(shipInfo) {
    return (
        // shipInfo instanceof Object &&
        shipInfo.hasOwnProperty("row") &&
        shipInfo.hasOwnProperty("col") &&
        shipInfo.hasOwnProperty("direction") &&
        shipInfo.hasOwnProperty("oppDirection")
    );
}

const botProto = (() => {
    // Private helper method
    function randFrom(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);

        // Returns random int from min to max
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    // Private helper method
    function getOppDir(dir) {
        console.log(dir);
        return dir === "top" ? "bottom" : dir === "bottom" ? "top" : dir === "left" ? "right" : "left";
    }

    // Private helper method
    function outOfBoard(row, col, size) {
        return row < 0 || row >= size || col < 0 || col >= size;
    }

    const playerProto = Object.getPrototypeOf(createPlayer("bot"));
    // Extend playerProto with a new attack() method
    return Object.assign(Object.create(playerProto), {
        smartAttack(enemy) {
            let moveData = {};

            if (this.foundShip) {
                console.log("Make smart move");

                const fsRow = this.foundShip.row;
                const fsCol = this.foundShip.col;
                const possibleMoves = {
                    top: [-1, 0],
                    left: [0, -1],
                    bottom: [1, 0],
                    right: [0, 1],
                };

                if (this.foundShip.direction) {
                    const dirName = this.foundShip.direction;
                    const dirValue = possibleMoves[dirName];

                    if (this.foundShip.oppDirection) {
                        // YES foundShip, foundShip.direction, foundShip.oppDirection
                        let row = fsRow + dirValue[0];
                        let col = fsCol + dirValue[1];

                        while (true) {
                            if (outOfBoard(row, col, enemy.gameboard.size)) {
                                console.log("Found ship is completely destroyed, making random move");
                                this.foundShip = undefined;
                                moveData = this.randomAttack(enemy);
                                break;
                            } else {
                                try {
                                    const hit = this.attack(enemy, row, col);
                                    if (!hit) {
                                        console.log("Found ship is now completely destroyed");
                                        this.foundShip = undefined;
                                    }
                                    moveData = { hit, row, col };
                                    break;
                                } catch (error) {
                                    console.log(`Cannot attack ${row}, ${col}`);
                                    row += dirValue[0];
                                    col += dirValue[1];
                                    continue;
                                }
                            }
                        }
                    } else {
                        // YES foundShip, foundShip.direction
                        let row = fsRow + dirValue[0];
                        let col = fsCol + dirValue[1];

                        while (true) {
                            if (outOfBoard(row, col, enemy.gameboard.size)) {
                                this.foundShip.direction = getOppDir(dirName);
                                this.foundShip.oppDirection = true;

                                // Attack one unit in the opposite direction
                                const newDirName = this.foundShip.direction;
                                const newDirValue = possibleMoves[newDirName];
                                let row = fsRow + newDirValue[0];
                                let col = fsCol + newDirValue[1];

                                if (outOfBoard(row, col, enemy.gameboard.size)) {
                                    console.log("Found ship is completely destroyed, making random move");
                                    this.foundShip = undefined;
                                    moveData = this.randomAttack(enemy);
                                    break;
                                } else {
                                    try {
                                        const hit = this.attack(enemy, row, col);
                                        if (!hit) {
                                            console.log("Found ship is now completely destroyed");
                                            this.foundShip = undefined;
                                        }
                                        moveData = { hit, row, col };
                                    } catch (error) {
                                        console.log("Found ship is completely destroyed, making random move");
                                        this.foundShip = undefined;
                                        moveData = this.randomAttack(enemy);
                                    }
                                }
                                break;
                            } else {
                                try {
                                    const hit = this.attack(enemy, row, col);
                                    if (!hit) {
                                        this.foundShip.direction = getOppDir(dirName);
                                        this.foundShip.oppDirection = true;
                                    }
                                    moveData = { hit, row, col };
                                    break;
                                } catch (error) {
                                    console.log(error);
                                    console.log(`Cannot attack ${row}, ${col}`);
                                    row += dirValue[0];
                                    col += dirValue[1];
                                    continue;
                                }
                            }
                        }
                    }
                } else {
                    // YES foundShip
                    let smartAttackSuccess = false;
                    for (const direction in possibleMoves) {
                        const row = fsRow + possibleMoves[direction][0];
                        const col = fsCol + possibleMoves[direction][1];
                        try {
                            const hit = this.attack(enemy, row, col);
                            if (hit) {
                                this.foundShip.direction = direction;
                            }
                            smartAttackSuccess = true;
                            moveData = { hit, row, col };
                            break;
                        } catch (error) {
                            console.log(error);
                            console.log(`Cannot attack ${row}, ${col}`);
                            continue;
                        }
                    }
                    if (!smartAttackSuccess) {
                        console.log("Found ship is completely destroyed, making random move");
                        moveData = this.randomAttack(enemy);
                    }
                }
            } else {
                // NO foundShip
                moveData = this.randomAttack(enemy);
            }

            enemy.gameboard.visualizeBoard();
            return moveData;
        },

        randomAttack(enemy) {
            console.log("make random move");

            while (true) {
                const row = randFrom(0, 9);
                const col = randFrom(0, 9);
                let hit;
                try {
                    hit = this.attack(enemy, row, col);
                    if (hit) {
                        this.foundShip = createShipInfo(row, col);
                    }
                } catch (e) {
                    continue;
                }
                return { hit, row, col };
            }
        },
    });
})();

function createBot() {
    let foundShip = undefined;

    // Create a bot object with the properties of a player object together with an additional
    // property called "foundShip" with a prototype of botProto
    const bot = Object.assign(Object.create(botProto), createPlayer("bot"), {
        foundShip,
    });

    // Ensure the foundShip property is only either a shipInfo object or undefined
    Object.defineProperty(bot, "foundShip", {
        get: () => foundShip,
        set: shipInfo => {
            if (shipInfo === undefined || isValidShipInfo(shipInfo)) {
                foundShip = shipInfo;
            } else {
                throw new Error("Invalid shipInfo passed to Bot.foundShip");
            }
        },
    });

    // Randomize fleet placement to ensure bot is already ready before returning it
    bot.gameboard.randomize(bot.fleet);

    return bot;
}

function isBot(bot) {
    return (
        bot.hasOwnProperty("name") &&
        bot.hasOwnProperty("gameboard") &&
        bot.hasOwnProperty("fleet") &&
        bot.hasOwnProperty("foundShip") &&
        botProto.isPrototypeOf(bot)
    );
}

export { createBot, isBot };
export default { createBot, isBot };

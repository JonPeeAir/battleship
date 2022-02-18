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
        const oppDirections = {
            top: "bottom",
            bottom: "top",
            left: "right",
            right: "left",
        };
        return oppDirections[dir];
    }

    // Private helper method
    function outOfBoard(row, col, size) {
        return row < 0 || row >= size || col < 0 || col >= size;
    }

    // Private helper method
    // shipInfo must have a direction to use this method
    function shipIsDestroyed(board, shipInfo, moveData) {
        const possibleMoves = {
            top: [-1, 0],
            left: [0, -1],
            bottom: [1, 0],
            right: [0, 1],
        };

        const dirName = shipInfo.direction;
        const dirValue = possibleMoves[dirName];

        const fsRow = shipInfo.row;
        const fsCol = shipInfo.col;

        const hit = moveData.hit;
        const thisRow = moveData.row;
        const thisCol = moveData.col;

        let shipIsDestroyed = false;

        if (shipInfo.oppDirection) {
            if (hit) {
                const nextRow = thisRow + dirValue[0];
                const nextCol = thisCol + dirValue[1];
                const nextCell =
                    board[nextRow] === undefined
                        ? undefined
                        : board[nextRow][nextCol];
                if (nextCell === undefined || nextCell === true) {
                    shipIsDestroyed = true;
                }
            } else {
                shipIsDestroyed = true;
            }
        } else {
            if (hit) {
                const nextRow = thisRow + dirValue[0];
                const nextCol = thisCol + dirValue[1];
                const nextCell =
                    board[nextRow] === undefined
                        ? undefined
                        : board[nextRow][nextCol];
                if (nextCell === undefined || nextCell === true) {
                    const oppDirName = getOppDir(dirName);
                    const oppDirValue = possibleMoves[oppDirName];

                    const oppRow = fsRow + oppDirValue[0];
                    const oppCol = fsCol + oppDirValue[1];
                    const oppCell =
                        board[oppRow] === undefined
                            ? undefined
                            : board[oppRow][oppCol];

                    if (oppCell === undefined || oppCell === true) {
                        shipIsDestroyed = true;
                    }
                }
            } else {
                const oppDirName = getOppDir(dirName);
                const oppDirValue = possibleMoves[oppDirName];

                const oppRow = fsRow + oppDirValue[0];
                const oppCol = fsCol + oppDirValue[1];
                const oppCell =
                    board[oppRow] === undefined
                        ? undefined
                        : board[oppRow][oppCol];

                if (oppCell === undefined || oppCell === true) {
                    shipIsDestroyed = true;
                }
            }
        }

        return shipIsDestroyed;
    }

    const playerProto = Object.getPrototypeOf(createPlayer("bot"));
    // Extend playerProto and add new methods
    return Object.assign(Object.create(playerProto), {
        smartAttack(enemy) {
            let moveData = {};

            if (this.foundShip && this.foundShip.oppDirection) {
                const fsRow = this.foundShip.row;
                const fsCol = this.foundShip.col;
                const possibleMoves = {
                    top: [-1, 0],
                    left: [0, -1],
                    bottom: [1, 0],
                    right: [0, 1],
                };

                const dirName = this.foundShip.direction;
                const dirValue = possibleMoves[dirName];

                let row = fsRow + dirValue[0];
                let col = fsCol + dirValue[1];

                while (true) {
                    // Ship is destroyed but you need to make a move, so make random move;
                    if (outOfBoard(row, col, enemy.gameboard.size)) {
                        this.foundShip = undefined;
                        moveData = this.randomAttack(enemy);
                        break;
                    } else {
                        try {
                            // This line make throw an error
                            const hit = this.attack(enemy, row, col);

                            // The lines below will run if no errors were thrown
                            moveData = { hit, row, col };
                            const board = enemy.gameboard.playArea;
                            const shipInfo = this.foundShip;

                            if (hit) {
                                console.log(
                                    "Checking",
                                    dirName,
                                    "and hit",
                                    row,
                                    col,
                                );
                            } else {
                                console.log(
                                    "Checking",
                                    dirName,
                                    "and missed",
                                    row,
                                    col,
                                );
                            }

                            if (shipIsDestroyed(board, shipInfo, moveData)) {
                                this.foundShip = undefined;
                            }

                            break;
                        } catch (error) {
                            row += dirValue[0];
                            col += dirValue[1];
                            continue;
                        }
                    }
                }
            } else if (this.foundShip && this.foundShip.direction) {
                const fsRow = this.foundShip.row;
                const fsCol = this.foundShip.col;
                const possibleMoves = {
                    top: [-1, 0],
                    left: [0, -1],
                    bottom: [1, 0],
                    right: [0, 1],
                };

                const dir = this.foundShip.direction;
                const dirValue = possibleMoves[dir];

                let nRow = fsRow + dirValue[0];
                let nCol = fsCol + dirValue[1];

                while (true) {
                    // If coords are out of board, attack one unit in the opposite direction
                    if (outOfBoard(nRow, nCol, enemy.gameboard.size)) {
                        this.foundShip.direction = getOppDir(dir);
                        this.foundShip.oppDirection = true;

                        const oppDir = getOppDir(dir);
                        const newDirValue = possibleMoves[oppDir];
                        let oppRow = fsRow + newDirValue[0];
                        let oppCol = fsCol + newDirValue[1];

                        // Ship is destroyed but you need to make a move, so make a random move
                        if (outOfBoard(oppRow, oppCol, enemy.gameboard.size)) {
                            this.foundShip = undefined;
                            moveData = this.randomAttack(enemy);
                            break;
                        } else {
                            try {
                                // This line may throw an error
                                const hit = this.attack(enemy, oppRow, oppCol);

                                // The lines below will run if no errors were thrown
                                moveData = { hit, row: oppRow, col: oppCol };
                                if (!hit) this.foundShip = undefined;
                            } catch (error) {
                                // If you can't hit one unit in the opposite direction, ship should now be destroyed
                                // So make a random move
                                this.foundShip = undefined;
                                moveData = this.randomAttack(enemy);
                            }
                        }
                        // Break in the end since we only need to attack in the opposite direction once
                        break;
                    } else {
                        try {
                            // This line might throw an error
                            const hit = this.attack(enemy, nRow, nCol);

                            // The lines below will run if no errors were thrown
                            moveData = { hit, row: nRow, col: nCol };
                            const move = moveData;

                            const board = enemy.gameboard.playArea;
                            const shipInfo = this.foundShip;
                            const nNRow = nRow + dirValue[0];
                            const nNCol = nCol + dirValue[1];
                            const nCell =
                                board[nNRow] === undefined
                                    ? undefined
                                    : board[nNRow][nNCol];

                            if (hit) {
                                console.log(
                                    "Continued",
                                    dir,
                                    "and hit",
                                    nRow,
                                    nCol,
                                );
                                if (shipIsDestroyed(board, shipInfo, move)) {
                                    this.foundShip = undefined;
                                } else if (
                                    nCell === undefined ||
                                    nCell === true
                                ) {
                                    this.foundShip.direction = getOppDir(dir);
                                    this.foundShip.oppDirection = true;
                                }
                            } else if (!hit) {
                                console.log(
                                    "Continued",
                                    dir,
                                    "and missed",
                                    nRow,
                                    nCol,
                                );
                                if (shipIsDestroyed(board, shipInfo, move)) {
                                    this.foundShip = undefined;
                                } else {
                                    this.foundShip.direction = getOppDir(dir);
                                    this.foundShip.oppDirection = true;
                                }
                            }

                            break;
                        } catch (error) {
                            nRow += dirValue[0];
                            nCol += dirValue[1];
                            continue;
                        }
                    }
                }
            } else if (this.foundShip) {
                const fsRow = this.foundShip.row;
                const fsCol = this.foundShip.col;
                const possibleMoves = {
                    top: [-1, 0],
                    left: [0, -1],
                    bottom: [1, 0],
                    right: [0, 1],
                };

                let smartAttackSuccess = false;
                for (const direction in possibleMoves) {
                    const dirValue = possibleMoves[direction];
                    const row = fsRow + dirValue[0];
                    const col = fsCol + dirValue[1];
                    try {
                        // This line may throw an error
                        const hit = this.attack(enemy, row, col);

                        // The line below will run if no errors were thrown
                        moveData = { hit, row, col };
                        const board = enemy.gameboard.playArea;
                        const nRow = row + dirValue[0];
                        const nCol = col + dirValue[1];
                        console.log(board, { nRow, nCol });
                        const nCell =
                            board[nRow] === undefined
                                ? undefined
                                : board[nRow][nCol];
                        console.log({ nCell });

                        if (hit) {
                            console.log(
                                "Attacked",
                                direction,
                                "and hit",
                                row,
                                col,
                            );
                            this.foundShip.direction = direction;
                            const shipInfo = this.foundShip;

                            if (shipIsDestroyed(board, shipInfo, moveData)) {
                                this.foundShip = undefined;
                            } else if (nCell === undefined || nCell === true) {
                                this.foundShip.direction = getOppDir(direction);
                                this.foundShip.oppDirection = true;
                            }
                        } else {
                            console.log(
                                "Attacked",
                                direction,
                                "and missed",
                                row,
                                col,
                            );
                        }
                        smartAttackSuccess = true;
                        break;
                    } catch (error) {
                        if (error instanceof TypeError) {
                            console.log(error, row, col);
                        }
                        continue;
                    }
                }

                // If all possible moves are not available, then the ship must already be destroyed
                // so make a random move
                if (!smartAttackSuccess) {
                    this.foundShip = undefined;
                    moveData = this.randomAttack(enemy);
                }
            } else {
                // There is no foundShip so do a random move
                moveData = this.randomAttack(enemy);
            }

            // enemy.gameboard.visualizeBoard();
            return moveData;
        },

        randomAttack(enemy) {
            let moveData = {};
            while (true) {
                // Get random coords
                const row = randFrom(0, 9);
                const col = randFrom(0, 9);
                try {
                    // This line may throw an error
                    const hit = this.attack(enemy, row, col);
                    // The lines below only run if no errors were thrown
                    if (hit) {
                        console.log("Found ship from random move", row, col);
                        this.foundShip = createShipInfo(row, col);
                    } else {
                        console.log("Made random move", row, col);
                    }
                    moveData = { hit, row, col };
                    break;
                } catch (e) {
                    // If there is an error, try to get a new location
                    continue;
                }
            }

            return moveData;
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

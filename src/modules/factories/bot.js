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
    function shipIsDestroyed(board, shipInfo, moveData) {
        // Initialize shipIsDestroyed to false
        let shipIsDestroyed = false;

        const possibleMoves = {
            top: [-1, 0],
            left: [0, -1],
            bottom: [1, 0],
            right: [0, 1],
        };

        // Info about the first found cell in found ship
        const fsRow = shipInfo.row;
        const fsCol = shipInfo.col;

        // Info about the attack
        const hit = moveData.hit;
        const thisRow = moveData.row;
        const thisCol = moveData.col;

        // This case is only applicable when direction is undefined
        let everyPossibleMoveIsTaken = true;
        for (const direction in possibleMoves) {
            const dirValue = possibleMoves[direction];
            const row = fsRow + dirValue[0];
            const col = fsCol + dirValue[1];
            const cell = board[row] ? board[row][col] : undefined;
            if (cell === false) everyPossibleMoveIsTaken = false;
        }

        if (!shipInfo.direction) {
            if (everyPossibleMoveIsTaken) shipIsDestroyed = true;
            return shipIsDestroyed;
        }

        // The code below is for when direction is defined
        // Info about the ship direction
        const dirName = shipInfo.direction;
        const dirValue = possibleMoves[dirName];

        // Info about one cell in the same direction
        const nRow = thisRow + dirValue[0];
        const nCol = thisCol + dirValue[1];
        const nCell = board[nRow] ? board[nRow][nCol] : undefined;

        // Info about one cell in the opposite direction from found ship cell
        const oppDirName = getOppDir(dirName);
        const oppDirValue = possibleMoves[oppDirName];
        const oppRow = fsRow + oppDirValue[0];
        const oppCol = fsCol + oppDirValue[1];
        const oppCell = board[oppRow] ? board[oppRow][oppCol] : undefined;

        // Made these variables for readability
        const checkingOppDir = shipInfo.oppDirection;
        const nextCellTaken = nCell === undefined || nCell;
        const oppCellTaken = oppCell === undefined || oppCell;

        // Cases where a ship is considered fully destroyed, given that direction is defined
        const case1 = checkingOppDir && hit && nextCellTaken;
        const case2 = checkingOppDir && !hit;
        const case3 = !checkingOppDir && hit && nextCellTaken && oppCellTaken;
        const case4 = !checkingOppDir && !hit && oppCellTaken;

        if (case1 || case2 || case3 || case4) {
            shipIsDestroyed = true;
        }

        return shipIsDestroyed;
    }

    const playerProto = Object.getPrototypeOf(createPlayer("bot"));
    // Extend playerProto and add new methods
    return Object.assign(Object.create(playerProto), {
        smartAttack(enemy) {
            let moveData = {};

            // CASE: No foundShip
            if (!this.foundShip) {
                return this.randomAttack(enemy);
            }

            const fsRow = this.foundShip.row;
            const fsCol = this.foundShip.col;
            const possibleMoves = {
                top: [-1, 0],
                left: [0, -1],
                bottom: [1, 0],
                right: [0, 1],
            };

            // CASE: foundShip but direction is unknown
            if (this.foundShip && !this.foundShip.direction) {
                for (const direction in possibleMoves) {
                    const dirVal = possibleMoves[direction];
                    const row = fsRow + dirVal[0];
                    const col = fsCol + dirVal[1];

                    try {
                        // This line may throw an error
                        const hit = this.attack(enemy, row, col);

                        // The line below will run if no errors were thrown
                        moveData = { hit, row, col };

                        const board = enemy.gameboard.playArea;
                        const nR = row + dirVal[0]; // next row
                        const nC = col + dirVal[1]; // next col
                        const nCell = board[nR] ? board[nR][nC] : undefined;
                        const nCellTaken = nCell === undefined || nCell;

                        if (hit) {
                            this.foundShip.direction = direction;
                        }

                        if (shipIsDestroyed(board, this.foundShip, moveData)) {
                            this.foundShip = undefined;
                        } else if (hit && nCellTaken) {
                            this.foundShip.direction = getOppDir(direction);
                            this.foundShip.oppDirection = true;
                        }

                        break;
                    } catch (error) {
                        continue;
                    }
                }

                return moveData;
            }

            const dir = this.foundShip.direction;
            const dirValue = possibleMoves[dir];

            let row = fsRow + dirValue[0];
            let col = fsCol + dirValue[1];

            // CASE: foundShip and direction is known but we haven't checked the opposite direction yet
            if (
                this.foundShip &&
                this.foundShip.direction &&
                !this.foundShip.oppDirection
            ) {
                while (true) {
                    // If coords are out of board, change directions, and attack
                    // one unit in the opposite direction
                    if (outOfBoard(row, col, enemy.gameboard.size)) {
                        this.foundShip.direction = getOppDir(dir);
                        this.foundShip.oppDirection = true;
                        moveData = this.smartAttack(enemy);
                        break;
                    } else {
                        try {
                            // This line might throw an error
                            const hit = this.attack(enemy, row, col);

                            // The lines below will run if no errors were thrown
                            moveData = { hit, row, col };
                            const move = moveData;

                            const board = enemy.gameboard.playArea;
                            const shipInfo = this.foundShip;
                            const nR = row + dirValue[0]; // next row
                            const nC = col + dirValue[1]; // next col
                            const nCell = board[nR] ? board[nR][nC] : undefined;
                            const nCellTaken = nCell === undefined || nCell;

                            if (shipIsDestroyed(board, shipInfo, moveData)) {
                                this.foundShip = undefined;
                            } else if (!hit || (hit && nCellTaken)) {
                                this.foundShip.direction = getOppDir(dir);
                                this.foundShip.oppDirection = true;
                            }

                            break;
                        } catch (error) {
                            row += dirValue[0];
                            col += dirValue[1];
                            continue;
                        }
                    }
                }

                return moveData;
            }

            // CASE: foundShip, direction is known, and we are now checking the opposite direction
            if (this.foundShip && this.foundShip.oppDirection) {
                while (true) {
                    // If coords are out of the board, the ship should now be
                    // destroyed. But you need to make a move so make a random
                    // move
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
            }

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
                    moveData = { hit, row, col };
                    if (hit) {
                        this.foundShip = createShipInfo(row, col);
                        const board = enemy.gameboard.playArea;
                        if (shipIsDestroyed(board, this.foundShip, moveData)) {
                            this.foundShip = undefined;
                        }
                    }

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

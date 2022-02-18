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
                            // If it doesn't hit, ship should now be destroyed
                            if (!hit) this.foundShip = undefined;
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
            } else if (this.foundShip && this.foundShip.direction) {
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
                    // If coords are out of board, attack one unit in the opposite direction
                    if (outOfBoard(row, col, enemy.gameboard.size)) {
                        this.foundShip.direction = getOppDir(dirName);
                        this.foundShip.oppDirection = true;

                        const newDirName = this.foundShip.direction;
                        const newDirValue = possibleMoves[newDirName];
                        let row = fsRow + newDirValue[0];
                        let col = fsCol + newDirValue[1];

                        // Ship is destroyed but you need to make a move, so make a random move
                        if (outOfBoard(row, col, enemy.gameboard.size)) {
                            this.foundShip = undefined;
                            moveData = this.randomAttack(enemy);
                            break;
                        } else {
                            try {
                                // This line may throw an error
                                const hit = this.attack(enemy, row, col);

                                // The lines below will run if no errors were thrown
                                // If it doesn't hit, ship should now be destroyed
                                if (!hit) this.foundShip = undefined;
                                moveData = { hit, row, col };
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
                            const hit = this.attack(enemy, row, col);

                            // The lines below will run if no errors were thrown
                            // If it doesn't hit, check if one unit in the other direction is available
                            if (!hit) {
                                this.foundShip.direction = getOppDir(dirName);
                                this.foundShip.oppDirection = true;

                                const newDirName = this.foundShip.direction;
                                const newDirValue = possibleMoves[newDirName];
                                let row = fsRow + newDirValue[0];
                                let col = fsCol + newDirValue[1];

                                const enemyPlayArea = enemy.gameboard.playArea;

                                // If one unit in the opposite direction is unavailable,
                                // The ship should now be completely destroyed
                                if (
                                    enemyPlayArea[row][col] === true ||
                                    enemyPlayArea[row][col] === undefined
                                ) {
                                    this.foundShip = undefined;
                                }
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
                    const row = fsRow + possibleMoves[direction][0];
                    const col = fsCol + possibleMoves[direction][1];
                    try {
                        const hit = this.attack(enemy, row, col);
                        if (hit) {
                            this.foundShip.direction = direction;

                            // Check if attacking one more cell in the same direction is possible
                            const newRow = row + possibleMoves[direction][0];
                            const newCol = col + possibleMoves[direction][1];

                            const enemyPlayArea = enemy.gameboard.playArea;

                            // If attacking one more cell in the same direction is not possible...
                            // then the ship must be completely destroyed
                            if (
                                enemyPlayArea[newRow][newCol] === true ||
                                enemyPlayArea[newRow][newCol] === undefined
                            ) {
                                this.foundShip = undefined;
                            }
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

                // If all possible moves are not available, then the ship must already be destroyed
                // so make a random move
                if (!smartAttackSuccess) {
                    moveData = this.randomAttack(enemy);
                }
            } else {
                // There is no foundShip so do a random move
                moveData = this.randomAttack(enemy);
            }

            // if (this.foundShip) {
            //     console.log("Make smart move");

            //     const fsRow = this.foundShip.row;
            //     const fsCol = this.foundShip.col;
            //     const possibleMoves = {
            //         top: [-1, 0],
            //         left: [0, -1],
            //         bottom: [1, 0],
            //         right: [0, 1],
            //     };

            //     if (this.foundShip.direction) {
            //         const dirName = this.foundShip.direction;
            //         const dirValue = possibleMoves[dirName];

            //         if (this.foundShip.oppDirection) {
            //             // YES foundShip, foundShip.direction, foundShip.oppDirection
            //             let row = fsRow + dirValue[0];
            //             let col = fsCol + dirValue[1];

            //             while (true) {
            //                 if (outOfBoard(row, col, enemy.gameboard.size)) {
            //                     console.log("Found ship is completely destroyed, making random move");
            //                     this.foundShip = undefined;
            //                     moveData = this.randomAttack(enemy);
            //                     break;
            //                 } else {
            //                     try {
            //                         const hit = this.attack(enemy, row, col);
            //                         if (!hit) {
            //                             console.log("Found ship is now completely destroyed");
            //                             this.foundShip = undefined;
            //                         }
            //                         moveData = { hit, row, col };
            //                         break;
            //                     } catch (error) {
            //                         console.log(`Cannot attack ${row}, ${col}`);
            //                         row += dirValue[0];
            //                         col += dirValue[1];
            //                         continue;
            //                     }
            //                 }
            //             }
            //         } else {
            //             // YES foundShip, foundShip.direction
            //             let row = fsRow + dirValue[0];
            //             let col = fsCol + dirValue[1];

            //             while (true) {
            //                 if (outOfBoard(row, col, enemy.gameboard.size)) {
            //                     this.foundShip.direction = getOppDir(dirName);
            //                     this.foundShip.oppDirection = true;

            //                     // Attack one unit in the opposite direction
            //                     const newDirName = this.foundShip.direction;
            //                     const newDirValue = possibleMoves[newDirName];
            //                     let row = fsRow + newDirValue[0];
            //                     let col = fsCol + newDirValue[1];

            //                     if (outOfBoard(row, col, enemy.gameboard.size)) {
            //                         console.log("Found ship is completely destroyed, making random move");
            //                         this.foundShip = undefined;
            //                         moveData = this.randomAttack(enemy);
            //                         break;
            //                     } else {
            //                         try {
            //                             const hit = this.attack(enemy, row, col);
            //                             if (!hit) {
            //                                 console.log("Found ship is now completely destroyed");
            //                                 this.foundShip = undefined;
            //                             }
            //                             moveData = { hit, row, col };
            //                         } catch (error) {
            //                             console.log("Found ship is completely destroyed, making random move");
            //                             this.foundShip = undefined;
            //                             moveData = this.randomAttack(enemy);
            //                         }
            //                     }
            //                     break;
            //                 } else {
            //                     try {
            //                         const hit = this.attack(enemy, row, col);
            //                         if (!hit) {
            //                             this.foundShip.direction = getOppDir(dirName);
            //                             this.foundShip.oppDirection = true;
            //                         }
            //                         moveData = { hit, row, col };
            //                         break;
            //                     } catch (error) {
            //                         console.log(error);
            //                         console.log(`Cannot attack ${row}, ${col}`);
            //                         row += dirValue[0];
            //                         col += dirValue[1];
            //                         continue;
            //                     }
            //                 }
            //             }
            //         }
            //     } else {
            //         // YES foundShip
            //         let smartAttackSuccess = false;
            //         for (const direction in possibleMoves) {
            //             const row = fsRow + possibleMoves[direction][0];
            //             const col = fsCol + possibleMoves[direction][1];
            //             try {
            //                 const hit = this.attack(enemy, row, col);
            //                 if (hit) {
            //                     this.foundShip.direction = direction;
            //                 }
            //                 smartAttackSuccess = true;
            //                 moveData = { hit, row, col };
            //                 break;
            //             } catch (error) {
            //                 console.log(error);
            //                 console.log(`Cannot attack ${row}, ${col}`);
            //                 continue;
            //             }
            //         }
            //         if (!smartAttackSuccess) {
            //             console.log("Found ship is completely destroyed, making random move");
            //             moveData = this.randomAttack(enemy);
            //         }
            //     }
            // } else {
            //     // NO foundShip
            //     moveData = this.randomAttack(enemy);
            // }

            enemy.gameboard.visualizeBoard();
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
                    if (hit) this.foundShip = createShipInfo(row, col);
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

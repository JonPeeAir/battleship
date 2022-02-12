import Gameboard, {
    createBattleShip,
} from "../src/modules/factories/gameboard";

// For ship related gameboard methods
import { createShip } from "../src/modules/factories/ship";

test("createGameboard returns an object", () => {
    expect(Gameboard.createGameboard()).toBeInstanceOf(Object);
});

test("createGameboard returns a Gameboard object", () => {
    const gameboard = Gameboard.createGameboard();

    // Test instance properties
    expect(gameboard).toHaveProperty("size");
    expect(gameboard).toHaveProperty("playArea");
    expect(gameboard).toHaveProperty("ships");
    expect(gameboard).toHaveProperty("set");
    expect(gameboard).toHaveProperty("event");

    // Test prototype properties
    const gbProto = Object.getPrototypeOf(gameboard);
    expect(gbProto).toHaveProperty("setBoard");
    expect(gbProto).toHaveProperty("unsetBoard");
    expect(gbProto).toHaveProperty("checkPlacementOf");
    expect(gbProto).toHaveProperty("putShip");
    expect(gbProto).toHaveProperty("removeShip");
    expect(gbProto).toHaveProperty("moveShip");
    expect(gbProto).toHaveProperty("rotateShip");
    expect(gbProto).toHaveProperty("randomize");
    expect(gbProto).toHaveProperty("receiveAttack");
    expect(gbProto).toHaveProperty("hasLost");
    expect(gbProto).toHaveProperty("reset");

    // Also test it on the isGameboard function
    expect(Gameboard.isGameboard(gameboard)).toBe(true);
});

test("isGameboard returns true when given a gameboard", () => {
    const gameboard = Gameboard.createGameboard();
    expect(Gameboard.isGameboard(gameboard)).toBe(true);
});

test("isGameboard returns false when given a non-gameboard", () => {
    const nonGameboard = {
        playArea: [[false]],
        ships: [],
        set: false,
        event: {},
    };
    expect(Gameboard.isGameboard(nonGameboard)).toBe(false);
});

describe("Gameboard object related tests", () => {
    let gameboard;

    beforeEach(() => {
        gameboard = Gameboard.createGameboard();
    });

    describe("Gameboard.size", () => {
        test("is set to 10", () => {
            expect(gameboard.size).toBe(10);
        });

        test("is non-writable", () => {
            expect(() => (gameboard.size = 0)).toThrow();
        });
    });

    describe("Gameboard.playArea", () => {
        test("is initialized to a 10x10 array filled with false values", () => {
            expect(gameboard.playArea.length).toBe(10);

            gameboard.playArea.forEach(column => {
                expect(column.length).toBe(10);

                column.forEach(area => {
                    expect(area).toBe(false);
                });
            });
        });
    });

    describe("Gameboard.ships", () => {
        test("is initialized to an empty array", () => {
            expect(gameboard.ships).toEqual(new Array());
        });
    });

    describe("Gameboard.set", () => {
        test("is initialized to false", () => {
            expect(gameboard.set).toBe(false);
        });
    });

    describe("Gameboard.event", () => {
        test("is an EventEmitter object", () => {
            expect(gameboard.event.constructor.name).toBe("EventEmitter");
        });

        test("No two Gameboards have the same event object", () => {
            const gameboard2 = Gameboard.createGameboard();
            expect(gameboard.event == gameboard2.event).toBe(false);
        });
    });
});

describe("Gameboard prototype tests", () => {
    let gameboard;
    beforeEach(() => {
        gameboard = Gameboard.createGameboard();
    });

    describe("Gameboard.prototype.setBoard", () => {
        test("sets Gameboard.set to true", () => {
            gameboard.setBoard();
            expect(gameboard.set).toBe(true);
        });
    });

    describe("Gameboard.prototype.unsetBoard", () => {
        test("sets Gameboard.set to false", () => {
            gameboard.setBoard();
            expect(gameboard.set).toBe(true);

            gameboard.unsetBoard();
            expect(gameboard.set).toBe(false);
        });
    });

    describe("Gameboard.prototype.checkPlacementOf", () => {
        test("does nothing when the ship placement is valid", () => {
            const battleship = createBattleShip(createShip(3), 0, 0);
            expect(() => gameboard.checkPlacementOf(battleship)).not.toThrow();
        });

        test("throws an error when a given ship is placed outside of the board", () => {
            const battleship = createBattleShip(createShip(3), 0, 8);
            expect(() => gameboard.checkPlacementOf(battleship)).toThrow();
        });

        test("throws an error when given a ship that LESS than one unit from other ships", () => {
            gameboard.putShip(createShip(3), 0, 0);
            const battleship = createBattleShip(createShip(3), 1, 0);
            expect(() => gameboard.checkPlacementOf(battleship)).toThrow();
        });

        test("works for battleships that are not on the board", () => {
            // Ship is not on the board
            const battleship = createBattleShip(createShip(3), 0, 0);

            // Does not throw when placement is valid
            expect(() => gameboard.checkPlacementOf(battleship)).not.toThrow();

            // Throws when the ship crosses the borders
            battleship.hRow = 0;
            battleship.hCol = 8;
            expect(() => gameboard.checkPlacementOf(battleship)).toThrow();

            // Throws when the ship is LESS than one unit away from other ships
            gameboard.putShip(createShip(3), 0, 0);
            battleship.hRow = 1;
            battleship.hCol = 0;
            expect(() => gameboard.checkPlacementOf(battleship)).toThrow();
        });

        test("works for battleships that are already placed on the board", () => {
            // Ship is on the board
            const battleship = gameboard.putShip(createShip(3), 0, 0);

            // Does not throw when placement is valid
            expect(() => gameboard.checkPlacementOf(battleship)).not.toThrow();

            // Throws when the ship crosses the borders
            battleship.hRow = 0;
            battleship.hCol = 8;
            expect(() => gameboard.checkPlacementOf(battleship)).toThrow();

            // Throws when the ship is LESS than one unit away from other ships
            gameboard.putShip(createShip(3), 2, 0);
            battleship.hRow = 1;
            battleship.hCol = 0;
            expect(() => gameboard.checkPlacementOf(battleship)).toThrow();
        });
    });

    describe("Gameboard.prototype.putShip", () => {
        test("adds a ship to Gameboard.ships together with the coords of its head element", () => {
            const ship = createShip(4);
            gameboard.putShip(ship, 1, 1);

            expect(gameboard.ships[0]).toMatchObject({
                ship: {
                    length: 4,
                    hit: [false, false, false, false],
                    orientation: "h",
                },
                hRow: 1,
                hCol: 1,
            });
        });

        test("throws an error when trying to put a ship on a set board", () => {
            const ship = createShip(3);
            gameboard.setBoard();
            expect(() => gameboard.putShip(ship, 0, 0)).toThrow();
        });

        test("throws an error when passed in a non-ship", () => {
            const nonShip = {
                length: 4,
                hit: new Array(4).fill(false),
                orientation: "h",
            };

            expect(() => gameboard.putShip(nonShip, 0, 0)).toThrow();
        });

        test("throws an error when passed in coords outside of the board", () => {
            const ship = createShip(3);
            expect(() => gameboard.putShip(ship, -1, 0)).toThrow();
            expect(() => gameboard.putShip(ship, 0, -1)).toThrow();
            expect(() => gameboard.putShip(ship, -1, -1)).toThrow();
            expect(() => gameboard.putShip(ship, 10, 9)).toThrow();
            expect(() => gameboard.putShip(ship, 9, 10)).toThrow();
            expect(() => gameboard.putShip(ship, 10, 10)).toThrow();
        });

        test("throws an error when passed in coords that are LESS than 1 unit away from other ships", () => {
            gameboard.putShip(createShip(3), 0, 0);
            expect(() => gameboard.putShip(createShip(3), 1, 0)).toThrow();
        });
    });

    describe("Gameboard.prototype.removeShip", () => {
        test("removes a given ship from Gameboard.ships and returns the removed ship", () => {
            expect(gameboard.ships.length).toBe(0);
            const battleship = gameboard.putShip(createShip(3), 0, 0);
            expect(gameboard.ships.length).toBe(1);
            expect(gameboard.removeShip(battleship)).toBe(battleship);
            expect(gameboard.ships.length).toBe(0);
        });

        test("returns undefined if the given ship is not in Gameboard.ships", () => {
            const battleship = createBattleShip(createShip(3), 0, 0);
            expect(gameboard.removeShip(battleship)).toBe(undefined);
            expect(gameboard.ships.length).toBe(0);
        });
    });

    describe("Gameboard.prototype.moveShip", () => {
        test("moves a given ship to a specified location", () => {
            const battleship = gameboard.putShip(createShip(3), 0, 0);
            expect(gameboard.ships[0].hRow).toBe(0);
            expect(gameboard.ships[0].hCol).toBe(0);

            gameboard.moveShip(battleship, 1, 0);
            expect(gameboard.ships[0].hRow).toBe(1);
            expect(gameboard.ships[0].hCol).toBe(0);

            gameboard.moveShip(battleship, 1, 1);
            expect(gameboard.ships[0].hRow).toBe(1);
            expect(gameboard.ships[0].hCol).toBe(1);
        });

        test("throws an error when trying to move a ship on a set board", () => {
            const battleship = gameboard.putShip(createShip(3), 0, 0);
            gameboard.setBoard();
            expect(() => gameboard.moveShip(battleship, 1, 0)).toThrow();
        });

        test("throws an error when the given ship that has not been placed on the board", () => {
            const battleship = createBattleShip(createShip(3), 0, 0);
            expect(() => gameboard.moveShip(battleship, 1, 0)).toThrow();
        });

        test("throws an error when the given coords cross go outside the board", () => {
            const battleship1 = gameboard.putShip(createShip(3), 0, 0);
            expect(() => gameboard.moveShip(battleship1, 0, 8)).toThrow();

            const battleship2 = gameboard.putShip(createShip(3), 2, 0);
            gameboard.rotateShip(battleship2);
            expect(() => gameboard.moveShip(battleship2, 8, 0)).toThrow();
        });

        test("throws an error when the given coords that are LESS than 1 unit away from other ships", () => {
            const battleship1 = gameboard.putShip(createShip(3), 0, 0);
            const battleship2 = gameboard.putShip(createShip(3), 2, 0);
            expect(() => gameboard.moveShip(battleship1, 1, 0)).toThrow();
        });
    });

    describe("Gameboard.prototyp.rotateShip", () => {
        test("rotates a given ship", () => {
            const battleship = gameboard.putShip(createShip(3), 0, 0);
            expect(gameboard.ships[0].ship.orientation).toBe("h");

            gameboard.rotateShip(battleship);

            expect(gameboard.ships[0].ship.orientation).toBe("v");
        });

        test("throws an error when trying to rotate a ship on a set board", () => {
            const battleship = gameboard.putShip(createShip(3), 0, 0);
            gameboard.setBoard();
            expect(() => gameboard.rotateShip(battleship)).toThrow();
        });

        test("throws an error when the given ship has not been placed on the board", () => {
            expect(() => gameboard.rotateShip(createShip(3))).toThrow();
        });

        test("throws an error if rotating the ship causes it to cross outside the board", () => {
            const battleship1 = gameboard.putShip(createShip(3), 9, 0);
            expect(() => gameboard.rotateShip(battleship1)).toThrow();

            const battleship2 = gameboard.putShip(createShip(3), 0, 0);
            gameboard.rotateShip(battleship2);
            gameboard.moveShip(battleship2, 0, 9);
            expect(() => gameboard.rotateShip(battleship2)).toThrow();
        });

        test("throws an error if rotating the ship interferes with other ships", () => {
            const battleship1 = gameboard.putShip(createShip(3), 0, 0);
            const battleship2 = gameboard.putShip(createShip(2), 2, 0);
            expect(() => gameboard.rotateShip(battleship1)).toThrow();
        });
    });

    describe("Gameboard.prototype.randomize", () => {
        test("randomizes the ships on the board", () => {
            const battleship = gameboard.putShip(createShip(3), 0, 0);
            expect(gameboard.ships[0]).toBe(battleship);
            gameboard.randomize();
            expect(gameboard.ships[0]).not.toBe(battleship);
        });

        test("if given an optional parameter array 'ships', randomizes the ships on board including added ships", () => {
            const battleship = gameboard.putShip(createShip(3), 0, 0);
            expect(gameboard.ships[0]).toBe(battleship);
            expect(gameboard.ships.length).toBe(1);
            gameboard.randomize([createShip(3), createShip(3)]);
            expect(gameboard.ships[0]).not.toBe(battleship);
            expect(gameboard.ships.length).toBe(3);
        });

        test("if there are no ships on board but an array of ships was given, randomly place these ships on the board", () => {
            expect(gameboard.ships.length).toBe(0);
            const ships = [createShip(1), createShip(2), createShip(3)];
            gameboard.randomize(ships);
            expect(gameboard.ships.length).toBe(3);
        });

        test("throws an error if there are no ships to randomize and no optional 'ships' array was given", () => {
            expect(() => gameboard.randomize()).toThrow();
        });

        test("throws an error if the board is alread set", () => {
            gameboard.setBoard();
            expect(() => gameboard.randomize()).toThrow();
        });
    });

    describe("Gameboard.prototype.receiveAttack", () => {
        test("correctly updates the playArea", () => {
            gameboard.setBoard();
            gameboard.receiveAttack(1, 1);
            expect(gameboard.playArea[1][1]).toBe(true);
        });

        test("updates Gameboard.ships if the attack hits", () => {
            const ship = createShip(3);
            gameboard.putShip(ship, 0, 0);
            gameboard.setBoard();

            gameboard.receiveAttack(0, 0);
            expect(gameboard.ships[0].ship.hit[0]).toBe(true);
        });

        test("makes no changes to Gameboard.ships if the attack doesn't hit", () => {
            const ship = createShip(3);
            gameboard.putShip(ship, 0, 0);
            gameboard.setBoard();

            gameboard.receiveAttack(0, 1);
            expect(gameboard.ships[0].ship.hit[0]).toBe(false);
        });

        test("throws an error when the board is not set", () => {
            expect(() => gameboard.receiveAttack(1, 1)).toThrow();
            expect(gameboard.playArea[1][1]).toBe(false);

            gameboard.setBoard();

            gameboard.receiveAttack(1, 1);
            expect(gameboard.playArea[1][1]).toBe(true);
        });
    });

    describe("Gameboard.prototype.hasLost", () => {
        test("returns true when all ships have sunk", () => {
            gameboard.putShip(createShip(2), 0, 0);
            gameboard.setBoard();

            gameboard.receiveAttack(0, 0);
            gameboard.receiveAttack(0, 1);

            expect(gameboard.hasLost()).toBe(true);
        });

        test("returns false when not all ships have sunk", () => {
            const ship = createShip(2);
            gameboard.putShip(ship, 0, 0);
            gameboard.setBoard();

            gameboard.receiveAttack(0, 0);

            expect(gameboard.hasLost()).toBe(false);
        });

        test("throws an error when the board is not set", () => {
            expect(() => gameboard.hasLost()).toThrow();
            gameboard.setBoard();
            expect(() => gameboard.hasLost()).not.toThrow();
        });
    });

    describe("Gameboard.prototype.reset", () => {
        test("factory resets a gameboard", () => {
            // Mess around with gameboard
            const ship = createShip(3);
            const ship2 = createShip(4);
            gameboard.putShip(ship, 0, 0);
            gameboard.putShip(ship2, 2, 1);
            gameboard.setBoard();
            gameboard.receiveAttack(0, 0);

            // Reset gameboard
            gameboard.reset();

            // Check Gameboard.playArea
            expect(gameboard.playArea.length).toBe(10);
            gameboard.playArea.forEach(column => {
                expect(column.length).toBe(10);

                column.forEach(area => {
                    expect(area).toBe(false);
                });
            });

            // Check Gameboard.ships
            expect(gameboard.ships).toEqual(new Array());

            // Check Gameboard.set
            expect(gameboard.set).toBe(false);
        });
    });
});

import Gameboard from "../src/modules/gameboard";

// For ship related gameboard methods
import { createShip } from "../src/modules/ship";

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
    expect(gbProto).toHaveProperty("putShip");
    expect(gbProto).toHaveProperty("moveShip");
    expect(gbProto).toHaveProperty("rotateShip");
    expect(gbProto).toHaveProperty("setBoard");
    expect(gbProto).toHaveProperty("unsetBoard");
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

    describe("Gameboard.size tests", () => {
        test("Gameboard.size is set to 10", () => {
            expect(gameboard.size).toBe(10);
        });

        test("Gameboard.size is non-writable", () => {
            expect(() => (gameboard.size = 0)).toThrow();
        });
    });

    describe("Gameboard.playArea tests", () => {
        test("Gameboard.playArea is initialized to a 10x10 array filled with false values", () => {
            expect(gameboard.playArea.length).toBe(10);

            gameboard.playArea.forEach(column => {
                expect(column.length).toBe(10);

                column.forEach(area => {
                    expect(area).toBe(false);
                });
            });
        });

        test("Gameboard.prototype.receiveAttack() correctly updates the playArea", () => {
            gameboard.setBoard();
            gameboard.receiveAttack(1, 1);
            expect(gameboard.playArea[1][1]).toBe(true);
        });
    });

    describe("Gameboard.ships tests", () => {
        test("Gameboard.ships is initialized to an empty array", () => {
            expect(gameboard.ships).toEqual(new Array());
        });

        test("Gameboard.prototype.putShip() adds a ship to Gameboard.ships together with the coords of its head element", () => {
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

        test("Gameboard.prototype.receiveAttack() updates Gameboard.ships if the attack hits", () => {
            const ship = createShip(3);
            gameboard.putShip(ship, 0, 0);
            gameboard.setBoard();

            gameboard.receiveAttack(0, 0);
            expect(gameboard.ships[0].ship.hit[0]).toBe(true);
        });

        test("Gameboard.prototype.receiveAttack() makes no changes to Gameboard.ships if the attack doesn't hit", () => {
            const ship = createShip(3);
            gameboard.putShip(ship, 0, 0);
            gameboard.setBoard();

            gameboard.receiveAttack(0, 1);
            expect(gameboard.ships[0].ship.hit[0]).toBe(false);
        });

        test("Gameboard.prototype.randomize() throws an error if there are no ships to randomize", () => {
            expect(() => gameboard.randomize()).toThrow();
        });

        test("Gameboard.prototype.hasLost() returns true when all ships have sunk", () => {
            gameboard.putShip(createShip(2), 0, 0);
            gameboard.setBoard();

            gameboard.receiveAttack(0, 0);
            gameboard.receiveAttack(0, 1);

            expect(gameboard.hasLost()).toBe(true);
        });

        test("Gameboard.prototype.hasLost() returns false when not all ships have sunk", () => {
            const ship = createShip(2);
            gameboard.putShip(ship, 0, 0);
            gameboard.setBoard();

            gameboard.receiveAttack(0, 0);

            expect(gameboard.hasLost()).toBe(false);
        });
    });

    describe("Gameboard.set tests", () => {
        test("Gameboard.set is initialized to false", () => {
            expect(gameboard.set).toBe(false);
        });

        test("Gameboard.prototype.setBoard() sets Gameboard.set to true", () => {
            gameboard.setBoard();
            expect(gameboard.set).toBe(true);
        });

        test("Gameboard.prototype.unsetBoard() sets Gameboard.set to false", () => {
            gameboard.setBoard();
            expect(gameboard.set).toBe(true);

            gameboard.unsetBoard();
            expect(gameboard.set).toBe(false);
        });

        test("Gameboard.prototype.putShip() throws an error when trying to put a ship on a set board", () => {
            const ship = createShip(3);
            gameboard.setBoard();
            expect(() => gameboard.putShip(ship, 0, 0)).toThrow();
        });

        test("Gameboard.prototype.moveShip() throws an error when trying to move a ship on a set board", () => {
            const shipIndex = gameboard.putShip(createShip(4), 0, 0);
            gameboard.setBoard();
            expect(() => gameboard.moveShip(shipIndex, 0, 1)).toThrow();
        });

        test("Gameboard.prototype.rotateShip() throws an error when trying to rotate a ship on a set board", () => {
            const shipIndex = gameboard.putShip(createShip(4), 0, 0);
            gameboard.setBoard();
            expect(() => gameboard.rotateShip(shipIndex)).toThrow();
        });

        test("Gameboard.prototype.receiveAttack() throws an error when the board is not set", () => {
            expect(() => gameboard.receiveAttack(1, 1)).toThrow();
            expect(gameboard.playArea[1][1]).toBe(false);

            gameboard.setBoard();

            gameboard.receiveAttack(1, 1);
            expect(gameboard.playArea[1][1]).toBe(true);
        });

        test("Gameboard.prototype.randomize() throws an error when the board is set", () => {
            gameboard.setBoard();
            expect(() => gameboard.randomize()).toThrow();
        });

        test("Gameboard.prototype.hasLost() throws an error when the board is not set", () => {
            expect(() => gameboard.hasLost()).toThrow();
            gameboard.setBoard();
            expect(() => gameboard.hasLost()).not.toThrow();
        });
    });

    describe("Gameboard.event object tests", () => {
        test("Gameboard.event is an EventEmitter object", () => {
            expect(gameboard.event.constructor.name).toBe("EventEmitter");
        });

        test("No two Gameboards have the same event object", () => {
            const gameboard2 = Gameboard.createGameboard();
            expect(gameboard.event == gameboard2.event).toBe(false);
        });
    });

    describe("Other Gameboard.prototype tests", () => {
        test("Gameboard.prototype.putShip() throws an error when passed in a non-ship", () => {
            const nonShip = {
                length: 4,
                hit: new Array(4).fill(false),
                orientation: "h",
            };

            expect(() => gameboard.putShip(nonShip, 0, 0)).toThrow();
        });

        test("Gameboard.prototype.putShip() throws an error when passed in coords outside of the board", () => {
            const ship = createShip(3);
            expect(() => gameboard.putShip(ship, -1, 0)).toThrow();
            expect(() => gameboard.putShip(ship, 0, -1)).toThrow();
            expect(() => gameboard.putShip(ship, -1, -1)).toThrow();
            expect(() => gameboard.putShip(ship, 10, 9)).toThrow();
            expect(() => gameboard.putShip(ship, 9, 10)).toThrow();
            expect(() => gameboard.putShip(ship, 10, 10)).toThrow();
        });

        test("Gameboard.prototype.putShip() throws an error when passed in coords that interfere with other ships", () => {
            gameboard.putShip(createShip(3), 0, 0);
            expect(() => gameboard.putShip(createShip(3), 0, 1)).toThrow();
        });

        test("Gameboard.prototype.moveShip() throws an error when passed in an invalid ship index", () => {
            expect(() => gameboard.moveShip(0, 0, 0)).toThrow();
        });

        test("Gameboard.prototype.moveShip() throws an error when passed in coords that cross outside the board", () => {
            const shipIndex = gameboard.putShip(createShip(3), 0, 0);
            expect(() => gameboard.moveShip(shipIndex, 0, 8)).toThrow();
        });

        test("Gameboard.prototype.moveShip() throws an error when passed in coords that interfere with other ships", () => {
            const ship1 = gameboard.putShip(createShip(3), 0, 0);
            const ship2 = gameboard.putShip(createShip(3), 1, 0);
            expect(() => gameboard.moveShip(ship1, 1, 2)).toThrow();
        });

        test("Gameboard.prototype.rotateShip() throws an error when passed in an invalid ship index", () => {
            expect(() => gameboard.rotateShip(0)).toThrow();
        });

        test("Gameboard.prototype.rotateShip() throws an error if rotating the ship causes it to cross outside the board", () => {
            const shipIndex = gameboard.putShip(createShip(3), 9, 0);
            expect(() => gameboard.rotateShip(shipIndex)).toThrow();
        });

        test("Gameboard.prototype.rotateShip() throws an error if rotating the ship interferes with other ships", () => {
            const ship1 = gameboard.putShip(createShip(3), 0, 0);
            const ship2 = gameboard.putShip(createShip(3), 1, 0);
            expect(() => gameboard.rotateShip(ship1)).toThrow();
        });

        test("Gameboard.prototype.randomize() randomizes the ships on the board", () => {
            gameboard.putShip(createShip(2), 0, 0);
            expect(gameboard.ships[0]).toMatchObject({ hRow: 0, hCol: 0 });
            gameboard.randomize();
            expect(gameboard.ships[0]).not.toMatchObject({
                hRow: 0,
                hCol: 0,
            });
        });

        test("Gameboard.prototype.locateShipsOnBoard() returns a 10x10 array with marked spots of where ships are located", () => {
            gameboard.putShip(createShip(3), 0, 0);
            gameboard.setBoard();
            gameboard.receiveAttack(0, 0);
            expect(gameboard.locateShipsOnBoard()[0][0]).toBe("X");
            expect(gameboard.locateShipsOnBoard()[0][1]).toBe("O");
            expect(gameboard.locateShipsOnBoard()[0][2]).toBe("O");
            expect(gameboard.locateShipsOnBoard()[0][3]).toBe(" ");
        });

        test("Gameboard.prototype.reset() factory resets a gameboard", () => {
            // Mess around with gameboard
            const ship = createShip(3);
            const ship2 = createShip(4);
            gameboard.putShip(ship, 0, 0);
            gameboard.putShip(ship2, 1, 1);
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

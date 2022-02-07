import Player from "../src/modules/factories/player";
import Gameboard from "../src/modules/factories/gameboard";
import { createShip } from "../src/modules/factories/ship";

test("createPlayer returns an object", () => {
    expect(Player.createPlayer("p1")).toBeInstanceOf(Object);
});

test("createPlayer returns a player object", () => {
    const p1 = Player.createPlayer("p1");

    // Test instance properties
    expect(p1).toHaveProperty("name");
    expect(p1).toHaveProperty("gameboard");
    expect(p1).toHaveProperty("fleet");

    // Test if object is set with the correct prototype
    const playerProto = Object.getPrototypeOf(p1);
    expect(playerProto).toHaveProperty("placeShip");
    expect(playerProto).toHaveProperty("attack");
    expect(playerProto).toHaveProperty("hasLost");

    // Also test it on the isPlayer function
    expect(Player.isPlayer(p1)).toBe(true);
});

test("isPlayer returns true when given a player", () => {
    const p1 = Player.createPlayer("p1");
    expect(Player.isPlayer(p1)).toBe(true);
});

test("isPlayer returns false when given a non-player", () => {
    const p1 = {
        name: "p1",
        gameboard: Gameboard.createGameboard(),
        ships: [],
    };
    expect(Player.isPlayer(p1)).toBe(false);
});

describe("Player object related tests", () => {
    let p1, p2;
    beforeEach(() => {
        p1 = Player.createPlayer("p1");
        p2 = Player.createPlayer("p2");
    });

    describe("Player.name tests", () => {
        test("Player.name is set to the correct name", () => {
            expect(p1.name).toBe("p1");
        });
    });

    describe("Player.gameboard tests", () => {
        test("Player.gameboard is a Gameboard object", () => {
            expect(Gameboard.isGameboard(p1.gameboard)).toBe(true);
        });

        test("Player.prototype.placeShip places a ship given its index on the gameboard", () => {
            p1.placeShip(0, 0, 0);
            expect(p1.gameboard.ships[0].ship.length).toBe(1);
            expect(p1.gameboard.ships[0].hRow).toBe(0);
            expect(p1.gameboard.ships[0].hCol).toBe(0);
        });

        test("Player.prototype.placeShip updates the ships coords if a placed ship is passed in", () => {
            p1.placeShip(0, 0, 0);
            expect(p1.gameboard.ships[0].hRow).toBe(0);
            expect(p1.gameboard.ships[0].hCol).toBe(0);

            p1.placeShip(0, 0, 1);
            expect(p1.gameboard.ships[0].hRow).toBe(0);
            expect(p1.gameboard.ships[0].hCol).toBe(1);
        });

        test("Player.prototype.placeShip throws an error when given an invalid ship index", () => {
            expect(() => p1.placeShip(-1, 0, 0)).toThrow();
            expect(() => p1.placeShip(10, 0, 0)).toThrow();
        });

        test("Player.prototype.placeShip throws an error when given invalid coords", () => {
            expect(() => p1.placeShip(0, -1, 0)).toThrow();
            expect(() => p1.placeShip(0, 10, 0)).toThrow();
            expect(() => p1.placeShip(0, 0, -1)).toThrow();
            expect(() => p1.placeShip(0, 0, 10)).toThrow();
            expect(() => p1.placeShip(0, -1, -1)).toThrow();
            expect(() => p1.placeShip(0, 10, 10)).toThrow();
        });

        test("Player.prototype.placeShip throws an error when trying to place ship on top of another ship", () => {
            p1.placeShip(0, 0, 0);
            expect(() => p1.placeShip(1, 0, 0)).toThrow();
        });
    });

    describe("Player.fleet tests", () => {
        test("Player.fleet has four length 1 ships", () => {
            for (let i = 0; i < 4; i++) {
                expect(p1.fleet[i].length).toBe(1);
            }
        });

        test("Player.fleet has three length 2 ships", () => {
            for (let i = 0; i < 3; i++) {
                expect(p1.fleet[i + 4].length).toBe(2);
            }
        });

        test("Player.fleet has two length 3 ships", () => {
            expect(p1.fleet[7].length).toBe(3);
            expect(p1.fleet[8].length).toBe(3);
        });

        test("Player.fleet has one length 4 ship", () => {
            expect(p1.fleet[9].length).toBe(4);
        });

        test("Player.prototype.hasLost returns false when not all of the ships in the fleet have sunk", () => {
            expect(p1.hasLost()).toBe(false);
        });

        test("Player.prototype.hasLost returns true when all ships in the fleet have sunk", () => {
            p1.placeShip(0, 0, 0);
            p1.placeShip(1, 0, 2);
            p1.placeShip(2, 0, 4);
            p1.placeShip(3, 0, 6);

            p1.placeShip(4, 0, 0);
            p1.placeShip(5, 0, 0);
            p1.placeShip(6, 0, 0);

            p1.placeShip(7, 0, 0);
            p1.placeShip(8, 0, 0);

            p1.placeShip(9, 0, 0);

            expect(p1.hasLost()).toBe(true);
        });
    });

    describe("Other Player.prototype tests", () => {
        test("Player.prototype.attack throws an error if player is not ready", () => {
            expect(p1.isReady()).toBe(false);
            expect(() => p1.attack(p2.gameboard, 0, 0)).toThrow();
        });

        test("Player.prototype.attack throws an error when if opponent is not ready", () => {
            // Reset the default fleet to make testing easier
            p1.resetFleet();
            p1.addShip(createShip(1));
            p1.placeShip(0, 0, 0);

            expect(p1.isReady()).toBe(true);
            expect(p2.isReady()).toBe(false);

            expect(() => p1.attack(p2.gameboard, 0, 0)).toThrow();
        });

        test("Player.prototype.attack properly attacks the gamboard of another player", () => {
            // Reset the default fleet to make testing easier
            p1.resetFleet();
            p1.addShip(createShip(1));
            p1.placeShip(0, 0, 0);

            p2.resetFleet();
            p2.addShip(createShip(1));
            p2.placeShip(0, 0, 0);

            expect(p1.isReady()).toBe(true);
            expect(p2.isReady()).toBe(true);

            p1.attack(p2.gameboard, 0, 0);
            expect(p2.gameboard.playArea[0][0]).toBe(true);
        });

        test("Player.prototype.attack throws an error when trying to hit the same spot of a given board", () => {
            // Reset the default fleet to make testing easier
            p1.resetFleet();
            p1.addShip(createShip(1));
            p1.placeShip(0, 0, 0);

            p2.resetFleet();
            p2.addShip(createShip(1));
            p2.placeShip(0, 0, 0);

            expect(p1.isReady()).toBe(true);
            expect(p2.isReady()).toBe(true);

            p1.attack(p2.gameboard, 0, 0);
            expect(() => p1.attack(p2.gameboard, 0, 0)).toThrow();
        });
    });
});

import Player from "../modules/factories/player";
import Gameboard from "../modules/factories/gameboard";
import { createShip } from "../modules/factories/ship";

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
    expect(playerProto).toHaveProperty("isReady");
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
        fleet: [],
    };
    expect(Player.isPlayer(p1)).toBe(false);
});

describe("Player object related tests", () => {
    let p1, p2;
    beforeEach(() => {
        p1 = Player.createPlayer("p1");
        p2 = Player.createPlayer("p2");
    });

    describe("Player.name", () => {
        test("is set to the correct name", () => {
            expect(p1.name).toBe("p1");
        });
    });

    describe("Player.gameboard", () => {
        test("is a Gameboard object", () => {
            expect(Gameboard.isGameboard(p1.gameboard)).toBe(true);
        });
    });

    describe("Player.fleet", () => {
        test("has four length 1 ships by default", () => {
            for (let i = 0; i < 4; i++) {
                expect(p1.fleet[i].length).toBe(1);
            }
        });

        test("has three length 2 ships by default", () => {
            for (let i = 0; i < 3; i++) {
                expect(p1.fleet[i + 4].length).toBe(2);
            }
        });

        test("has two length 3 ships by default", () => {
            expect(p1.fleet[7].length).toBe(3);
            expect(p1.fleet[8].length).toBe(3);
        });

        test("has one length 4 ship by default", () => {
            expect(p1.fleet[9].length).toBe(4);
        });
    });
});

describe("Player.prototype related tests", () => {
    let p1, p2;
    beforeEach(() => {
        p1 = Player.createPlayer("p1");
        p1.fleet = [createShip(2)];

        p2 = Player.createPlayer("p2");
        p2.fleet = [createShip(2)];
    });

    describe("Player.prototype.isReady", () => {
        test("returns true when all ships in the fleet are placed on the board", () => {
            p1.gameboard.putShip(p1.fleet[0], 0, 0);
            expect(p1.isReady()).toBe(true);
        });

        test("return false when not all ships in the fleet are placed in the board", () => {
            expect(p1.isReady()).toBe(false);
        });
    });

    describe("Player.prototype.attack", () => {
        test("attacks the given opponent at given coords", () => {
            p2.gameboard.randomize(p2.fleet);
            expect(p2.isReady()).toBe(true);
            expect(p2.gameboard.playArea[0][0]).toBe(false);
            p1.attack(p2, 0, 0);
            expect(p2.gameboard.playArea[0][0]).toBe(true);
        });

        test("updates the opponents ships if the attack hits", () => {
            p2.gameboard.putShip(p2.fleet[0], 0, 0);
            expect(p2.isReady()).toBe(true);
            expect(p2.gameboard.playArea[0][0]).toBe(false);
            expect(p2.fleet[0].hit[0]).toBe(false);

            p1.attack(p2, 0, 0);

            expect(p2.gameboard.playArea[0][0]).toBe(true);
            expect(p2.fleet[0].hit[0]).toBe(true);
        });

        test("only updates the opponent's playArea if the attack doesn't hit", () => {
            p2.gameboard.putShip(p2.fleet[0], 0, 0);
            expect(p2.isReady()).toBe(true);
            expect(p2.gameboard.playArea[0][0]).toBe(false);
            expect(p2.fleet[0].hit[0]).toBe(false);

            p1.attack(p2, 1, 0);

            expect(p2.gameboard.playArea[1][0]).toBe(true);
            expect(p2.fleet[0].hit[0]).toBe(false);
        });

        test("throws an error when trying to attack a non-player", () => {
            const nonPlayer = { name: "jeff", gameboard: {}, fleet: [] };
            expect(() => p1.attack(nonPlayer, 0, 0)).toThrow();
        });

        test("throws an error when trying to attack a player that is not ready", () => {
            expect(() => p1.attack(p2, 0, 0)).toThrow();
        });

        test("throws an error when trying to attack itself", () => {
            p1.gameboard.randomize(p1.fleet);
            expect(p1.isReady()).toBe(true);

            expect(() => p1.attack(p1, 0, 0)).toThrow();
        });
    });

    describe("Player.prototype.hasLost", () => {
        test("returns true when all ships in the fleet have sunk", () => {
            p1.fleet.forEach(ship => {
                for (let i = 0; i < ship.length; i++) {
                    ship.hitShip(i);
                }
            });
            expect(p1.hasLost()).toBe(true);
        });

        test("returns false when not all ships in the fleet have sunk", () => {
            expect(p1.hasLost()).toBe(false);
        });
    });
});

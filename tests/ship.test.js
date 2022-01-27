import { createShip, isShip } from "../src/modules/ship";

test("shipFactory returns an object", () => {
    expect(createShip(4)).toBeInstanceOf(Object);
});

test("shipFactory returns a ship object", () => {
    const ship = createShip(4);

    // Test instance properties
    expect(ship).toHaveProperty("length");
    expect(ship).toHaveProperty("hit");
    expect(ship).toHaveProperty("orientation");

    // Test if object is set with correct prototype
    const shipProto = Object.getPrototypeOf(ship);
    expect(shipProto).toHaveProperty("hitShip");
    expect(shipProto).toHaveProperty("isSunk");
    expect(shipProto).toHaveProperty("reset");

    // Also test createShip on the isShip function
    expect(isShip(ship)).toBe(true);
});

test("createShip(7) creates a ship with correct length", () => {
    expect(createShip(7).length).toBe(7);
});

test("isShip returns true when given a ship", () => {
    expect(isShip(createShip(4))).toBe(true);
});

test("isShip returns false when given a non-ship", () => {
    const nonShip = {
        length: 4,
        hit: new Array(4).fill(false),
        orientation: "h",
    };
    expect(isShip(nonShip)).toBe(false);
});

describe("Ship object related tests", () => {
    let ship;

    beforeEach(() => {
        ship = createShip(4);
    });

    test("Ship.length returns its length", () => {
        expect(ship.length).toBe(4);
    });

    test("Ship.hit has all values set to false when created", () => {
        expect(ship.hit).toMatchObject([false, false, false, false]);
    });

    test("Ship.orientation is set to 'h' by default", () => {
        expect(ship.orientation).toBe("h");
    });

    test("Ship.changeOrientation() correctly changes Ship.orientation", () => {
        expect(ship.orientation).toBe("h");

        ship.changeOrientation();
        expect(ship.orientation).toBe("v");

        ship.changeOrientation();
        expect(ship.orientation).toBe("h");
    });

    test("Ship.prototype.hitShip() hits the ship at specified index", () => {
        ship.hitShip(2);
        expect(ship.hit[2]).toBe(true);
    });

    test("Ship.prototype.hitShip() throws error when attempting to hit ship at invalid index", () => {
        // Ship length is 4
        expect(() => ship.hitShip(4)).toThrow();
        expect(() => ship.hitShip(-1)).toThrow();
        expect(() => ship.hitShip()).toThrow();
    });

    test("Ship.prototype.isSunk() returns false when ship has not fully sunk", () => {
        expect(ship.isSunk()).toBe(false);
    });

    test("Ship.prototype.isSunk() returns true when ship has fully sunk", () => {
        for (let i = 0; i < ship.length; i++) {
            ship.hitShip(i);
        }

        expect(ship.isSunk()).toBe(true);
    });

    test("Ship.prototype.reset() resets the ships hit values all to false", () => {
        for (let i = 0; i < ship.length; i++) {
            ship.hitShip(i);
        }
        expect(ship.isSunk()).toBe(true);

        ship.reset();
        expect(ship.isSunk()).toBe(false);
    });
});

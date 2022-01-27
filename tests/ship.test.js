import { shipFactory } from "../src/modules/ship";

test("shipFactory returns an object", () => {
    expect(shipFactory(4)).toBeInstanceOf(Object);
});

test("shipFactory returns a ship object", () => {
    expect(shipFactory(4)).toHaveProperty("length");
    expect(shipFactory(4)).toHaveProperty("hit");
    expect(shipFactory(4)).toHaveProperty("hitShip");
    expect(shipFactory(4)).toHaveProperty("isSunk");
});

describe("Ship object related tests", () => {
    test("Ship.length returns its length", () => {
        const testShip4 = shipFactory(4);

        expect(testShip4.length).toBe(4);
    });

    test("Ship.hit has all values set to false when created", () => {
        const testShip4 = shipFactory(4);

        expect(testShip4.hit).toMatchObject([false, false, false, false]);
    });

    test("Ship.orientation is set to 'h' by default", () => {
        const testShip3 = shipFactory(3);

        expect(testShip3.orientation).toBe("h");
    });

    test("Ship.changeOrientation() correctly changes Ship.orientation", () => {
        const testShip3 = shipFactory(3);
        expect(testShip3.orientation).toBe("h");

        testShip3.changeOrientation();
        expect(testShip3.orientation).toBe("v");

        testShip3.changeOrientation();
        expect(testShip3.orientation).toBe("h");
    });

    test("Ship.prototype.hitShip() hits the ship at specified index", () => {
        const testShip4 = shipFactory(4);
        testShip4.hitShip(2);

        expect(testShip4.hit[2]).toBe(true);
    });

    test("Ship.prototype.hitShip() throws error when attempting to hit ship at invalid index", () => {
        const testShip4 = shipFactory(4);

        expect(() => testShip4.hitShip(4)).toThrow();
    });

    test("Ship.prototype.isSunk() returns false when ship has not fully sunk", () => {
        const testShip4 = shipFactory(4);

        expect(testShip4.isSunk()).toBe(false);
    });

    test("Ship.prototype.isSunk() returns true when ship has fully sunk", () => {
        const testShip3 = shipFactory(3);
        testShip3.hitShip(0);
        testShip3.hitShip(1);
        testShip3.hitShip(2);

        expect(testShip3.isSunk()).toBe(true);
    });

    test("Ship.prototype.reset() resets the ships hit values all to false", () => {
        const testShip3 = shipFactory(3);
        testShip3.hitShip(0);
        testShip3.hitShip(1);
        testShip3.hitShip(2);

        expect(testShip3.isSunk()).toBe(true);

        testShip3.reset();

        expect(testShip3.isSunk()).toBe(false);
    });
});

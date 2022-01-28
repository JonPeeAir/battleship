import Ship from "../src/modules/ship";

test("createShip returns an object", () => {
    expect(Ship.createShip(4)).toBeInstanceOf(Object);
});

test("createShip returns a ship object", () => {
    const ship = Ship.createShip(4);

    // Test instance properties
    expect(ship).toHaveProperty("length");
    expect(ship).toHaveProperty("hit");
    expect(ship).toHaveProperty("orientation");
    expect(ship).toHaveProperty("set");

    // Test if object is set with correct prototype
    const shipProto = Object.getPrototypeOf(ship);
    expect(shipProto).toHaveProperty("changeOrientation");
    expect(shipProto).toHaveProperty("hitShip");
    expect(shipProto).toHaveProperty("isSunk");
    expect(shipProto).toHaveProperty("setShip");
    expect(shipProto).toHaveProperty("unsetShip");
    expect(shipProto).toHaveProperty("reset");

    // Also test if it passes the isShip function
    expect(Ship.isShip(ship)).toBe(true);
});

test("createShip(7) creates a ship with correct length", () => {
    expect(Ship.createShip(7).length).toBe(7);
});

test("isShip returns true when given a ship", () => {
    expect(Ship.isShip(Ship.createShip(4))).toBe(true);
});

test("isShip returns false when given a non-ship", () => {
    const nonShip = {
        length: 4,
        hit: new Array(4).fill(false),
        orientation: "h",
        set: false,
    };
    expect(Ship.isShip(nonShip)).toBe(false);
});

describe("Ship object related tests", () => {
    let ship;

    beforeEach(() => {
        ship = Ship.createShip(4);
    });

    describe("Ship.length tests", () => {
        test("Ship.length returns its length", () => {
            expect(ship.length).toBe(4);
        });

        test("Ship.length cannot be modified", () => {
            expect(() => (ship.length = 5)).toThrow();
        });
    });

    describe("Ship.hit tests", () => {
        test("Ship.hit has all values set to false when created", () => {
            expect(ship.hit).toMatchObject([false, false, false, false]);
        });

        test("Ship.hit cannot be modified", () => {
            expect(() => (ship.hit = [])).toThrow();
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
    });

    describe("Ship.orientation tests", () => {
        test("Ship.orientation is set to 'h' by default", () => {
            expect(ship.orientation).toBe("h");
        });

        test("Ship.orientation throws an error when trying to set it to a value other than 'h' or 'v'", () => {
            expect(() => (ship.orientation = "yeet")).toThrow();
            expect(() => (ship.orientation = "h")).not.toThrow();
        });

        test("Ship.prototype.changeOrientation() correctly changes Ship.orientation", () => {
            expect(ship.orientation).toBe("h");

            ship.changeOrientation();
            expect(ship.orientation).toBe("v");

            ship.changeOrientation();
            expect(ship.orientation).toBe("h");
        });
    });

    describe("Ship.set tests", () => {
        test("Ship.set is set to false by default", () => {
            expect(ship.set).toBe(false);
        });

        test("Ship.set throws an error when trying to set it to a value other than true or false", () => {
            expect(() => (ship.set = "some other value")).toThrow();
            expect(() => (ship.set = true)).not.toThrow();
        });

        test("Ship.prototype.setShip() sets Ship.set to true", () => {
            ship.setShip();
            expect(ship.set).toBe(true);
        });

        test("Ship.prototype.unsetShip() sets Ship.set to false", () => {
            ship.setShip();
            ship.unsetShip();
            expect(ship.set).toBe(false);
        });
    });

    describe("Other Ship.prototype related tests", () => {
        test("Ship.prototype.isSunk() returns false when ship has not fully sunk", () => {
            expect(ship.isSunk()).toBe(false);
        });

        test("Ship.prototype.isSunk() returns true when ship has fully sunk", () => {
            for (let i = 0; i < ship.length; i++) {
                ship.hitShip(i);
            }

            expect(ship.isSunk()).toBe(true);
        });

        test("Ship.prototype.reset() factory resets a ship", () => {
            // Mess around with ship
            ship.changeOrientation();
            expect(ship.orientation).toBe("v");
            ship.setShip();
            expect(ship.set).toBe(true);
            expect(() => ship.changeOrientation()).toThrow();
            for (let i = 0; i < ship.length; i++) {
                ship.hitShip(i);
            }
            expect(ship.isSunk()).toBe(true);

            // Reset the ship
            ship.reset();
            expect(ship.isSunk()).toBe(false);
            expect(ship.hit).toMatchObject([false, false, false, false]);
            expect(ship.set).toBe(false);
            expect(ship.orientation).toBe("h");
            expect(() => ship.changeOrientation()).not.toThrow();
            expect(ship.orientation).toBe("v");
        });
    });
});

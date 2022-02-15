import Ship from "../src/modules/factories/ship";

test("createShip returns an object", () => {
    expect(Ship.createShip(4)).toBeInstanceOf(Object);
});

test("createShip returns a ship object", () => {
    const ship = Ship.createShip(4);

    // Test instance properties
    expect(ship).toHaveProperty("length");
    expect(ship).toHaveProperty("hit");
    expect(ship).toHaveProperty("orientation");

    // Test prototype properties
    const shipProto = Object.getPrototypeOf(ship);
    expect(shipProto).toHaveProperty("changeOrientation");
    expect(shipProto).toHaveProperty("hitShip");
    expect(shipProto).toHaveProperty("isSunk");
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

    describe("Ship.length", () => {
        test("returns its length", () => {
            expect(ship.length).toBe(4);
        });

        test("cannot be modified", () => {
            expect(() => (ship.length = 5)).toThrow();
        });
    });

    describe("Ship.hit", () => {
        test("has all values set to false when created", () => {
            expect(ship.hit).toMatchObject([false, false, false, false]);
        });

        test("cannot be modified", () => {
            expect(() => (ship.hit = [])).toThrow();
        });

        test("has a fixed length", () => {
            expect(() => (ship.hit[4] = false)).toThrow();
        });
    });

    describe("Ship.orientation tests", () => {
        test("is set to 'h' by default", () => {
            expect(ship.orientation).toBe("h");
        });

        test("throws an error when trying to set it to a value other than 'h' or 'v'", () => {
            expect(() => (ship.orientation = "yeet")).toThrow();
            expect(() => (ship.orientation = "h")).not.toThrow();
        });
    });
});

describe("Ship.prototype related tests", () => {
    let ship;
    beforeEach(() => {
        ship = Ship.createShip(4);
    });

    describe("Ship.prototype.changeOrientation", () => {
        test("correctly changes Ship.orientation", () => {
            expect(ship.orientation).toBe("h");

            ship.changeOrientation();
            expect(ship.orientation).toBe("v");

            ship.changeOrientation();
            expect(ship.orientation).toBe("h");
        });
    });

    describe("Ship.prototype.hitShip", () => {
        test("hits the ship at specified index", () => {
            ship.hitShip(2);
            expect(ship.hit[2]).toBe(true);
        });

        test("throws error when attempting to hit ship at invalid index", () => {
            // Ship length is 4
            expect(() => ship.hitShip(4)).toThrow();
            expect(() => ship.hitShip(-1)).toThrow();
            expect(() => ship.hitShip()).toThrow();
        });
    });

    describe("Ship.prototype.isSunk", () => {
        test("returns false when ship has not fully sunk", () => {
            expect(ship.isSunk()).toBe(false);
        });

        test("returns true when ship has fully sunk", () => {
            for (let i = 0; i < ship.length; i++) {
                ship.hitShip(i);
            }

            expect(ship.isSunk()).toBe(true);
        });
    });

    describe("Ship.prototype.reset", () => {
        test("factory resets a ship", () => {
            // Mess around with ship
            ship.changeOrientation();
            expect(ship.orientation).toBe("v");
            for (let i = 0; i < ship.length; i++) {
                ship.hitShip(i);
            }
            expect(ship.isSunk()).toBe(true);

            // Reset the ship
            ship.reset();

            // Test if ship has reset
            expect(ship.isSunk()).toBe(false);
            expect(ship.hit).toMatchObject([false, false, false, false]);
            expect(ship.orientation).toBe("h");
        });
    });
});

const shipProto = {
    changeOrientation() {
        this.orientation = this.orientation === "h" ? "v" : "h";
    },

    hitShip(index) {
        if (index >= 0 && index < this.length) {
            this.hit[index] = true;
        } else {
            throw new Error("Cannot hit ship at forbidden index");
        }
    },

    isSunk() {
        for (let i = 0; i < this.length; i++) {
            if (!this.hit[i]) return false;
        }
        return true;
    },

    reset() {
        this.orientation = "h";
        this.hit.fill(false);
    },
};

function createShip(length) {
    let orientation = "h";

    const ship = Object.assign(Object.create(shipProto), {
        length,
        hit: new Array(length).fill(false),
        orientation,
    });

    // This adds rules on how we can modify some ship properties
    Object.defineProperties(ship, {
        orientation: {
            get: () => orientation,
            set: newOrient => {
                if (newOrient === "h" || newOrient === "v") {
                    orientation = newOrient;
                } else {
                    throw new Error("Invalid assignment to orientation");
                }
            },
        },
    });

    // Ensure ship.hit has a fixed length
    Object.defineProperty(ship.hit, "length", { writable: false });

    // Object.freeze ensures that a ship object is a solid object
    // Meaning it cannot be extended or modified
    // Exceptions however include the rules we defined earlier that allows the modification of some aspects of ship
    return Object.freeze(ship);
}

function isShip(ship) {
    return (
        ship.hasOwnProperty("length") &&
        ship.hasOwnProperty("hit") &&
        ship.hasOwnProperty("orientation") &&
        Object.getPrototypeOf(ship) === shipProto
    );
}

// This allows external modules to import individual functions
export { createShip, isShip };

// This allows external modules to import all functions as a single object
export default { createShip, isShip };

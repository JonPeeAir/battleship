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
        this.hit.fill(false);
    },
};

function createShip(length) {
    return Object.assign(Object.create(shipProto), {
        length,
        hit: new Array(length).fill(false),
        orientation: "h",
    });
}

function isShip(ship) {
    return (
        ship.hasOwnProperty("length") &&
        ship.hasOwnProperty("hit") &&
        ship.hasOwnProperty("orientation") &&
        Object.getPrototypeOf(ship) === shipProto
    );
}

export { createShip, isShip };

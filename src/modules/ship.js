const shipProto = {
    hitShip(index) {
        if (index < this.length) {
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

function shipFactory(length) {
    return Object.assign(Object.create(shipProto), {
        length,
        hit: new Array(length).fill(false),
        orientation: "h",
        // This is NOT a prototype method because we want to remove this when a board is set
        changeOrientation() {
            this.orientation = this.orientation === "h" ? "v" : "h";
        },
    });
}

export { shipFactory };

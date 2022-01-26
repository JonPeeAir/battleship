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
    const ship = Object.create(shipProto);

    ship.length = length;
    ship.hit = new Array(length).fill(false);

    return ship;
}

export { shipFactory };

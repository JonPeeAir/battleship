function shipFactory(length) {
    return {
        length,

        hit: new Array(length).fill(false),

        hitShip(index) {
            this.hit[index] = true;
        },

        isSunk() {
            this.hit.forEach(partHasSunk => {
                if (!partHasSunk) return false;
            });
        },
    };
}

import { gameboardFactory } from "../src/modules/gameboard";

test("gameboardFactory returns an object", () => {
    expect(gameboardFactory()).toBeInstanceOf(Object);
});

describe("Gameboard object related tests", () => {
    test("Gameboard has width of 10", () => {
        const gameboard = gameboardFactory();

        expect(gameboard.width).toBe(10);
    });

    test("Gameboard has height of 10", () => {
        const gameboard = gameboardFactory();

        expect(gameboard.height).toBe(10);
    });
});

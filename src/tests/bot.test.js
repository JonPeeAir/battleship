import { createGameboard } from "../modules/factories/gameboard";
import { createPlayer, isPlayer } from "../modules/factories/player";

import Bot from "../modules/factories/bot";

test("createBot returns an object", () => {
    expect(Bot.createBot()).toBeInstanceOf(Object);
});

test("createBot returns a player object", () => {
    expect(isPlayer(Bot.createBot())).toBe(true);
});

test("createBot returns a Bot object", () => {
    const bot = Bot.createBot();

    // Test instance properties
    expect(bot).toHaveProperty("name");
    expect(bot).toHaveProperty("gameboard");
    expect(bot).toHaveProperty("fleet");
    expect(bot).toHaveProperty("foundShip");

    // Test prototype properties
    const botProto = Object.getPrototypeOf(bot);
    expect(botProto).toHaveProperty("isReady");
    expect(botProto).toHaveProperty("attack");
    expect(botProto).toHaveProperty("smartAttack");
    expect(botProto).toHaveProperty("randomAttack");
    expect(botProto).toHaveProperty("hasLost");

    // Also test it on the isBot function
    expect(Bot.isBot(bot)).toBe(true);
});

test("isBot returns true when given a bot", () => {
    const bot = Bot.createBot();
    expect(Bot.isBot(bot)).toBe(true);
});

test("isBot returns false wen given a nonBot", () => {
    const nonBot = {
        name: "jeff",
        gameboard: createGameboard(),
        fleet: [],
    };

    expect(Bot.isBot(nonBot)).toBe(false);
});

describe("Bot object related tests", () => {
    let bot;
    beforeEach(() => {
        bot = Bot.createBot();
    });

    describe("Bot.foundShip", () => {
        test("is set to undefined by default", () => {
            expect(bot.lastAttack).toBe(undefined);
        });

        test("can only be either a shipInfo object or undefined", () => {
            const shipInfo = {
                row: 0,
                col: 0,
                direction: "left",
                oppDirection: true,
            };

            expect(() => (bot.foundShip = shipInfo)).not.toThrow();
            expect(() => (bot.foundShip = undefined)).not.toThrow();

            expect(() => (bot.foundShip = null)).toThrow();
            expect(() => (bot.foundShip = {})).toThrow();
            expect(() => (bot.foundShip = [])).toThrow();
            expect(() => (bot.foundShip = 1)).toThrow();
            expect(() => (bot.foundShip = "a")).toThrow();
        });
    });
});

describe("Specific Bot.prototype related tests", () => {
    let bot;
    beforeEach(() => {
        bot = Bot.createBot();
    });

    describe("Bot.prototype.smartAttack", () => {
        test("chooses a location on its own, whether it be random or calculated", () => {
            const p1 = createPlayer("p1");
            p1.gameboard.randomize(p1.fleet);
            const playArea = p1.gameboard.playArea;
            expect(playArea.every(r => r.every(c => !c))).toBe(true);

            expect(() => bot.smartAttack(p1)).not.toThrow();

            expect(playArea.every(r => r.every(c => !c))).toBe(false);
        });
    });

    describe("Bot.prototype.isReady", () => {
        test("already returns true when a bot is first created", () => {
            expect(bot.isReady()).toBe(true);
        });
    });
});

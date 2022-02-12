// I should clean this up
function randomizeShips(event) {
    event.target.disabled = true;

    const gameContent = document.getElementById("game-content");
    const player = gameContent.player;

    const gameboardUI = document.getElementById("gameboard");
    const gameboard = gameboardUI.gameboard;

    gameboard.reset();
    gameboard.randomize(player.fleet);
    gameboard.visualizeShips();

    const shipUIs = Array.from(document.getElementsByClassName("ship"));
    shipUIs.forEach(shipUI => {
        const battleship = shipUI.battleship;
        if (battleship.ship.orientation === "v") {
            shipUI.classList.add("vertical-ship");
        } else {
            shipUI.classList.remove("vertical-ship");
        }
        const shipOnBoard = gameboard.ships.find(
            boardship => boardship.ship === battleship.ship,
        );
        const hRow = shipOnBoard.hRow;
        const hCol = shipOnBoard.hCol;

        shipUI.battleship = shipOnBoard;

        const domCells = Array.from(
            document.getElementsByClassName("cell-content"),
        );
        const assignedHeadCell = domCells.find(
            cell => cell.row === hRow && cell.col === hCol,
        );

        shipUI.style.position = "absolute";
        shipUI.style.top = "0px";
        shipUI.style.left = "0px";

        assignedHeadCell.appendChild(shipUI);
    });

    setTimeout(() => (event.target.disabled = false), 0);
}

function resetShips(event) {
    const gameboardUI = document.getElementById("gameboard");
    const gameboard = gameboardUI.gameboard;
    gameboard.reset();

    const shipUIs = Array.from(document.getElementsByClassName("ship"));
    shipUIs.forEach(shipUI => {
        shipUI.classList.remove("vertical-ship");
        shipUI.style.position = "";

        const battleship = shipUI.battleship;
        const ship = battleship.ship;
        battleship.ship.orientation = "h";
        battleship.hRow = undefined;
        battleship.hCol = undefined;

        const shipGroups = Array.from(document.querySelectorAll(".ship-group"));
        const thisGroup = shipGroups.find(shipGroup => {
            return Number(shipGroup.dataset.length) === ship.length;
        });

        thisGroup.appendChild(shipUI);
    });
}

function createGameButtons() {
    const gameBtns = document.createElement("div");
    gameBtns.id = "game-btns";
    gameBtns.classList.add("game-btns");

    const setupBtns = document.createElement("div");
    setupBtns.id = "setup-btns";
    setupBtns.classList.add("setup-btns");

    const randomBtn = document.createElement("button");
    randomBtn.id = "random-btn";
    randomBtn.classList.add("random-btn");
    randomBtn.textContent = "Randomize";
    randomBtn.onclick = randomizeShips;

    const resetBtn = document.createElement("button");
    resetBtn.id = "reset-btn";
    resetBtn.classList.add("reset-btn");
    resetBtn.textContent = "Reset";
    resetBtn.onclick = resetShips;

    setupBtns.append(randomBtn, resetBtn);

    const startBtn = document.createElement("button");
    startBtn.id = "start-btn";
    startBtn.classList.add("start-btn");
    startBtn.disabled = true;
    startBtn.textContent = "START GAME";

    gameBtns.append(setupBtns, startBtn);
    return gameBtns;
}

export { createGameButtons };
export default { createGameButtons };

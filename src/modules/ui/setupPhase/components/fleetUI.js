// Module imports
import Drag from "../../utils/drag";
import { createBattleShip } from "../../../factories/gameboard";

// Asset imports
import InfoIcon from "../../../../assets/info-circle.svg";

function createFleetUI(fleet) {
    // Create fleetUI
    const fleetUI = document.createElement("div");
    fleetUI.id = "fleet";
    fleetUI.classList.add("fleet");
    // Attach fleetUI event listeners
    fleetUI.addEventListener("dragover", Drag.fleetDragOver);
    fleetUI.addEventListener("dragleave", Drag.fleetDragLeave);
    fleetUI.addEventListener("drop", Drag.fleetDrop);

    // Create fleetLabel
    const fleetLabel = document.createElement("h2");
    fleetLabel.innerHTML = `Fleet <span class="fleet-info"> <img src="${InfoIcon}" alt="info-circle" width="20px"/> </span>`;
    fleetUI.appendChild(fleetLabel);

    fleet.forEach(ship => {
        // Create shipUI
        const shipUI = document.createElement("div");
        shipUI.id = `ship${ship.length}${fleet.indexOf(ship)}`;
        shipUI.classList.add("ship");
        shipUI.draggable = true;
        // Attach ship object to shipUI
        shipUI.battleship = createBattleShip(ship, undefined, undefined);
        // Attach shipUI event listeners
        shipUI.addEventListener("dragstart", Drag.dragStartHandler);
        shipUI.addEventListener("click", Drag.onClickHandler);

        for (let i = 0; i < ship.length; i++) {
            // Create shipPart
            const shipPart = document.createElement("div");
            shipPart.classList.add("ship-part");
            // Attach shipPart event listeners
            shipPart.addEventListener("mousedown", Drag.mouseDownHandler);

            shipUI.appendChild(shipPart);
        }

        // Find/Create shipGroup for this ship
        let shipGroups =
            Array.from(fleetUI.querySelectorAll(".ship-group")) || [];

        const shipHasAShipGroup = shipGroups.some(shipGroup => {
            return Number(shipGroup.dataset.length) === ship.length;
        });

        if (!shipHasAShipGroup) {
            // Create a ship group for this ship
            const shipGroup = document.createElement("div");
            shipGroup.classList.add("ship-group");
            shipGroup.dataset.length = ship.length;
            fleetUI.appendChild(shipGroup);

            // Update shipGroups array
            shipGroups = Array.from(fleetUI.querySelectorAll(".ship-group"));
        }

        const thisShipGroup = shipGroups.find(shipGroup => {
            return Number(shipGroup.dataset.length) === ship.length;
        });

        thisShipGroup.appendChild(shipUI);
    });

    return fleetUI;
}

export { createFleetUI };
export default { createFleetUI };

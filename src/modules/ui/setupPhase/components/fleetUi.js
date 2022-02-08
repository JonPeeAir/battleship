import Drag from "../../utils/drag";
import InfoIcon from "../../../../assets/info-circle.svg";

function createFleetUI(fleet) {
    const fleetUI = document.createElement("div");
    fleetUI.id = "fleet";
    fleetUI.classList.add("fleet");
    fleetUI.addEventListener("dragover", Drag.fleetDragOver);
    fleetUI.addEventListener("dragleave", Drag.fleetDragLeave);
    fleetUI.addEventListener("drop", Drag.fleetDrop);

    const fleetLabel = document.createElement("h2");
    fleetLabel.innerHTML = `
        Fleet
        <span class="fleet-info">
            <img
                src="${InfoIcon}"
                alt="info-circle"
                width="20px"
            />
        </span>
    `;

    fleetUI.appendChild(fleetLabel);

    fleet.forEach(ship => {
        let shipCategories =
            Array.from(fleetUI.getElementsByClassName("ship-category")) || [];

        const noShipCategoryExistsForThisShip = shipCategories.some(
            shipCategory => {
                return Number(shipCategory.dataset.length) === ship.length;
            },
        );

        if (!noShipCategoryExistsForThisShip) {
            const shipCategory = document.createElement("div");
            shipCategory.classList.add("ship-category");
            shipCategory.dataset.length = ship.length;
            fleetUI.appendChild(shipCategory);

            shipCategories = Array.from(
                fleetUI.getElementsByClassName("ship-category"),
            );
        }

        const thisShipCategory = shipCategories.find(shipCategory => {
            return Number(shipCategory.dataset.length) === ship.length;
        });

        const shipUI = document.createElement("div");
        shipUI.id = `ship${ship.length}${fleet.indexOf(ship)}`;
        shipUI.classList.add("ship");
        shipUI.dataset.length = ship.length;
        shipUI.draggable = true;
        shipUI.addEventListener("dragstart", Drag.dragStartHandler, false);
        shipUI.addEventListener("click", Drag.onClickHandler, false);

        for (let i = 0; i < ship.length; i++) {
            const shipPart = document.createElement("div");
            shipPart.classList.add("ship-part");
            shipPart.addEventListener("mousedown", Drag.mouseDownHandler);
            shipUI.appendChild(shipPart);
        }

        thisShipCategory.appendChild(shipUI);
    });

    return fleetUI;
}

export { createFleetUI };
export default { createFleetUI };

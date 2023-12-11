async function main() {
    const optionsList = document.querySelector("#options-list");
    const saveBtn = document.querySelector("#save");

    window.api.receive("(options-modal)-options-list", (ev, options) => {
        let html = ``;

        for (const option of options) {
            html += `
            <li class="list-group-item d-flex m-0 p-2 mb-1 justify-content-between align-items-center">
                <span class="fw-bold flex-fill text-start">${option.description}</span>
                <input class="option-input form-checkbox-input m-0" data-option-id="${option.id}" type="checkbox" ${option.value ? "checked" : ""} />
            </li>
            `;
        }

        optionsList.innerHTML = html;
    });

    saveBtn.addEventListener("click", () => {
        let options = [];

        for (const option of document.querySelectorAll(".option-input")) {
            options.push({
                id: option.getAttribute("data-option-id"),
                value: option.checked
            });
        }

        window.api.send("(options-modal)-save-options", options);
    });
}

window.onload = () => main();
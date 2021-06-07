const contextMenu = document.getElementById("context-menu");
const scope = document.querySelector("body");
let dirId;
let fileId;

function setEventListeners() {
    const directories = document.getElementsByClassName("directory");
    for (const directory of directories) {
        directory.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            dirId = directory.id;
            fileId = undefined;
            console.log(directory.id);
            const { normalizedX: mouseX, normalizedY: mouseY } =
                normalizePozition(event.clientX, event.clientY);

            contextMenu.style.top = `${mouseY}px`;
            contextMenu.style.left = `${mouseX}px`;

            contextMenu.classList.add("visible");
        });
    }

    const files = document.getElementsByClassName("file");
    for (const file of files) {
        file.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            dirId = undefined;
            fileId = file.id;
            console.log(file.id);
            const { normalizedX: mouseX, normalizedY: mouseY } =
                normalizePozition(event.clientX, event.clientY);

            contextMenu.style.top = `${mouseY}px`;
            contextMenu.style.left = `${mouseX}px`;

            contextMenu.classList.add("visible");
        });
    }
}

scope.addEventListener("click", (e) => {
    if (e.target.offsetParent != contextMenu) {
        contextMenu.classList.remove("visible");
    }
});

const normalizePozition = (mouseX, mouseY) => {
    // ? check if the element will go out of bounds
    const outOfBoundsOnX = mouseX + contextMenu.clientWidth > scope.clientWidth;

    const outOfBoundsOnY =
        mouseY + contextMenu.clientHeight > scope.clientHeight;

    let normalizedX = mouseX;
    let normalizedY = mouseY;

    // ? normalzie on X
    if (outOfBoundsOnX) {
        normalizedX = scope.clientWidth - contextMenu.clientWidth;
    }

    // ? normalize on Y
    if (outOfBoundsOnY) {
        normalizedY = scope.clientHeight - contextMenu.clientHeight;
    }

    return { normalizedX, normalizedY };
};

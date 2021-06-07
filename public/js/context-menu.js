const contextMenu = document.getElementById("context-menu");
const scope = document.querySelector("body");
let dirId;
let fileId;

function downloadElement() {
    if (fileId) {
        const a = document.createElement("a");
        a.href = "/files?id=" + fileId.replace("file_", "");
        a.download = "";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        alert("We do not provide folder download yet");
    }
}

function rename() {
    const renameElement = document.getElementById("rename");
    renameElement.style.visibility = "visible";
    contextMenu.classList.remove("visible");
}

function cancelRename() {
    document.getElementById("rename").style.visibility = "hidden";
}

function renameElement() {
    const newName = document.getElementById("rename-box").value;
    document.getElementById("rename").style.visibility = "hidden";
    if (newName === "") {
        alert("the name cannot be empty!!");
        return;
    }
    if (dirId) {
        document.getElementById(dirId).lastElementChild.innerText = newName;
        fetch(`/files/dir?id=${dirId.replace("dir_", "")}`, {
            method: "PATCH",
            body: JSON.stringify({
                newName,
            }),
        });
    }
    if (fileId) {
        document.getElementById(fileId).lastElementChild.innerText = newName;
        fetch(`/files/file?id=${fileId.replace("file_", "")}`, {
            method: "PATCH",
            body: JSON.stringify({
                newName,
            }),
        });
    }
}

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

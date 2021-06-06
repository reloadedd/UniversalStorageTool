function setDrivesListVisibility() {
    const drivesList = document.getElementById("drives-list");
    if (drivesList.style.visibility === "hidden") {
        drivesList.style.visibility = "visible";
    } else {
        drivesList.style.visibility = "hidden";
    }
}

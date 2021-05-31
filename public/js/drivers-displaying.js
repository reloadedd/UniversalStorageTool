function setDriversListVisibility() {
    const driversList = document.getElementById("drivers-list");
    if (driversList.style.visibility === "hidden") {
        driversList.style.visibility = "visible";
    } else {
        driversList.style.visibility = "hidden";
    }
}

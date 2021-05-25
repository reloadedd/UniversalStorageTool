function addGoogleDrive() {
    location.href = "g-drive/auth";
}

async function setGoogleDriveSpace() {
    try {
        const data = await (await fetch("/g-drive/space")).json();
        if (data.totalSpace && data.usedSpace) {
            document.getElementById("gDrive-percentage").innerHTML =
                "(" +
                Math.round((data.usedSpace / data.totalSpace) * 100) +
                ' <span class="percentage">%</span> )';
            document
                .getElementsByClassName("google-drive-space")
                .item(0).style.width =
                Math.round((data.usedSpace / data.totalSpace) * 100) + "%";
        } else {
            const gDrive = document.getElementById("google-drive");
            gDrive.parentNode.removeChild(gDrive);
        }
    } catch {
        const gDrive = document.getElementById("google-drive");
        gDrive.parentNode.removeChild(gDrive);
    }
}

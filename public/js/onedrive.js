function addOneDrive() {
    location.href = "onedrive/auth";
}

async function setOneDriveAvailableSpace() {
    const onedrive = document.getElementById("onedrive");

    try {
        const data = await (
            await fetch("/onedrive/get_available_space")
        ).json();
        if (data.totalSpace && data.usedSpace) {
            document.getElementById("onedrive-percentage").innerHTML =
                "(" +
                Math.round((data.usedSpace / data.totalSpace) * 100) +
                ' <span class="percentage">%</span> )';
            document
                .getElementsByClassName("onedrive-available-space")
                .item(0).style.width =
                Math.round((data.usedSpace / data.totalSpace) * 100) + "%";
        } else {
            onedrive.parentNode.removeChild(onedrive);
        }
    } catch {
        onedrive.parentNode.removeChild(onedrive);
    }
}

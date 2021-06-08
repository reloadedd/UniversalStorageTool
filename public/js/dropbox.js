function addDropBox() {
    location.href = "dropbox/auth";
}

async function setDropboxSpace() {
    try {
        const data = await (await fetch("/dropbox/space")).json();
        if (data.totalSpace && data.usedSpace) {
            document.getElementById("dropbox-percentage").innerHTML =
                "(" +
                Math.round((data.usedSpace / data.totalSpace) * 100) +
                ' <span class="percentage">%</span> )';
            document
                .getElementsByClassName("dropbox-space")
                .item(0).style.width =
                Math.round((data.usedSpace / data.totalSpace) * 100) + "%";
        } else {
            const dropbox = document.getElementById("dropbox");
            dropbox.parentNode.removeChild(dropbox);
        }
    } catch {
        const dropbox = document.getElementById("dropbox");
        dropbox.parentNode.removeChild(dropbox);
    }
}

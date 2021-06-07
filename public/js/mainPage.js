let totalSize;
let uploadedSize;
uploadFiles = async () => {
    const files = document.getElementById("fileElem").files;
    const parentFolder = new URLSearchParams(window.location.search).get("did");
    totalSize = 0;
    uploadedSize = 0;
    for (const file of files) totalSize += file.size;
    document.getElementById("uploading").style.visibility = "visible";
    for (const file of files) {
        document.getElementById("upload_text").innerText =
            "Uploading file " + file.name;
        const createFileResult = await fetch("files", {
            method: "POST",
            body: JSON.stringify({
                parentFolder,
                name: file.name,
                size: file.size,
                type: file.type,
            }),
        });
        if (createFileResult.status === 403) {
            alert("Cannot upload if no drive is linked to the account!");
            document.getElementById("uploading").style.visibility = "hidden";
            document.getElementById("upload_progress").style.width = "0";
            return;
        }
        if (createFileResult.status === 500) {
            alert(
                "We're terribly sorry.. you can't upload files right now and it's on us",
            );
            document.getElementById("uploading").style.visibility = "hidden";
            document.getElementById("upload_progress").style.width = "0";
            return;
        }
        if (createFileResult.status !== 201) return;
        const fileId = createFileResult.headers.get("Location");
        const succeeded = await uploadFileAt(file, fileId);
        if (!succeeded) {
            alert("couldn't upload a particular chunk for some reason.. sorry");
            document.getElementById("uploading").style.visibility = "hidden";
            document.getElementById("upload_progress").style.width = "0";
            return;
        }
    }
    document.getElementById("uploading").style.visibility = "hidden";
    document.getElementById("upload_progress").style.width = "0";
};

uploadFileAt = async (file, name) => {
    let start = 0;
    const step = 5242880; // 5 * 1024 * 1024 bytes (5Mb)
    const total = file.size;
    while (start < total) {
        const blob = file.slice(start, start + step);
        let tries = 0;
        let result;
        do {
            result = await fetch("files", {
                method: "PUT",
                headers: {
                    "Content-Length": blob.size,
                    "Content-Range":
                        "bytes " +
                        start +
                        "-" +
                        (start + blob.size) +
                        "/" +
                        total,
                    Location: name,
                },
                body: blob,
            });
            tries += 1;
        } while (
            (result.status === 400 || result.status === 500) &&
            tries <= 3
        );
        if (tries === 4 || result.status === 400 || result.status === 500)
            return false;
        start = parseInt(result.headers.get("Range").replace("bytes=0-", ""));
        uploadedSize += blob.size;
        document.getElementById("upload_progress").style.width =
            Math.round((uploadedSize / totalSize) * 100) + "%";
    }
    return true;
};

getFiles = async (did = null) => {
    if (did) {
        location.href = "/index?did=" + did;
        return;
    }
    const queryParam = new URLSearchParams(window.location.search).get("did");
    let result;
    if (queryParam) result = await fetch("/files?did=" + queryParam);
    else result = await fetch("/files");
    if (result.status === 200) {
        document.getElementsByClassName("main-view").item(0).innerHTML =
            await result.text();
        document
            .getElementsByClassName("loading-icon")
            .item(0).style.visibility = "hidden";
    }
};

dirClickEventHandler = (dirId) => {
    getFiles(dirId);
};

fileClickEventHandler = (fileId) => {
    const a = document.createElement("a");
    a.href = "/files?id=" + fileId;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

createDir = async () => {
    const parentFolder = new URLSearchParams(window.location.search).get("did");

    await fetch("/files/newDir", {
        method: "POST",
        body: JSON.stringify({
            parentDir: parentFolder,
            name: document.getElementById("new-folder-box").value,
        }),
    });

    getFiles();
    document.getElementById("new-folder-name").style.visibility = "hidden";
};

let totalSize;
let uploadedSize;
uploadFiles = async () => {
    const files = document.getElementById("fileElem").files;
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
                name: file.name,
                size: file.size,
                type: file.type,
            }),
        });
        if (createFileResult.status === 403) {
            alert("Cannot upload if no drive is linked to the account!");
            return;
        }
        if (createFileResult.status === 500) {
            alert(
                "We're terribly sorry.. you can't upload files right now and it's on us",
            );
            return;
        }
        if (createFileResult.status !== 201) return;
        const fileId = createFileResult.headers.get("Location");
        const succeeded = await uploadFileAt(file, fileId);
        if (!succeeded) {
            alert("couldn't upload a particular chunk for some reason.. sorry");
            return;
        }
    }
    document.getElementById("uploading").style.visibility = "hidden";
};

uploadFileAt = async (file, name) => {
    console.log(file);
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

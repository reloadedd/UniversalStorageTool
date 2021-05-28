uploadFiles = async () => {
    const files = document.getElementById("fileElem").files;
    for (const file of files) {
        console.log("uploading file" + file.name);
        console.log("");
        const createFileResult = await fetch("files", {
            method: "POST",
        });
        if (createFileResult.status === 403) {
            alert(
                "Log in for uploading files first! (Not really sure how you got here even)",
            );
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
        console.log("upload worked");
        console.log("");
    }
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
                        start + "-" + (start + blob.size) + "/" + total,
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
        start = parseInt(result.headers.get("Location"));
        console.log("chunk");
    }
    return true;
};

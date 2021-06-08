const fetch = require("node-fetch");
async function getGoogleDriveFragment(req, fragment) {
    return (
        await fetch(
            "https://www.googleapis.com/drive/v3/files/" +
                fragment.id +
                "?alt=media&key=" +
                process.env.UNST_GDRIVE_API_KEY,
            {
                method: "GET",
                headers: {
                    Authorization: "Bearer " + req.gDriveToken,
                },
            },
        )
    ).body;
}

async function getDropboxFragment(req, fragment) {
    return (
        await fetch("https://content.dropboxapi.com/2/files/download", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + req.dropboxToken,
                "Dropbox-API-Arg": JSON.stringify({
                    path: fragment.id,
                }),
            },
        })
    ).body;
}

exports.getFrag = async (req, fragment) => {
    switch (fragment.driveType) {
        case 0:
            return await getGoogleDriveFragment(req, fragment);
        case 2:
            return await getDropboxFragment(req, fragment);
    }
};

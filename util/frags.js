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

exports.getFrag = async (req, fragment) => {
    switch (fragment.driveType) {
        case 0:
            return await getGoogleDriveFragment(req, fragment);
    }
};

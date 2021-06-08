/* ======================
 * --- Global Imports ---
 * ======================
 */
const fetch = require("node-fetch");

/* =====================
 * --- Local Imports ---
 * =====================
 */
const { getFileFromOneDrive } = require("../public/js/onedrive/server-side");
const { DriveEnum } = require("../config/config");

/* =================
 * --- Functions ---
 * =================
 */
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

exports.getFragmentFromDrive = async (req, fragment) => {
    switch (fragment.driveType) {
        case DriveEnum.GOOGLE_DRIVE:
            return await getGoogleDriveFragment(req, fragment);
        case DriveEnum.ONEDRIVE:
            return await getFileFromOneDrive(req, fragment);
        case DriveEnum.DROPBOX:
        /* TODO
          CC: @Iulian
         */
    }
};

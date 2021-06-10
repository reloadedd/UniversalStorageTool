/* ======================
 * --- Global Imports ---
 * ======================
 */
const fs = require("fs");
const fetch = require("node-fetch");
const { StatusCodes } = require("http-status-codes");

/* =====================
 * --- Local Imports ---
 * =====================
 */
const {
    ONEDRIVE_MICROSOFT_GRAPH_URL,
    ONEDRIVE_BYTE_RANGE,
    ONEDRIVE_UPLOAD_FOLDER,
} = require("../../../app/controllers/onedrive.controller");

const { cleanup } = require("../../../util/helpers");
const {
    LOCAL_FILE_STORAGE_PATH,
    DriveEnum,
    CHUNK_UPLOADING_TIMEOUT,
} = require("../../../config/config");

const { refreshOneDriveToken } = require("../../../util/refreshTokens");

/* =================
 * --- Functions ---
 * =================
 */
async function uploadFileToOneDrive(
    fileId,
    fileStream,
    req,
    thisFile,
    index,
    fileSize,
    deleteFiles = false,
) {
    // because for a big file, upload takes over an hour and the token expires.
    req.OneDriveToken = undefined;
    await refreshOneDriveToken(req, null);

    console.log("before upload session");
    const createUploadSessionResponse = await (
        await fetch(
            `${ONEDRIVE_MICROSOFT_GRAPH_URL}/me/drive/root:/${ONEDRIVE_UPLOAD_FOLDER}/${fileId}:/createUploadSession`,
            {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + req.OneDriveToken,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    item: {
                        "@odata.type":
                            "microsoft.graph.driveItemUploadableProperties",
                        "@microsoft.graph.conflictBehavior": "replace",
                    },
                }),
            },
        )
    ).json();

    console.log("got upload session");
    if (createUploadSessionResponse.error) {
        console.log(
            `[ ERROR ]: Failed to create upload session. More details: '${createUploadSessionResponse.error.message}'`,
        );
    } else {
        let iHave = Buffer.alloc(0);
        let iWant = ONEDRIVE_BYTE_RANGE;
        let i = 0;
        fileStream.on("data", async (chunk) => {
            fileStream.pause();
            iHave = Buffer.concat([
                iHave,
                chunk.slice(0, Math.min(chunk.length, iWant)),
            ]);
            iWant -= chunk.length;
            console.log("OneDrive chunk length: " + chunk.length);
            if (iWant <= 0) {
                await fetch(createUploadSessionResponse.uploadUrl, {
                    method: "PUT",
                    headers: {
                        "Content-Length": iHave.length,
                        "Content-Range": `bytes ${i * ONEDRIVE_BYTE_RANGE}-${
                            (i + 1) * ONEDRIVE_BYTE_RANGE - 1
                        }/${fileSize}`,
                    },
                    body: iHave,
                });
                console.log("Uploaded " + iHave.length + " Bytes to OneDrive");
                iHave = Buffer.alloc(0);
                i++;
            }
            if (iWant === 0) iWant = ONEDRIVE_BYTE_RANGE;
            else if (iWant < 0) {
                iHave = Buffer.concat([
                    iHave,
                    chunk.slice(chunk.length + iWant, chunk.length),
                ]);
                iWant += ONEDRIVE_BYTE_RANGE;
            }
            fileStream.resume();
        });

        fileStream.on("end", async () => {
            if (iHave.length === 0) console.log("Wow, THIS happened");
            else {
                await fetch(createUploadSessionResponse.uploadUrl, {
                    method: "PUT",
                    headers: {
                        "Content-Length": iHave.length,
                        "Content-Range": `bytes ${i * ONEDRIVE_BYTE_RANGE}-${
                            i * ONEDRIVE_BYTE_RANGE + iHave.length - 1
                        }/${fileSize}`,
                    },
                    body: iHave,
                });
            }
            // because for a big file, upload takes over an hour and the token expires.
            req.OneDriveToken = undefined;
            await refreshOneDriveToken(req, null);

            console.log("Before metadata");
            const fileMetadata = await getFileMetadataFromOneDrive(
                req,
                `${ONEDRIVE_UPLOAD_FOLDER}/${fileId}`,
            );
            console.log(fileMetadata);

            console.log("Before creating fragment");
            const newFileFragment = await req.db.fragments.create({
                id: fileMetadata.id,
                driveType: DriveEnum.ONEDRIVE,
                index,
            });
            thisFile.addFragment(newFileFragment);
            console.log("Done uploading to OneDrive");
            if (deleteFiles) cleanup(fileId);
        });
    }
}

async function getFileMetadataFromOneDrive(req, path) {
    return (
        await fetch(
            `${ONEDRIVE_MICROSOFT_GRAPH_URL}/me/drive/items/root:/${path}`,
            {
                method: "GET",
                headers: {
                    Authorization: "Bearer " + req.OneDriveToken,
                },
            },
        )
    ).json();
}

async function getFileFromOneDrive(req, file) {
    return (
        await fetch(
            `${ONEDRIVE_MICROSOFT_GRAPH_URL}/me/drive/items/${file.id}/content`,
            {
                method: "GET",
                headers: {
                    Authorization: "Bearer " + req.OneDriveToken,
                },
            },
        )
    ).body;
}

async function deleteFileFromOneDrive(req, file) {
    return await fetch(
        `${ONEDRIVE_MICROSOFT_GRAPH_URL}/me/drive/items/${file.id}`,
        {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + req.OneDriveToken,
            },
        },
    );
}

/* ======================
 * --- Module Exports ---
 * ======================
 */
module.exports = {
    uploadFileToOneDrive,
    getFileFromOneDrive,
    deleteFileFromOneDrive,
};

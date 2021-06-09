/* ======================
 * --- Global Imports ---
 * ======================
 */
const fs = require("fs");
const fetch = require("node-fetch");
const { StatusCodes } = require("http-status-codes");
const util = require("util");

/* =====================
 * --- Local Imports ---
 * =====================
 */
const {
    ONEDRIVE_MICROSOFT_GRAPH_URL,
    ONEDRIVE_BYTE_RANGE,
    ONEDRIVE_UPLOAD_FOLDER,
} = require("../../../app/controllers/onedrive.controller");
const {
    LOCAL_FILE_STORAGE_PATH,
    DriveEnum,
    CHUNK_UPLOADING_TIMEOUT,
} = require("../../../config/config");
const { cleanupFromLocalStorage } = require("../../../util/helpers");


/* =================
 * --- Functions ---
 * =================
 */
async function uploadFileToOneDrive(fileHash, req) {
    const User = req.db.users;
    const File = req.db.files;
    const Fragment = req.db.fragments;
    const Directory = req.db.directories;
    const configFile = JSON.parse(
        await fs.readFileSync(
            `${LOCAL_FILE_STORAGE_PATH}/${fileHash.split('.')[0]}.config.json`,
        ),
    );
    const thisFile = await File.create({
        name: configFile.name,
        size: configFile.totalSize,
        mimeType: configFile.mimeType,
    });

    if (!configFile.parentFolder) {
        const me = await User.findOne({ where: { email: configFile.user } });
        me.addFile(thisFile);
    } else {
        const parentDir = await Directory.findOne({
            where: {
                id: configFile.parentFolder,
            },
        });
        parentDir.addFile(thisFile);
    }

    console.log(`The file hash: ${fileHash}`);

    const createUploadSessionResponse = await (
        await fetch(
            `${ONEDRIVE_MICROSOFT_GRAPH_URL}/me/drive/root:/${ONEDRIVE_UPLOAD_FOLDER}/${fileHash}:/createUploadSession`,
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

    if (createUploadSessionResponse.error) {
        console.log(
            `[ ERROR ]: Failed to create upload session. More details: '${createUploadSessionResponse.error.message}'`,
        );

        cleanupFromLocalStorage(fileHash);
    } else {
        const readStream = fs.createReadStream(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}`,
            { highWaterMark: ONEDRIVE_BYTE_RANGE });

        let byteRangeIndex = 0;
        let requests = 0;
        readStream.on("data", async (chunk) => {
            const startByteRange = byteRangeIndex * ONEDRIVE_BYTE_RANGE;
            const endByteRange = startByteRange + chunk.length - 1;
            const order = byteRangeIndex;
            byteRangeIndex++;

            const delay = (ms) =>
                new Promise((resolve) => setTimeout(resolve, ms));

            while (order !== requests) {
                await delay(CHUNK_UPLOADING_TIMEOUT);
            }

            fetch(createUploadSessionResponse.uploadUrl, {
                method: "PUT",
                headers: {
                    "Content-Length": chunk.length,
                    "Content-Range": `bytes ${startByteRange}-${endByteRange}/${configFile.totalSize}`,
                },
                body: chunk,
            }).then(async (response) => {
                requests++;

                if (response.status === StatusCodes.CREATED) {
                    console.log("The file has been created on drive");
                    const fileMetadata = await getFileMetadataFromOneDrive(
                        req,
                        `${ONEDRIVE_UPLOAD_FOLDER}/${fileHash}`,
                    );

                    console.log(`The id is ${util.inspect(fileMetadata, { depth: null })}`);
                    const newFileFragment = await Fragment.create({
                        id: fileMetadata.id,
                        driveType: DriveEnum.ONEDRIVE,
                        index: 1,
                    });
                    thisFile.addFragment(newFileFragment);
                    cleanupFromLocalStorage(fileHash);
                }
            });
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

/* ======================
 * --- Global Imports ---
 * ======================
 */
const fs = require("fs");
const fetch = require("node-fetch");
const { DriveEnum, CHUNK_UPLOADING_TIMEOUT, LOCAL_FILE_STORAGE_PATH } = require("../config/config");

/* =====================
 * --- Local Imports ---
 * =====================
 */
const { getFragmentFromDrive } = require("./fragments");
const { uploadFileToOneDrive } = require("../public/js/onedrive/server-side");

/* =================
 * --- Constants ---
 * =================
 */
const DROPBOX_BYTE_STEP = 134217728; // 128 * 1024 * 1024 bytes (128Mb)

/* =================
 * --- Functions ---
 * =================
 */
uploadFileToGoogleDrive = async (fileHash, req) => {
    const configFile = JSON.parse(
        await fs.readFileSync(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}.config.json`),
    );
    const User = req.db.users;
    const File = req.db.files;
    const Fragment = req.db.fragments;
    const Directory = req.db.directories;
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

    const gDriveData = await (
        await fetch("https://www.googleapis.com/drive/v2/about", {
            method: "GET",
            headers: {
                Authorization: "Bearer " + req.gDriveToken,
            },
        })
    ).json();
    const gDriveAvailableSpace =
        gDriveData.quotaBytesTotal - gDriveData.quotaBytesUsedAggregate;

    if (gDriveAvailableSpace >= configFile.totalSize) {
        console.log("Can and will upload to google Drive");

        // get the file size
        const stat = fs.statSync(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}`);
        const fileStream = fs.createReadStream(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}`);

        // POST request to create a file on drive.
        const response = await fetch(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=media",
            {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + req.gDriveToken,
                },
                body: fileStream,
            },
        );

        const gDriveFileId = (await response.json()).id;

        fs.rmSync(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}.config.json`);
        fs.rmSync(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}`);

        const newFileFragment = await Fragment.create({
            id: gDriveFileId,
            // just decided: google drive will have index 0
            driveType: DriveEnum.GOOGLE_DRIVE,
            index: 0,
        });
        thisFile.addFragment(newFileFragment);
    } else {
        console.log("We are yet to fragment things");
    }
};

async function setFileToUserDropbox150MBLimited(fileHash, req) {
    const configFile = JSON.parse(
        await fs.readFileSync(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}.config.json`),
    );
    const User = req.db.users;
    const File = req.db.files;
    const Fragment = req.db.fragments;
    const Directory = req.db.directories;
    const thisFile = await File.create({
        name: configFile.name,
        size: configFile.totalSize,
        mimeType: configFile.mimeType,
    });

    console.log(`Filename: ${thisFile.name}`);

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

    const dropboxData = await (
        await fetch("https://api.dropboxapi.com/2/users/get_space_usage", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + req.dropboxToken,
            },
        })
    ).json();

    const dropboxAvailableSpace =
        dropboxData.allocation.allocated - dropboxData.used;

    if (dropboxAvailableSpace >= configFile.totalSize) {
        console.log("Can and will upload to dropbox");

        // get the file size
        const stat = fs.statSync(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}`);
        const fileStream = fs.createReadStream(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}`);

        const uploadResponse = await (
            await fetch("https://content.dropboxapi.com/2/files/upload", {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + req.dropboxToken,
                    "Dropbox-API-Arg": JSON.stringify({
                        path: "/unst_file",
                        mode: "add",
                        autorename: true,
                        mute: false,
                        strict_conflict: false,
                    }),
                    "Content-Type": "application/octet-stream",
                },
                body: fileStream,
            })
        ).json();

        fs.rmSync(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}.config.json`);
        fs.rmSync(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}`);

        const newFileFragment = await Fragment.create({
            id: uploadResponse.id,
            // just decided: google drive will have index 0
            driveType: 2,
            index: 0,
        });
        thisFile.addFragment(newFileFragment);
    } else {
        console.log("We are yet to fragment things");
    }
}

setFileToUserDropbox = async (fileHash, req) => {
    const configFile = JSON.parse(
        await fs.readFileSync(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}.config.json`),
    );

    if (configFile.totalSize < 157286400) {
        setFileToUserDropbox150MBLimited(fileHash, req);
        return;
    }

    const User = req.db.users;
    const File = req.db.files;
    const Fragment = req.db.fragments;
    const Directory = req.db.directories;
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

    const dropboxData = await (
        await fetch("https://api.dropboxapi.com/2/users/get_space_usage", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + req.dropboxToken,
            },
        })
    ).json();

    const dropboxAvailableSpace =
        dropboxData.allocation.allocated - dropboxData.used;

    if (dropboxAvailableSpace >= configFile.totalSize) {
        console.log("Can and will upload to dropbox ");

        // start upload session
        const startSessionResponse = await (
            await fetch(
                "https://content.dropboxapi.com/2/files/upload_session/start",
                {
                    method: "POST",
                    headers: {
                        Authorization: "Bearer " + req.dropboxToken,
                        "Dropbox-API-Arg": JSON.stringify({
                            close: false,
                        }),
                        "Content-Type": "application/octet-stream",
                    },
                },
            )
        ).json();

        const sessionId = startSessionResponse.session_id;

        const stream = await fs.createReadStream(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}`, {
            highWaterMark: DROPBOX_BYTE_STEP,
        });
        let byteRangeIndex = 0;
        let requests = 0;
        stream.on("data", async (chunk) => {
            const order = byteRangeIndex;
            console.log(order);
            byteRangeIndex++;

            const delay = (ms) =>
                new Promise((resolve) => setTimeout(resolve, ms));

            while (order !== requests) {
                await delay(CHUNK_UPLOADING_TIMEOUT);
            }
            fetch(
                "https://content.dropboxapi.com/2/files/upload_session/append_v2",
                {
                    method: "POST",
                    headers: {
                        Authorization: "Bearer " + req.dropboxToken,
                        "Dropbox-API-Arg": JSON.stringify({
                            cursor: {
                                session_id: sessionId,
                                offset: order * DROPBOX_BYTE_STEP,
                            },
                            close: false,
                        }),
                        "Content-Type": "application/octet-stream",
                    },
                    body: chunk,
                },
            ).then(async (response) => {
                console.log("done" + order);
                requests++;

                if (requests === byteRangeIndex) {
                    console.log("Everything done?");
                    const finishSessionResponse = await (
                        await fetch(
                            "https://content.dropboxapi.com/2/files/upload_session/finish",
                            {
                                method: "POST",
                                headers: {
                                    Authorization: "Bearer " + req.dropboxToken,
                                    "Dropbox-API-Arg": JSON.stringify({
                                        cursor: {
                                            session_id: sessionId,
                                            offset: configFile.totalSize,
                                        },
                                        commit: {
                                            path: "/unst_file",
                                            mode: "add",
                                            autorename: true,
                                            mute: false,
                                            strict_conflict: false,
                                        },
                                    }),
                                    "Content-Type": "application/octet-stream",
                                },
                            },
                        )
                    ).json();

                    fs.rmSync(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}.config.json`);
                    fs.rmSync(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}`);

                    const newFileFragment = await Fragment.create({
                        id: finishSessionResponse.id,
                        // just decided: dropbox will have index 2
                        driveType: 2,
                        index: 0,
                    });
                    thisFile.addFragment(newFileFragment);
                }
            });
        });
    } else {
        console.log("We are yet to fragment things");
    }
};

exports.uploadToAllDrives = setFileToUserDropbox;
//     (fid, req) => {
//
// }

exports.downloadFile = async (req, res, file) => {
    const fragments = await file.getFragments();
    fragments.sort((a, b) =>
        a.index > b.index ? 1 : b.index > a.index ? -1 : 0,
    );
    res.writeHead(200, {
        "Content-Type": file.mimeType,
        "Content-Length": file.size,
        "Content-Disposition": "attachment; filename=" + file.name,
    });
    const fragRes = [];
    for (let i = 0; i < fragments.length; i++) {
        fragRes.push(await getFragmentFromDrive(req, fragments[i]));
    }
    if (fragRes.length > 1) {
        fragRes[0].pipe(res, { end: false });
        fragRes[0].on("end", () => {
            if (fragRes.length > 2) {
                fragRes[1].pipe(res, { end: false });
                fragRes[1].on("end", () => {
                    fragRes[2].pipe(res);
                });
            } else {
                fragRes[1].pipe(res);
            }
        });
    } else {
        fragRes[0].pipe(res);
    }
};

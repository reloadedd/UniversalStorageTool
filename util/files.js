/* ======================
 * --- Global Imports ---
 * ======================
 */
const fs = require("fs");
const fetch = require("node-fetch");
const util = require("util");


/* =====================
 * --- Local Imports ---
 * =====================
 */const { getFrag } = require("./frags");
const { ONEDRIVE_MICROSOFT_GRAPH_URL } = require("../app/controllers/onedrive.controller");
const { LOCAL_FILE_STORAGE_PATH } = require("../config/config");


/* =================
 * --- Functions ---
 * =================
 */
// exports.setFileToUser = async (fid, req) => {
//     const configFile = JSON.parse(
//         await fs.readFileSync("./tmp/" + fid + ".config.json"),
//     );
//     const User = req.db.users;
//     const File = req.db.files;
//     const Fragment = req.db.fragments;
//     const Directory = req.db.directories;
//     const thisFile = await File.create({
//         name: configFile.name,
//         size: configFile.totalSize,
//         mimeType: configFile.mimeType,
//     });
//     if (!configFile.parentFolder) {
//         const me = await User.findOne({ where: { email: configFile.user } });
//         me.addFile(thisFile);
//     } else {
//         const parentDir = await Directory.findOne({
//             where: {
//                 id: configFile.parentFolder,
//             },
//         });
//         parentDir.addFile(thisFile);
//     }
//
//     const gDriveData = await (
//         await fetch("https://www.googleapis.com/drive/v2/about", {
//             method: "GET",
//             headers: {
//                 Authorization: "Bearer " + req.gDriveToken,
//             },
//         })
//     ).json();
//     const gDriveAvailableSpace =
//         gDriveData.quotaBytesTotal - gDriveData.quotaBytesUsedAggregate;
//
//     if (gDriveAvailableSpace >= configFile.totalSize) {
//         console.log("Can and will upload to google Drive");
//
//         // get the file size
//         const stat = fs.statSync("./tmp/" + fid);
//         const fileStream = fs.createReadStream("./tmp/" + fid);
//
//         // POST request to create a file on drive.
//         const response = await fetch(
//             "https://www.googleapis.com/upload/drive/v3/files?uploadType=media",
//             {
//                 method: "POST",
//                 headers: {
//                     Authorization: "Bearer " + req.gDriveToken,
//                 },
//                 body: fileStream,
//             },
//         );
//
//         const gDriveFileId = (await response.json()).id;
//
//         fs.rmSync("./tmp/" + fid + ".config.json");
//         fs.rmSync("./tmp/" + fid);
//
//         const newFileFragment = await Fragment.create({
//             id: gDriveFileId,
//             // just decided: google drive will have index 0
//             driveType: 0,
//             index: 0,
//         });
//         thisFile.addFragment(newFileFragment);
//     } else {
//         console.log("We are yet to fragment things");
//     }
// };

exports.setFileToUser = async (fileId, req) => {
    const User = req.db.users;
    const File = req.db.files;
    const Fragment = req.db.fragments;
    const Directory = req.db.directories;
    const configFile = JSON.parse(await fs.readFileSync(`${LOCAL_FILE_STORAGE_PATH}/${fileId}.config.json`));
    const thisFile = await File.create(
    {
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

    const response = await (await fetch(
        `${ONEDRIVE_MICROSOFT_GRAPH_URL}/me/drive/items/root:/.unst/${fileId}:/content`,
        {
            method: "PUT",
            headers: {
                Authorization: "Bearer " + req.OneDriveToken
            },
            body: fs.createReadStream(`${LOCAL_FILE_STORAGE_PATH}/${fileId}`)
        }
    )).json();

    if (response.error) {
        console.log(`[ ERROR ]: When uploading to OneDrive. More details: '${response.message}'`);
    } else {
        console.log("Nu-i eroare boss");
    }
    console.log(util.inspect(response, {depth: null}));

    fs.rmSync(`${LOCAL_FILE_STORAGE_PATH}/${fileId}`);
    fs.rmSync(`${LOCAL_FILE_STORAGE_PATH}/${fileId}.config.json`);

    const newFileFragment = await Fragment.create({
        id: response.id,
        driveType: 1,
        index: 1,
    });
    thisFile.addFragment(newFileFragment);
}

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
        fragRes.push(await getFrag(req, fragments[i]));
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

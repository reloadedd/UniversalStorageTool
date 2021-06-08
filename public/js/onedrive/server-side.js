/* ======================
 * --- Global Imports ---
 * ======================
 */
const fs = require("fs");
const util = require("util");
const fetch = require("node-fetch");
const request = require("request");


/* =====================
 * --- Local Imports ---
 * =====================
 */
const { ONEDRIVE_MICROSOFT_GRAPH_URL, ONEDRIVE_BYTE_RANGE } = require("../../../app/controllers/onedrive.controller");
const { LOCAL_FILE_STORAGE_PATH, DriveEnum } = require("../../../config/config");


/* =================
 * --- Functions ---
 * =================
 */
async function uploadFileToOneDrive(fileId, req) {
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

  const createUploadSessionResponse = await (await fetch(
      `${ONEDRIVE_MICROSOFT_GRAPH_URL}/me/drive/root:/.unst/${fileId}:/createUploadSession`,
      {
        method: "POST",
        headers: {
          'Authorization': "Bearer " + req.OneDriveToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {
              item: {
                "@odata.type": "microsoft.graph.driveItemUploadableProperties",
                "@microsoft.graph.conflictBehavior": "replace",
                // "fileSize": configFile.totalSize
              }
            })
      }
  )).json();

  if (createUploadSessionResponse.error) {
    console.log(`[ ERROR ]: Failed to create upload session. More details: '${createUploadSessionResponse.error.message}'`);
    return;
  } else {
    let readStream = fs.createReadStream(`${LOCAL_FILE_STORAGE_PATH}/${fileId}`,
        { highWaterMark: ONEDRIVE_BYTE_RANGE});
    let byteRangeIndex = 0;

    let requests = 0;
    readStream.on('data', async (chunk) => {
      const startByteRange = byteRangeIndex * ONEDRIVE_BYTE_RANGE;
      const endByteRange = startByteRange + chunk.length - 1;
      byteRangeIndex++;

      console.log(`start: ${startByteRange} | end: ${endByteRange} | index: ${byteRangeIndex}`);

      let response;

      do {
        requests++;
        response = await fetch(
            createUploadSessionResponse.uploadUrl,
            {
              method: "PUT",
              headers: {
                'Content-Length': chunk.length,
                'Content-Range': `bytes ${startByteRange}-${endByteRange}/${configFile.totalSize}`
              },
              body: chunk
            }
        );
        console.log(`Response #${byteRangeIndex - 1}: ${response.status}`);
      } while (response.status !== 202 && response.status !== 201);

      console.log(`Requests: ${requests}`);

      // ).then(response => console.log(`Response #${byteRangeIndex - 1}: ${response.status}`));
      // ).then(response => console.log(`Response #${byteRangeIndex - 1}: ${util.inspect(response, { depth: null })}`))
    });

    const newFileFragment = await Fragment.create({
      id: fileId,
      driveType: DriveEnum.ONEDRIVE,
      index: 1,
    });
    thisFile.addFragment(newFileFragment);
  }

  fs.rmSync(`${LOCAL_FILE_STORAGE_PATH}/${fileId}`);
  fs.rmSync(`${LOCAL_FILE_STORAGE_PATH}/${fileId}.config.json`);
}

async function getFileFromOneDrive(req, file) {
  return (
      await fetch(
          `${ONEDRIVE_MICROSOFT_GRAPH_URL}/me/drive/items/${file.id}/content`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + req.OneDriveToken
            }
          })
  ).body;
}

async function deleteFileFromOneDrive(req, file) {
  return (
      await fetch(
          `${ONEDRIVE_MICROSOFT_GRAPH_URL}/me/drive/items/${file.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: "Bearer " + req.OneDriveToken
            }
          })
  );
}


/* ======================
 * --- Module Exports ---
 * ======================
 */
module.exports = {
  uploadFileToOneDrive,
  getFileFromOneDrive,
  deleteFileFromOneDrive
}
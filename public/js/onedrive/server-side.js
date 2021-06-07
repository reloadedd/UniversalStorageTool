/* ======================
 * --- Global Imports ---
 * ======================
 */
const fs = require("fs");
const fetch = require("node-fetch");


/* =====================
 * --- Local Imports ---
 * =====================
 */
const { ONEDRIVE_MICROSOFT_GRAPH_URL } = require("../../../app/controllers/onedrive.controller");
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

  fs.rmSync(`${LOCAL_FILE_STORAGE_PATH}/${fileId}`);
  fs.rmSync(`${LOCAL_FILE_STORAGE_PATH}/${fileId}.config.json`);
  if (response.error) {
    console.log(`[ ERROR ]: When uploading to OneDrive. More details: '${response.message}'`);
    return;
  }

  const newFileFragment = await Fragment.create({
    id: response.id,
    driveType: DriveEnum.ONEDRIVE,
    index: 1,
  });
  thisFile.addFragment(newFileFragment);
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
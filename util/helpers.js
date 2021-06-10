const fs = require("fs");
const { LOCAL_FILE_STORAGE_PATH } = require("../config/config");

function cleanup(fileHash) {
  fs.rmSync(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}.config.json`);
  fs.rmSync(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}`);
}

module.exports = {
  cleanup
}
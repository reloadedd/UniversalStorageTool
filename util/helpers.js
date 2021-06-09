const fs = require("fs");
const { LOCAL_FILE_STORAGE_PATH } = require("../config/config");

function cleanupFromLocalStorage(fileName) {
  try {
    fs.rmSync(`${LOCAL_FILE_STORAGE_PATH}/${fileName.split('.')[0]}.config.json`);
    fs.rmSync(`${LOCAL_FILE_STORAGE_PATH}/${fileName.split('.')[0]}`);
    fs.rmSync(`${LOCAL_FILE_STORAGE_PATH}/${fileName}`);
  } catch (err) {}
}

module.exports = {
  cleanupFromLocalStorage
}
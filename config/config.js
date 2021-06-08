/* ======================
 * --- Global Imports ---
 * ======================
 */
const colors = require("colors");

/* =================
 * --- Constants ---
 * =================
 */
/* The port used by the application */
const PORT = 2999;

/* The application's version which follows Semantic Versioning conventions */
const VERSION = "0.4.0";

/* Environment variables needed for setting up the SSL Certificate on the Node.js server */
const SSL_CERTIFICATE = "CERTIFICATE_FILE_CRT_PATH";
const SSL_PRIVATE_KEY = "CERTIFICATE_PRIVATE_KEY_PATH";
const SSL_CA_BUNDLE = "CERTIFICATE_CA_BUNDLE_PATH";

/* The local path where the files will be saved prior to uploading to drives */
const LOCAL_FILE_STORAGE_PATH = "./tmp";

/* In ms */
const CHUNK_UPLOADING_TIMEOUT = 100;

/* Fake an enum for storing the drives as key-value pairs */
DriveEnum = Object.freeze({
    GOOGLE_DRIVE: 0,
    ONEDRIVE: 1,
    DROPBOX: 2,
});

/* Fake an enum for storing the compression algorithms as key-value pairs */
CompressionAlgorithmEnum = Object.freeze({
    GZIP: 0,
    BZIP2: 1,
    ZIP: 2,
});


colors.setTheme({
    info: "bgGreen",
    help: "cyan",
    warn: "yellow",
    success: "bgBlue",
    error: "red",
});

/* =================
 * --- Functions ---
 * =================
 */
function displayBanner(httpsAvailable) {
    console.log(
        "                                                                  \n" +
            "\t8 8888      88 b.             8    d888888o. 8888888 8888888888 \n" +
            "\t8 8888      88 888o.          8  .`8888:' `88.     8 8888       \n" +
            "\t8 8888      88 Y88888o.       8  8.`8888.   Y8     8 8888       \n" +
            "\t8 8888      88 .`Y888888o.    8  `8.`8888.         8 8888       \n" +
            "\t8 8888      88 8o. `Y888888o. 8   `8.`8888.        8 8888       \n" +
            "\t8 8888      88 8`Y8o. `Y88888o8    `8.`8888.       8 8888       \n" +
            "\t8 8888      88 8   `Y8o. `Y8888     `8.`8888.      8 8888       \n" +
            "\t` 8888     ,8P 8      `Y8o. `Y8 8b   `8.`8888.     8 8888       \n" +
            "\t  8888   ,d8P  8         `Y8o.` `8b.  ;8.`8888     8 8888       \n" +
            "\t   `Y88888P'   8            `Yo  `Y8888P ,88P'     8 8888       \n" +
            "\t\tㄩ几丨ᐯ乇尺丂卂ㄥ 丂ㄒㄖ尺卂Ꮆ乇 ㄒㄖㄖㄥ\n".warn +
            "\tᴠᴇʀsɪᴏɴ:\t".warn,
        VERSION,
        "\n" + "\tʟɪsᴛᴇɴɪɴɢ ᴘᴏʀᴛ:\t".warn,
        PORT,
        "\n" + "\tʜᴛᴛᴘs:\t\t".warn,
        httpsAvailable,
        "\n" + "\tsᴛᴀᴛᴜs:\t\t".warn,
        "up and running\n".underline,
    );
}

/* ======================
 * --- Module Exports ---
 * ======================
 */
module.exports = {
    PORT,
    displayBanner,
    SSL_CA_BUNDLE,
    SSL_CERTIFICATE,
    SSL_PRIVATE_KEY,
    LOCAL_FILE_STORAGE_PATH,
    DriveEnum,
    CHUNK_UPLOADING_TIMEOUT,
    CompressionAlgorithmEnum
};

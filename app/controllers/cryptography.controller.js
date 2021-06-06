/* ===============
 * --- Imports ---
 * ===============
 */
const crypto = require("crypto");


/* =================
 * --- Constants ---
 * =================
 */
const RANDOM_BYTES_LENGTH = 60;


/* =================
 * --- Functions ---
 * =================
 */
function generateRandomHex() {
  let randomBytesBuffer = crypto.randomBytes(RANDOM_BYTES_LENGTH);

  return randomBytesBuffer.toString("hex");
}


/* ======================
 * --- Module Exports ---
 * ======================
 */
module.exports = {
  generateRandomHex
}
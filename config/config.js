/* The port used by the application. CHANGE THIS IN PRODUCTION */
const PORT = 3000;

/* The application's version which follows Semantic Versioning conventions */
const VERSION = '0.2.0';

const colors = require('colors');
colors.setTheme({
  info: 'bgGreen',
  help: 'cyan',
  warn: 'yellow',
  success: 'bgBlue',
  error: 'red'
});

function display_banner() {
  console.log('                                                                \n' +
      '\t8 8888      88 b.             8    d888888o. 8888888 8888888888 \n' +
      '\t8 8888      88 888o.          8  .`8888:\' `88.     8 8888       \n' +
      '\t8 8888      88 Y88888o.       8  8.`8888.   Y8     8 8888       \n' +
      '\t8 8888      88 .`Y888888o.    8  `8.`8888.         8 8888       \n' +
      '\t8 8888      88 8o. `Y888888o. 8   `8.`8888.        8 8888       \n' +
      '\t8 8888      88 8`Y8o. `Y88888o8    `8.`8888.       8 8888       \n' +
      '\t8 8888      88 8   `Y8o. `Y8888     `8.`8888.      8 8888       \n' +
      '\t` 8888     ,8P 8      `Y8o. `Y8 8b   `8.`8888.     8 8888       \n' +
      '\t  8888   ,d8P  8         `Y8o.` `8b.  ;8.`8888     8 8888       \n' +
      '\t   `Y88888P\'   8            `Yo  `Y8888P ,88P\'     8 8888       \n' +
      '\t\tㄩ几丨ᐯ乇尺丂卂ㄥ 丂ㄒㄖ尺卂Ꮆ乇 ㄒㄖㄖㄥ\n'.info +
      '\tᴠᴇʀsɪᴏɴ:\t'.warn, VERSION, '\n' +
      '\tʟɪsᴛᴇɴɪɴɢ ᴘᴏʀᴛ:\t'.warn, PORT, '\n' +
      '\tsᴛᴀᴛᴜs:\t\t'.warn, 'up and running'.bgMagenta, '\n');
}

/* Export the following objects from this module */
module.exports = {
  PORT: PORT,
  display_banner: display_banner
}
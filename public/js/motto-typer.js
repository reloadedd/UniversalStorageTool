let WAITING_TIME_BETWEEN_REITERATIONS = 20; /* In seconds */
let WAITING_TIME_BETWEEN_PHRASES = 0.7;     /* In seconds */
let TYPING_SPEED = 9;                       /* Range between 1 - 10. 1: fastest, 10: slowest (but fast enough) */

document.addEventListener('DOMContentLoaded',() => {
  // array with texts to type in typewriter
  let dataText = [ "Romania, Iasi.", "Faculty of Computer Science.", "Reuniting cloud storage since 2021.",
    "We are UnST Team!", "Envision.", "Empower.", "Action."];

  // type one text in the typewriter
  // keeps calling itself until the text is finished
  function typeWriter(text, i, fnCallback) {
    // check if text isn't finished yet
    if (i < (text.length)) {
      // add next character to h1
      document.querySelector("h1").innerHTML = text.substring(0, i+1) +
          '<span class="motto" aria-hidden="true"></span>';

      // wait for a while and call this function again for next character
      setTimeout(() => { typeWriter(text, i + 1, fnCallback); }, TYPING_SPEED * 10);
    }
    // text finished, call callback if there is a callback function
    else if (typeof fnCallback == 'function') {
      // call callback after timeout
      setTimeout(fnCallback, WAITING_TIME_BETWEEN_PHRASES * 100);
    }
  }

  // start a typewriter animation for a text in the dataText array
  function startAnimation(i) {
    if (i === dataText.length) {
      setTimeout(() => { startAnimation(0); }, WAITING_TIME_BETWEEN_REITERATIONS * 1000);
    } else
    // check if dataText[i] exists
    if (i < dataText[i].length) {
      // text exists! start typewriter animation
      typeWriter(dataText[i], 0, () => {
        // after callback (and whole text has been animated), start next text
        startAnimation(i + 1);
      });
    }
  }

  // start the text animation
  startAnimation(0);
});
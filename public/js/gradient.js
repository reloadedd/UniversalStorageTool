// let body = document.getElementById("gradient");
let body = document.getElementsByTagName("body")[0];

function setGradient(firstColor, secondColor) {
  body.style.background = "linear-gradient(to left," + firstColor + "," + secondColor + ")";
}

function generateRandomColor() {
  let value = Math.random() + 0.2;
  return '#' + (value * 0xffffff << 0).toString(16);
}

function generateRandomGradient() {
  let firstColor = generateRandomColor();
  let secondColor = generateRandomColor();
  setGradient(firstColor, secondColor);
}

generateRandomGradient();

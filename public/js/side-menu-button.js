document.getElementById("side-menu-button").innerHTML = `
          <div class="container" onclick="sideMenuButtonChange(this)">
            <div class="bar1"></div>
            <div class="bar2"></div>
            <div class="bar3"></div>
          </div>

`;

function sideMenuButtonChange(x) {
    x.classList.toggle("change");
    document
        .getElementsByClassName("side-menu")
        .item(0)
        .classList.toggle("change");
    const items = document.getElementsByClassName("side-menu").item(0).children;
    for (let i = 0; i < items.length; i++)
        items.item(i).classList.toggle("change");
}

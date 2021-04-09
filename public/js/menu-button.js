document.getElementById("menu-button").innerHTML = `
          <div class="container" onclick="menuButtonChange(this)">
            <div class="bar1"></div>
            <div class="bar2"></div>
            <div class="bar3"></div>
          </div>

`;

function menuButtonChange(x){
    x.classList.toggle("change");
    document.getElementsByClassName("nav-bar").item(0).classList.toggle("change");
    let links = document.getElementsByClassName("nav-link");
    for (let i = 0; i < links.length; i++)
        links.item(i).classList.toggle("change");
}
document.getElementById("menu-button").innerHTML = `
          <div class="container" onclick="menuButtonChange(this)">
            <div class="bar1"></div>
            <div class="bar2"></div>
            <div class="bar3"></div>
          </div>

`

function menuButtonChange(x){
    x.classList.toggle("change");
}
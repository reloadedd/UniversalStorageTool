let x = Math.floor(Math.random() * 100) + 5;
for(let i = 1; i <= x; i++) {
    fetch("file?id=" + i)
        .then(result => result.text())
        .then(data => document
            .getElementsByClassName("main-view")
            .item(0)
            .innerHTML += data
        );
}
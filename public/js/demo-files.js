for(let i = 1; i <= 10; i++) {
    fetch("file?id=" + i)
        .then(result => result.text())
        .then(data => document
            .getElementsByClassName("main-view")
            .item(0)
            .innerHTML += data
        );
}
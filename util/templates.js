exports.templateDirectoriesAndFiles = (dirs, files) => {
    let res = "";
    for (const dir of dirs) {
        res += `
        <figure onmousedown="dirClickEventHandler(event, ${
            dir.id
        })" style="width: min-content" id=${"dir_" + dir.id}>
            <img src="public/img/folder.png" alt="Directory">
            <figcaption >${dir.name}</figcaption>
        </figure>
        `;
    }
    for (const file of files) {
        res += `
        <figure style="width: min-content" id=${"file_" + file.id}>
            <img src="public/img/file.png" alt="File">
            <figcaption>${file.name}</figcaption>
        </figure>
        `;
    }
    return res;
};

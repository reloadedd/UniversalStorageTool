/* =================
 * --- Constants ---
 * =================
 */
const MAX_ITEM_LENGTH = 17;

/* =================
 * --- Functions ---
 * =================
 */
function fitNameInsideFigcaption(itemName) {
    let fitItemName = itemName.substring(0, MAX_ITEM_LENGTH);

    if (itemName.length > MAX_ITEM_LENGTH) {
        fitItemName += "...";
    }

    return fitItemName;
}

exports.templateDirectoriesAndFiles = (dirs, files) => {
    let res = "";

    for (const dir of dirs) {
        res += `
        <figure class="directory" id=${"dir_" + dir.id}>
            <img src="public/img/folder.png" alt="Directory">
            <figcaption>${fitNameInsideFigcaption(dir.name)}</figcaption>
        </figure>
        `;
    }

    for (const file of files) {
        res += `
        <figure class="file" id=${"file_" + file.id}>
            <img src="public/img/file.png" alt="File">
            <figcaption>${fitNameInsideFigcaption(file.name)}</figcaption>
        </figure>
        `;
    }

    return res;
};

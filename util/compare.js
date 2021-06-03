async function hasFile(dir, file) {
    const files = await dir.getFiles();
    for (let i = 0; i < files.length; i++)
        if (files[i].id === file.id) return true;

    const dirs = await dir.getDirectories();
    if (dirs.length === 0) return false;
    for (let i = 0; i < dirs.length; i++) {
        if (await hasFile(dirs[i], file)) return true;
    }

    return false;
}

module.exports = {
    hasFile,
};

const fs = require("fs");
exports.setFileToUser = async (fid, db) => {
    const configFile = JSON.parse(
        await fs.readFileSync("./tmp/" + fid + ".config.json"),
    );
    const User = db.users;
    const File = db.files;
    const me = await User.findOne({ where: { email: configFile.user } });
    const thisFile = await File.create({
        name: configFile.name,
        size: configFile.totalSize,
        mimeType: configFile.mimeType,
    });
    me.addFile(thisFile);
};

const fs = require("fs");
const fetch = require("node-fetch");
exports.setFileToUser = async (fid, req) => {
    const configFile = JSON.parse(
        await fs.readFileSync("./tmp/" + fid + ".config.json"),
    );
    const User = req.db.users;
    const File = req.db.files;
    const Fragment = req.db.fragments;
    const Directory = req.db.directories;
    const thisFile = await File.create({
        name: configFile.name,
        size: configFile.totalSize,
        mimeType: configFile.mimeType,
    });
    if (!configFile.parentFolder) {
        const me = await User.findOne({ where: { email: configFile.user } });
        me.addFile(thisFile);
    } else {
        const parentDir = await Directory.findOne({
            where: {
                id: configFile.parentFolder,
            },
        });
        parentDir.addFile(thisFile);
    }

    const gDriveData = await (
        await fetch("https://www.googleapis.com/drive/v2/about", {
            method: "GET",
            headers: {
                Authorization: "Bearer " + req.gDriveToken,
            },
        })
    ).json();
    const gDriveAvailableSpace =
        gDriveData.quotaBytesTotal - gDriveData.quotaBytesUsedAggregate;

    if (gDriveAvailableSpace >= configFile.totalSize) {
        console.log("Can and will upload to google Drive");

        // get the file size
        const stat = fs.statSync("./tmp/" + fid);
        const fileStream = fs.createReadStream("./tmp/" + fid);

        // POST request to create a file on drive.
        const response = await fetch(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=media",
            {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + req.gDriveToken,
                    "Content-Length": stat.size,
                },
                body: fileStream,
            },
        );

        const gDriveFileId = (await response.json()).id;

        fs.rmSync("./tmp/" + fid + ".config.json");
        fs.rmSync("./tmp/" + fid);

        const newFileFragment = await Fragment.create({
            id: gDriveFileId,
            // just decided: google drive will have index 0
            driveType: 0,
            index: 0,
        });
        thisFile.addFragment(newFileFragment);
    } else {
        console.log("We are yet to fragment things");
    }
};

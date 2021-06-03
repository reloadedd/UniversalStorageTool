const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

exports.refreshGoogleDriveToken = async (req, res) => {
    if (req.gDriveToken || !req.jwtToken) return;

    const User = req.db.users;
    try {
        const userEmail = jwt.verify(req.jwtToken, req.UNST_JWT_SECRET).email;
        const thisUser = await User.findOne({ where: { email: userEmail } });
        const drive = await thisUser.getGoogleDrive();
        if (!drive) return;
        const data = await (
            await fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                body: JSON.stringify({
                    client_id: process.env.UNST_GDRIVE_CLIENT_ID,
                    client_secret: process.env.UNST_GDRIVE_CLIENT_SECRET,
                    grant_type: "refresh_token",
                    refresh_token: drive.refreshToken,
                }),
            })
        ).json();
        if (data.access_token && data.expires_in) {
            if (!req.cookies) req.cookies = [];
            req.cookies.push(
                "gDriveToken=" +
                    data.access_token +
                    "; path=/; HttpOnly; Max-Age=" +
                    data.expires_in,
            );
            req.gDriveToken = data.access_token;
        }
    } catch (err) {
        console.log(err.message);
    }
};

exports.refreshDropboxToken = async (req, res) => {
    if (req.dropboxToken || !req.jwtToken) return;

    const User = req.db.users;
    try {
        const userEmail = jwt.verify(req.jwtToken, req.UNST_JWT_SECRET).email;
        const thisUser = await User.findOne({ where: { email: userEmail } });
        const dropbox = await thisUser.getDropbox();
        if (!dropbox) return;

        const data = await (
            await fetch("https://api.dropboxapi.com/oauth2/token", {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded;charset=UTF-8",
                    Authorization:
                        "Basic " +
                        Buffer.from(
                            process.env.UNST_DROPBOX_APP_KEY +
                                ":" +
                                process.env.UNST_DROPBOX_APP_SECRET,
                        ).toString("base64"),
                },
                body: [
                    "grant_type=refresh_token",
                    "refresh_token=" + dropbox.refreshToken,
                ].join("&"),
            })
        ).json();

        if (data.access_token && data.expires_in) {
            if (!req.cookies) req.cookies = [];
            req.cookies.push(
                "dropboxToken=" +
                    data.access_token +
                    "; path=/; HttpOnly; Max-Age=" +
                    data.expires_in,
            );
            req.dropboxToken = data.access_token;
        }
    } catch (err) {
        console.log(err.message);
    }
};

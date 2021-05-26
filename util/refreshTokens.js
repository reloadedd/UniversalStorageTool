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
        if (!req.cookies) req.cookies = [];
        req.cookies.push(
            "gDriveToken=" +
                data.access_token +
                "; path=/; HttpOnly; Max-Age=" +
                data.expires_in,
        );
        req.gDriveToken = data.access_token;
    } catch (err) {
        console.log(err.message);
    }
};

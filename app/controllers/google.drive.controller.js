const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
exports.onAuth = (req, res) => {
    try {
        if (req.gDriveToken) {
            res.writeHead(307, {
                Location: "/account",
            });
            res.end();
            return;
        }
        jwt.verify(req.jwtToken, req.JWT_SECRET);

        res.writeHead(307, {
            Location:
                "https://accounts.google.com/o/oauth2/v2/auth" +
                "?redirect_uri=" +
                (process.env.IS_UP
                    ? "http://reloadedd.me:2999/account"
                    : "http://localhost:2999/account") +
                "&prompt=consent" +
                "&response_type=code" +
                "&client_id=" +
                (process.env.GDRIVE_CLIENT_ID || "") +
                "&scope=https://www.googleapis.com/auth/drive" +
                "&access_type=offline",
        });
        res.end();
    } catch {
        res.writeHead(307, {
            Location: "/login",
        });
        res.end();
    }
};

exports.onAdd = async (req, res) => {
    try {
        const userEmail = jwt.verify(req.body.jwtToken, req.JWT_SECRET).email;
        if (!req.body || !req.body.refreshToken) throw new Error();

        const user = await req.db.users.findOne({
            where: { email: userEmail },
        });
        const drive = await req.db.googleDrives.create({
            refreshToken: req.body.refreshToken,
        });
        user.setGoogleDrive(drive);
    } catch {
        res.writeHead(400, {
            "Content-Type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "Bad data.",
            }),
        );
    }
};

exports.refreshToken = async (req, res) => {
    if (!req.body.refreshToken) {
        res.writeHead(400, {
            "Content-Type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "bro I need the refresh token to do anything",
            }),
        );
        return;
    }

    const data = await (
        await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            body: JSON.stringify({
                client_id: process.env.GDRIVE_CLIENT_ID,
                client_secret: process.env.GDRIVE_CLIENT_SECRET,
                grant_type: "refresh_token",
                refresh_token: req.body.refreshToken,
            }),
        })
    ).json();
    res.writeHead(200, {
        "Content-Type": "application/json",
    });
    res.end(
        JSON.stringify({
            accessToken: data.access_token,
        }),
    );
};

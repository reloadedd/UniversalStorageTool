const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
exports.onAuth = (req, res) => {
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
        res.writeHead(200, {
            "Content-Type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "Drive account added.",
            }),
        );
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

exports.getSpace = async (req, res) => {
    const data = await (
        await fetch("https://www.googleapis.com/drive/v2/about", {
            method: "GET",
            headers: {
                Authorization: "Bearer " + req.gDriveToken,
            },
        })
    ).json();
    if (req.cookies) {
        res.writeHead(200, {
            "Content-Type": "application/json",
            "Set-Cookie": req.cookies,
        });
    } else {
        res.writeHead(200, {
            "Content-Type": "application/json",
        });
    }
    res.end(
        JSON.stringify({
            totalSpace: data.quotaBytesTotal,
            usedSpace: data.quotaBytesUsedAggregate,
        }),
    );
};

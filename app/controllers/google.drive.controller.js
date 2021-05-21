const jwt = require("jsonwebtoken");
exports.onAuth = (req, res) => {
    try {
        jwt.verify(req.token, req.JWT_SECRET);

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

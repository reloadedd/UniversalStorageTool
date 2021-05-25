const Dispatcher = require("../util/dispatcher");
const {
    onAuth,
    onAdd,
    refreshToken,
    getSpace,
} = require("../app/controllers/google.drive.controller");
const jwt = require("jsonwebtoken");

const dispatcher = new Dispatcher();

dispatcher.on("GET", "/auth", (req, res) => {
    if (req.gDriveToken) {
        res.writeHead(307, {
            Location: "/account",
        });
        res.end();
        return;
    }
    try {
        jwt.verify(req.jwtToken, req.JWT_SECRET);
    } catch {
        res.writeHead(307, {
            Location: "/login",
        });
        res.end();
        return;
    }
    onAuth(req, res);
});

dispatcher.on("POST", "/add", async (req, res) => {
    await onAdd(req, res);
});

dispatcher.on("POST", "/refresh-token", (req, res) => {
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

    refreshToken(req, res);
});

dispatcher.on("GET", "/space", async (req, res) => {
    if (!req.gDriveToken) {
        res.writeHead(307, {
            Location: "/account",
        });
        res.end();
        return;
    }
    try {
        jwt.verify(req.jwtToken, req.JWT_SECRET);
    } catch {
        res.writeHead(307, {
            Location: "/login",
        });
        res.end();
        return;
    }
    await getSpace(req, res);
});

module.exports = dispatcher;

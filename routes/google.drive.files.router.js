const Dispatcher = require("../util/dispatcher");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const { getFile } = require("../app/controllers/google.drive.files.controller");

const dispatcher = new Dispatcher();

dispatcher.on("GET", "", (req, res) => {
    try {
        jwt.verify(req.jwtToken, req.UNST_JWT_SECRET);
    } catch {
        res.writeHead(StatusCodes.TEMPORARY_REDIRECT, {
            Location: "/login",
        });
        res.end();
        return;
    }
    if (!req.gDriveToken) {
        res.writeHead(StatusCodes.FORBIDDEN, {
            "Content-Type": "application/json",
        });
        res.end(
            JSON.stringify({
                message:
                    "You need a linked google drive account for this, obviously",
            }),
        );
        return;
    }
    getFile(req, res);
});

module.exports = dispatcher;

const Dispatcher = require("../util/dispatcher");
const { StatusCodes } = require("http-status-codes");
const fs = require("fs");
const {
    onFileGet,
    createFile,
    uploadToFile,
    createDir,
} = require("../app/controllers/file.controller");
const jwt = require("jsonwebtoken");
const url = require("url");
const dispatcher = new Dispatcher();

dispatcher.on("GET", "/files", async (req, res) => {
    try {
        jwt.verify(req.jwtToken, req.UNST_JWT_SECRET);

        onFileGet(req, res);
    } catch {
        res.writeHead(StatusCodes.FORBIDDEN, {
            "Content-type": "application/json",
        });
        res.end(
            JSON.stringify({ message: "Cannot get a file if not logged in" }),
        );
    }
});

dispatcher.on("POST", "/files", (req, res) => {
    try {
        jwt.verify(req.jwtToken, req.UNST_JWT_SECRET);
        if (!req.gDriveToken) throw new Error();
        createFile(req, res);
    } catch {
        res.writeHead(StatusCodes.FORBIDDEN, {
            "Content-type": "application/json",
        });
        res.end(
            JSON.stringify({ message: "Cannot get a file if not logged in" }),
        );
    }
});

dispatcher.on("PUT", "/files", (req, res) => {
    try {
        jwt.verify(req.jwtToken, req.UNST_JWT_SECRET);
        if (
            !req.headers["content-length"] ||
            !req.headers["content-range"] ||
            !req.headers["location"] ||
            !fs.existsSync("./tmp/" + req.headers["location"]) ||
            !req.data ||
            req.data.length !== parseInt(req.headers["content-length"])
        )
            throw new Error();

        uploadToFile(req, res);
    } catch {
        console.log("thrown here");
        res.writeHead(StatusCodes.BAD_REQUEST, {
            "Content-type": "application/json",
        });
        res.end(
            JSON.stringify({ message: "Make sure the data is set properly" }),
        );
    }
});

dispatcher.on("POST", "/files/newDir", (req, res) => {
    try {
        jwt.verify(req.jwtToken, req.UNST_JWT_SECRET);
        createDir(req, res);
    } catch {
        res.writeHead(StatusCodes.FORBIDDEN, {
            "Content-Type": "application.json",
        });
        res.end(
            JSON.stringify({
                message: "log in maybe?",
            }),
        );
    }
});

module.exports = dispatcher;

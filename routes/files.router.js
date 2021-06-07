const Dispatcher = require("../util/dispatcher");
const { StatusCodes } = require("http-status-codes");
const fs = require("fs");
const {
    getFiles,
    createFile,
    uploadToFile,
    createDir,
    getFile,
    renameDirectory,
    renameFile,
} = require("../app/controllers/file.controller");
const jwt = require("jsonwebtoken");
const url = require("url");
const dispatcher = new Dispatcher();

dispatcher.on("GET", "", async (req, res) => {
    try {
        jwt.verify(req.jwtToken, req.UNST_JWT_SECRET);

        if (!url.parse(req.url, true).query.id) getFiles(req, res);
        else getFile(req, res);
    } catch {
        res.writeHead(StatusCodes.FORBIDDEN, {
            "Content-type": "application/json",
        });
        res.end(
            JSON.stringify({ message: "Cannot get a file if not logged in" }),
        );
    }
});

dispatcher.on("POST", "", (req, res) => {
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

dispatcher.on("PUT", "", (req, res) => {
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
        res.writeHead(StatusCodes.BAD_REQUEST, {
            "Content-type": "application/json",
        });
        res.end(
            JSON.stringify({ message: "Make sure the data is set properly" }),
        );
    }
});

dispatcher.on("POST", "/newDir", (req, res) => {
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

dispatcher.on("PATCH", "/dir", (req, res) => {
    if (!url.parse(req.url, true).query.id || !req.body.newName) {
        res.writeHead(StatusCodes.BAD_REQUEST, {
            "Content-Type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "bad parameters",
            }),
        );
        return;
    }
    try {
        jwt.verify(req.jwtToken, req.UNST_JWT_SECRET);
        renameDirectory(req, res);
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

dispatcher.on("PATCH", "/file", (req, res) => {
    if (!url.parse(req.url, true).query.id || !req.body.newName) {
        res.writeHead(StatusCodes.BAD_REQUEST, {
            "Content-Type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "no id provided",
            }),
        );
        return;
    }
    try {
        jwt.verify(req.jwtToken, req.UNST_JWT_SECRET);
        renameFile(req, res);
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

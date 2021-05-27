const Dispatcher = require("../util/dispatcher");
const { StatusCodes } = require("http-status-codes");
const fs = require("fs");
const {
    onFileGet,
    createFile,
    uploadToFile,
} = require("../app/controllers/file.controller");
const jwt = require("jsonwebtoken");
const url = require("url");
const dispatcher = new Dispatcher();

dispatcher.on("GET", "/files", (req, res) => {
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
        console.log(req.data.length);
        console.log(req.headers["content-length"]);
        if (
            !req.headers["content-length"] ||
            !req.headers["content-range"] ||
            !url.parse(req.url, true).query.fid ||
            !fs.existsSync("./tmp/" + url.parse(req.url, true).query.fid) ||
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

module.exports = dispatcher;

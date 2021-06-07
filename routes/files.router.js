const Dispatcher = require("../util/dispatcher");
const { StatusCodes } = require("http-status-codes");
const fs = require("fs");
const {
    getFiles,
    createFile,
    uploadToFile,
    createDirectory,
    getFile,
} = require("../app/controllers/file.controller");

const { deleteFileFromOneDrive } = require("../public/js/onedrive/server-side");

const jwt = require("jsonwebtoken");
const util = require("util");
const url = require("url");
const dispatcher = new Dispatcher();

dispatcher.on("GET", "/files", async (req, res) => {
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
        createDirectory(req, res);
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

dispatcher.on("DELETE", "/files", (req, res) => {
    try {
        jwt.verify(req.jwtToken, req.UNST_JWT_SECRET);
        console.log(util.inspect(req.body, { depth: null }));
        // deleteFileFromOneDrive(req, res);
    } catch {
        res.writeHead(StatusCodes.FORBIDDEN, {
            "Content-Type": "application.json"
        });
        res.end(
            JSON.stringify({
                response_type: "error",
                message: "Could not perform delete action because the user is not authenticated."
            })
        );
    }
});

module.exports = dispatcher;

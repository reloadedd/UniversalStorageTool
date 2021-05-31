const useragent = require("useragent");
const fs = require("fs");
const url = require("url");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { StatusCodes } = require("http-status-codes");
const fileTemplate = require("../models/file.model");
exports.onFileGet = (req, res) => {
    const browser = useragent.parse(req.headers["user-agent"]);

    /* Log the request to the stdout */
    console.log(
        "[ LOG ]:".bold,
        req.headers["host"],
        "(",
        browser.toString(),
        ")",
        "->",
        req.url,
    );
    const id = url.parse(req.url, true).query.id;
    res.writeHead(StatusCodes.OK, { "Content-type": "text/plain" });
    res.end(fileTemplate(id, id));
};

exports.createFile = (req, res) => {
    try {
        let fileName;
        do {
            fileName = crypto.randomBytes(32).toString("hex");
        } while (fs.existsSync("./tmp/" + fileName));
        fs.appendFileSync("./tmp/" + fileName, "");
        fs.writeFileSync(
            "./tmp/" + fileName + ".config.json",
            JSON.stringify({
                user: jwt.verify(req.jwtToken, req.UNST_JWT_SECRET).email,
                written: 0,
            }),
        );
        if (req.cookies) {
            res.writeHead(StatusCodes.CREATED, {
                "Set-Cookie": req.cookies,
                Location: fileName,
                "Content-Length": 0,
            });
        } else {
            res.writeHead(StatusCodes.CREATED, {
                Location: fileName,
                "Content-Length": 0,
            });
        }
        res.end();
    } catch (err) {
        console.log(err.message);
        res.writeHead(StatusCodes.INTERNAL_SERVER_ERROR, {
            "Content-Type": "text/plain",
        });
        res.end();
    }
};

exports.uploadToFile = (req, res) => {
    const fid = req.headers["location"];
    const fileConfig = JSON.parse(
        fs.readFileSync("./tmp/" + fid + ".config.json").toString("utf-8"),
    );
    let [range, total] = req.headers["content-range"]
        .replace("bytes ", "")
        .split("/");
    total = parseInt(total);
    const [start, end] = range.split("-").map((i) => parseInt(i));
    if (!fileConfig.totalSize) fileConfig.totalSize = total;
    if (
        fileConfig.written !== start ||
        parseInt(req.headers["content-length"]) !== end - start
    ) {
        res.writeHead(StatusCodes.BAD_REQUEST, {
            Range: "bytes=0-" + fileConfig.written,
            "Content-Type": "text/plain",
        });
        res.end();
        return;
    }

    try {
        fs.appendFileSync("./tmp/" + fid, req.data);
        fileConfig.written = end;
        fs.writeFileSync(
            "./tmp/" + fid + ".config.json",
            JSON.stringify(fileConfig),
        );
        if (end == total) {
            res.writeHead(StatusCodes.OK, {
                Range: "bytes=0-" + fileConfig.written,
                "Content-Type": "application/json",
            });
            res.end(
                JSON.stringify({
                    message: "File upload complete",
                }),
            );
            return;
        }

        res.writeHead(StatusCodes.PARTIAL_CONTENT, {
            Range: "bytes=0-" + fileConfig.written,
            "Content-Type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "Chunk uploaded.",
            }),
        );
    } catch (e) {
        console.log(e.message);
        res.writeHead(StatusCodes.INTERNAL_SERVER_ERROR, {
            "Content-Type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "Sorry for that..",
            }),
        );
    }
};

const useragent = require("useragent");
const fs = require("fs");
const url = require("url");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { StatusCodes } = require("http-status-codes");
const { setFileToUser } = require("../../util/set.file");
const { templateDirectoriesAndFiles } = require("../../util/templates");
exports.onFileGet = async (req, res) => {
    const browser = useragent.parse(req.headers["user-agent"]);

    let files;
    let folders;

    if (!url.parse(req.url, true).query.did) {
        const me = await req.db.users.findOne({
            where: {
                email: jwt.verify(req.jwtToken, req.UNST_JWT_SECRET).email,
            },
        });
        files = await me.getFiles();
        folders = await me.getDirectories();
    } else {
        const dir = await req.db.directories.findOne({
            where: {
                id: url.parse(req.url, true).query.did,
            },
        });
        files = await dir.getFiles();
        folders = await dir.getDirectories();
    }

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
    res.writeHead(StatusCodes.OK, { "Content-type": "text/plain" });
    res.end(templateDirectoriesAndFiles(folders, files));
};

exports.createFile = (req, res) => {
    try {
        let fileName;
        do {
            fileName = crypto.randomBytes(32).toString("hex");
        } while (fs.existsSync("./tmp/" + fileName));
        fs.appendFileSync("./tmp/" + fileName, "");
        const configBody = {
            user: jwt.verify(req.jwtToken, req.UNST_JWT_SECRET).email,
            name: req.body.name,
            totalSize: req.body.size,
            mimeType: req.body.type,
            written: 0,
        };
        fs.writeFileSync(
            "./tmp/" + fileName + ".config.json",
            JSON.stringify(configBody),
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
    if (
        fileConfig.written !== start ||
        parseInt(req.headers["content-length"]) !== end - start ||
        fileConfig.totalSize !== total
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
            setFileToUser(fid, req);
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

exports.testBigFileGet = async (req, res) => {
    const stat = fs.statSync("tmp/cantStop.mp3");
    res.writeHead(StatusCodes.OK, {
        "Content-Type": "audio/mpeg; filename=cantStop",
        "Content-Length": stat.size,
    });
    const readStream = fs.createReadStream("tmp/cantStop.mp3");
    readStream.pipe(res);
};

exports.createDir = async (req, res) => {
    const newDirectory = await req.db.directories.create({
        name: req.body.name,
    });

    if (req.body.parentDir) {
        const parentDir = await req.db.directories.findOne({
            where: {
                id: req.body.parentDir,
            },
        });
        parentDir.addDirectory(newDirectory);
    } else {
        const me = await req.db.users.findOne({
            where: {
                email: jwt.verify(req.jwtToken, req.UNST_JWT_SECRET).email,
            },
        });
        me.addDirectory(newDirectory);
    }
    res.writeHead(StatusCodes.OK, {
        "Content-Type": "application/json",
    });
    res.end(
        JSON.stringify({
            message: "directory created.",
        }),
    );
};

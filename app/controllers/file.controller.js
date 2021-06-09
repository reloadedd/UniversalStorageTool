const useragent = require("useragent");
const fs = require("fs");
const url = require("url");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const zlib = require("zlib");
const { StatusCodes } = require("http-status-codes");
const { downloadFile, uploadToAllDrives } = require("../../util/files");
const { hasFile, hasDirectory } = require("../../util/compare");
const { templateDirectoriesAndFiles } = require("../../util/templates");
const { LOCAL_FILE_STORAGE_PATH } = require("../../config/config");


exports.getFiles = async (req, res) => {
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

exports.createFile = (req, res, compressFile) => {
    try {
        let fileName;
        do {
            fileName = crypto.randomBytes(32).toString("hex");
        } while (fs.existsSync(`${LOCAL_FILE_STORAGE_PATH}/${fileName}`));
        fs.appendFileSync(`${LOCAL_FILE_STORAGE_PATH}/${fileName}`, "");
        const configBody = {
            user: jwt.verify(req.jwtToken, req.UNST_JWT_SECRET).email,
            parentFolder: req.body.parentFolder,
            name: req.body.name,
            totalSize: req.body.size,
            mimeType: req.body.type,
            written: 0,
            compressed: compressFile    /* Boolean which indicate whether to compress or not */
        };

        fs.writeFileSync(`${LOCAL_FILE_STORAGE_PATH}/${fileName}.config.json`, JSON.stringify(configBody));
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

exports.uploadToLocalStorage = (req, res) => {
    let fileHash = req.headers["location"];
    const fileConfig = JSON.parse(
        fs.readFileSync(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}.config.json`).toString("utf-8"),
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
        fs.appendFileSync(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}`, req.data);
        fileConfig.written = end;
        fs.writeFileSync(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}.config.json`,JSON.stringify(fileConfig));
        if (end === total) {
            res.writeHead(StatusCodes.OK, {
                Range: "bytes=0-" + fileConfig.written,
                "Content-Type": "application/json",
            });
            res.end(
                JSON.stringify({
                    message: "File upload complete",
                }),
            );

            if (fileConfig.compressed) {
                const gzipStream = zlib.createGzip();
                const writeStream = fs.createWriteStream(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}.gzip`);
                const readStream = fs.createReadStream(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}`);
                readStream.pipe(gzipStream).pipe(writeStream);

                writeStream.on("finish", () => {
                    fileConfig.name = `${fileConfig.name}.gzip`;
                    fileConfig.totalSize = fs.statSync(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}.gzip`).size;
                    fileConfig.mimeType = 'application/gzip';
                    fs.writeFileSync(`${LOCAL_FILE_STORAGE_PATH}/${fileHash}.config.json`,JSON.stringify(fileConfig));

                    console.log(`Filename: ${fileConfig.name} | Total size: ${fileConfig.totalSize}`)
                    uploadToAllDrives(`${fileHash}.gzip`, req);
                });
            } else {
                uploadToAllDrives(fileHash, req);
            }

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

exports.getFile = async (req, res) => {
    const me = await req.db.users.findOne({
        where: {
            email: jwt.verify(req.jwtToken, req.UNST_JWT_SECRET).email,
        },
    });

    const thisFile = await req.db.files.findOne({
        where: {
            id: url.parse(req.url, true).query.id,
        },
    });

    if (!thisFile) {
        res.writeHead(StatusCodes.BAD_REQUEST, {
            "Content-Type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "no such file",
            }),
        );
        return;
    }

    if (!(await hasFile(me, thisFile))) {
        res.writeHead(StatusCodes.FORBIDDEN, {
            "Content-Type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "not your file bro",
            }),
        );
    }

    downloadFile(req, res, thisFile);
};

exports.createDirectory = async (req, res) => {
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

exports.renameDirectory = async (req, res) => {
    const me = await req.db.users.findOne({
        where: {
            email: jwt.verify(req.jwtToken, req.UNST_JWT_SECRET).email,
        },
    });
    const directory = await req.db.directories.findOne({
        where: {
            id: url.parse(req.url, true).query.id,
        },
    });
    if (!(await hasDirectory(me, directory))) {
        res.writeHead(StatusCodes.FORBIDDEN, {
            "Content-Type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "not yours, bro",
            }),
        );
        return;
    }
    await directory.update({
        name:
            req.body.newName.substr(
                0,
                req.body.newName.lastIndexOf(".") < 0
                    ? req.body.newName.length
                    : req.body().newURL.lastIndexOf("."),
            ) +
            directory.name.substr(
                directory.name.lastIndexOf(".") < 0
                    ? directory.name.length
                    : directory.name.lastIndexOf("."),
                directory.name.length,
            ),
    });
    if (req.cookies) {
        res.writeHead(StatusCodes.OK, {
            "Set-Cookie": req.cookies,
            "Content-Type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "name updated.",
            }),
        );
        return;
    }
    res.writeHead(StatusCodes.OK, {
        "Content-Type": "application/json",
    });
    res.end(
        JSON.stringify({
            message: "name updated.",
        }),
    );
};

exports.renameFile = async (req, res) => {
    const me = await req.db.users.findOne({
        where: {
            email: jwt.verify(req.jwtToken, req.UNST_JWT_SECRET).email,
        },
    });
    const file = await req.db.files.findOne({
        where: {
            id: url.parse(req.url, true).query.id,
        },
    });
    if (!(await hasFile(me, file))) {
        res.writeHead(StatusCodes.FORBIDDEN, {
            "Content-Type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "not yours, bro",
            }),
        );
        return;
    }
    await file.update({
        name:
            req.body.newName.substr(
                0,
                req.body.newName.lastIndexOf(".") < 0
                    ? req.body.newName.length
                    : req.body().newURL.lastIndexOf("."),
            ) +
            file.name.substr(
                file.name.lastIndexOf(".") < 0
                    ? file.name.length
                    : file.name.lastIndexOf("."),
                file.name.length,
            ),
    });
    if (req.cookies) {
        res.writeHead(StatusCodes.OK, {
            "Set-Cookie": req.cookies,
            "Content-Type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "name updated.",
            }),
        );
        return;
    }
    res.writeHead(StatusCodes.OK, {
        "Content-Type": "application/json",
    });
    res.end(
        JSON.stringify({
            message: "name updated.",
        }),
    );
};

const useragent = require("useragent");
const fs = require("fs");
const BASE_VIEW_DIRECTORY = "app/views";
const INDEX = `${BASE_VIEW_DIRECTORY}/index.html`;
const LOGIN = `${BASE_VIEW_DIRECTORY}/login.html`;
const NOT_FOUND = `${BASE_VIEW_DIRECTORY}/not_found.html`;
const Dispatcher = require("../util/dispatcher");
const dispatcher = new Dispatcher();
const filesRouter = require("./files.router");
const userRouter = require("./user.router");
const accountsRouter = require("./account.router");
const googleDriveRouter = require("./google.drive.router");
// TODO: Do this
const onedriveRouter = require("./onedrive.router");
const jwt = require("jsonwebtoken");
const { refreshGoogleDriveToken } = require("../util/refreshTokens");
const { StatusCodes } = require("http-status-codes");

MIMETypes = {
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    xml: "text/xml",
    mp4: "video/mp4",
    png: "image/png",
    ico: "image/x-icon",
};

dispatcher.use("/users", userRouter);
dispatcher.use(/\//, refreshGoogleDriveToken);
dispatcher.use("/g-drive", googleDriveRouter);
dispatcher.use("/onedrive", onedriveRouter);
dispatcher.use("", accountsRouter);
dispatcher.use("", filesRouter);

dispatcher.on("GET", "/", (req, res) => {
    if (!req.jwtToken) {
        res.writeHead(StatusCodes.TEMPORARY_REDIRECT, { Location: "/login" });
        res.end();
        return;
    }
    try {
        jwt.verify(req.jwtToken, req.UNST_JWT_SECRET);
        if (req.cookies) {
            res.writeHead(StatusCodes.OK, {
                "Set-Cookie": req.cookies,
                "Content-Type": "text/html",
            });
        } else {
            res.writeHead(StatusCodes.OK, {
                "Content-Type": "text/html",
            });
        }
        const data = fs.readFileSync("app/views/index.html");
        res.end(data);
    } catch (ex) {
        res.writeHead(StatusCodes.TEMPORARY_REDIRECT, { Location: "/login" });
        res.end();
    }
});

dispatcher.on("GET", /\//, (request, response) => {
    const browser = useragent.parse(request.headers["user-agent"]);
    let resource = request.url.slice(1) === "" ? "/" : request.url.slice(1);
    const extension = request.url.split(".")[1];

    /* Log the request to the stdout */
    console.log(
        "[ LOG ]:".bold,
        request.headers["host"],
        "(",
        browser.toString(),
        ")",
        "->",
        request.url,
    );

    /* Send a MIME type if the resource is well known for us to hear about it, else send nothing */
    const mimetype = MIMETypes[extension === undefined ? "html" : extension];
    if (mimetype) {
        if (request.cookies) {
            response.writeHead(StatusCodes.OK, {
                "Set-Cookie": request.cookies,
                "Content-Type": mimetype,
            });
        } else {
            response.writeHead(StatusCodes.OK, {
                "Content-Type": mimetype,
            });
        }
    }

    if (resource === "register") {
        resource = LOGIN;
    } else if (resource !== "/" && extension === undefined) {
        resource = `${BASE_VIEW_DIRECTORY}/${resource}.html`;
    } else if (resource === "/" || resource === "index.html") {
        resource = INDEX;
    }

    if (fs.existsSync(resource)) {
        fs.readFile(resource, (err, data) => {
            if (err) {
                console.log("[ ERROR ]:".error, err.message);
            } else {
                response.end(data);
            }
        });
    } else {
        /* Send 404 page */
        fs.readFile(NOT_FOUND, (err, data) => {
            if (err) {
                console.log(
                    "[ ERROR ]:".error,
                    "Well, the not found page, is apparently...not found!",
                );
                response.end("NOT FOUND!");
            } else {
                response.end(data);
            }
        });
    }
});

module.exports = dispatcher;

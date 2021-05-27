const useragent = require("useragent");
const url = require("url");
const Dispatcher = require("../util/dispatcher");
const fileTemplate = require("../app/models/file.model");
const { StatusCodes } = require("http-status-codes");
const dispatcher = new Dispatcher();

dispatcher.on("GET", "file", (req, res) => {
    if (!req.jwtToken) {
        res.writeHead(StatusCodes.FORBIDDEN, {
            "Content-type": "application/json",
        });
        res.end(
            JSON.stringify({ message: "Cannot get a file if not logged in" }),
        );
        return;
    }

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
});

module.exports = dispatcher;

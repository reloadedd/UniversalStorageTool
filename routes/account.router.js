const Dispatcher = require("../util/dispatcher");
const { goToLogin, gotCode } = require("../app/controllers/account.controller");
const fs = require("fs");
const { StatusCodes } = require("http-status-codes");

const dispatcher = new Dispatcher();

dispatcher.on("GET", "/account", async (req, res) => {
    if (await goToLogin(req, res)) return;

    if (!(await gotCode(req, res))) {
        if (req.cookies) {
            res.writeHead(StatusCodes.OK, {
                "Content-Type": "text/html",
                "Set-Cookie": req.cookies,
            });
        } else {
            res.writeHead(StatusCodes.OK, {
                "Content-Type": "text/html",
            });
        }
    }
    const data = fs.readFileSync("app/views/account.html");
    res.end(data);
});

module.exports = dispatcher;

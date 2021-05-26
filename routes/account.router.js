const Dispatcher = require("../util/dispatcher");
const { goToLogin, gotCode } = require("../app/controllers/account.controller");
const fs = require("fs");

const dispatcher = new Dispatcher();

dispatcher.on("GET", "account", async (req, res) => {
    console.log("and now we're here");
    if (await goToLogin(req, res)) return;

    if (!(await gotCode(req, res))) {
        if (req.cookies) {
            console.log("Got here?");
            console.log(req.cookies);
            res.writeHead(200, {
                "Content-Type": "text/html",
                "Set-Cookie": req.cookies,
            });
        } else {
            res.writeHead(200, {
                "Content-Type": "text/html",
            });
        }
    }
    const data = fs.readFileSync("app/views/account.html");
    res.end(data);
});

module.exports = dispatcher;

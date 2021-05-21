const Dispatcher = require("../util/dispatcher");
const { goToLogin, gotCode } = require("../app/controllers/account.controller");
const fs = require("fs");

const dispatcher = new Dispatcher();

dispatcher.on("GET", "account", async (req, res) => {
    if (goToLogin(req, res)) return;

    await gotCode(req, res);
    res.writeHead(200, {
        "Content-Type": "text/html",
    });
    const data = fs.readFileSync("app/views/account.html");
    res.end(data);
});

module.exports = dispatcher;

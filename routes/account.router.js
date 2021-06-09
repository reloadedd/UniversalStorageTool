const Dispatcher = require("../util/dispatcher");
const { goToLogin, gotCode } = require("../app/controllers/account.controller");
const fs = require("fs");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
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

dispatcher.on("GET", "/account/metadata", async (req, res) => {
    const User = req.db.users;
    const userEmail = jwt.decode(req.jwtToken).email;
    const thisUser = await User.findOne({ where: { email: userEmail } });

    res.writeHead(StatusCodes.OK, {
        "Content-Type": "application/json",
    });

    res.end(JSON.stringify({
        response_type: "success",
        username: thisUser.displayName,
        registerDate: thisUser.createdAt
    }))
})

module.exports = dispatcher;

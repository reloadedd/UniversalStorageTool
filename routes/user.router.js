const Dispatcher = require("../util/dispatcher");
const userController = require("../app/controllers/user.controller");

const dispatcher = new Dispatcher();

dispatcher.on("POST", "/register", userController.register);
dispatcher.on("POST", "/login", userController.login);
dispatcher.on("POST", "/logout", (req, res) => {
    const cookies = [
        "jwt=; path=/; httpOnly; Max-Age=0",
        "gDriveToken=; path=/; httpOnly; Max-Age=0",
    ];
    res.writeHead(200, {
        "Set-Cookie": cookies,
        "Content-Type": "application/json",
    });
    res.end(
        JSON.stringify({
            message: "logged out",
        }),
    );
});

module.exports = dispatcher;

const Dispatcher = require("../util/dispatcher");
const userController = require("../app/controllers/user.controller");

const dispatcher = new Dispatcher();

dispatcher.on("POST", "/register", userController.register);
dispatcher.on("POST", "/login", userController.login);
dispatcher.on("POST", "/logout", (req, res) => {
    res.writeHead(200, {
        "Set-Cookie": "jwt=; path=/; httpOnly; Expires=-1",
        "Content-Type": "application/json",
    });
    res.end(
        JSON.stringify({
            message: "logged out",
        }),
    );
});

module.exports = dispatcher;

const Dispatcher = require("../util/dispatcher");
const userController = require("../app/controllers/user.controller");
const { StatusCodes } = require("http-status-codes");

const dispatcher = new Dispatcher();

dispatcher.on("POST", "/register", userController.register);
dispatcher.on("POST", "/login", userController.login);
dispatcher.on("POST", "/logout", (req, res) => {
    const cookies = [
        "jwt=; path=/; httpOnly; Max-Age=0",
        "gDriveToken=; path=/; httpOnly; Max-Age=0",
        "OneDriveToken=; path=/; httpOnly; Max-Age=0",
        "dropboxToken=; path=/; httpOnly; Max-Age=0",
    ];
    res.writeHead(StatusCodes.OK, {
        "Set-Cookie": cookies,
        "Content-Type": "application/json",
    });
    res.end(
        JSON.stringify({
            response_type: "success",
            message: "User successfully logged out.",
        }),
    );
});

module.exports = dispatcher;

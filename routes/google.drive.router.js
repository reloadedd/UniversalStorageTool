const Dispatcher = require("../util/dispatcher");
const {
    onAuth,
    onAdd,
    refreshToken,
} = require("../app/controllers/google.drive.controller");

const dispatcher = new Dispatcher();

dispatcher.on("GET", "/auth", (req, res) => {
    onAuth(req, res);
});

dispatcher.on("POST", "/add", (req, res) => {
    onAdd(req, res);
});

dispatcher.on("POST", "/refresh-token", (req, res) => {
    refreshToken(req, res);
});

module.exports = dispatcher;

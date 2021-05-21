const Dispatcher = require("../util/dispatcher");
const { onAuth, onAdd } = require("../app/controllers/google.drive.controller");

const dispatcher = new Dispatcher();

dispatcher.on("GET", "/auth", (req, res) => {
    onAuth(req, res);
});

dispatcher.on("POST", "/add", (req, res) => {
    onAdd(req, res);
});

module.exports = dispatcher;

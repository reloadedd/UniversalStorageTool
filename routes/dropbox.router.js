const Dispatcher = require("../util/dispatcher");
const { onAuth, onToken } = require("../app/controllers/dropbox.controller");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const dispatcher = new Dispatcher();

dispatcher.on("GET", "/auth", (req, res) => {
    onAuth(req, res);
});

dispatcher.on("GET", "/token", (req, res) => {
    onToken(req, res);
});

module.exports = dispatcher;

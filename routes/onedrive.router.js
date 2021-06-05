const Dispatcher = require("../util/dispatcher");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const { onAuth } = require("../app/controllers/onedrive.controller");
const dispatcher = new Dispatcher();


dispatcher.on("GET", "/auth", (req, res) => {
  if (req.gDriveToken) {
    res.writeHead(StatusCodes.TEMPORARY_REDIRECT, {
      Location: "/account",
    });
    res.end();
    return;
  }
  try {
    jwt.verify(req.jwtToken, req.UNST_JWT_SECRET);
  } catch {
    res.writeHead(StatusCodes.TEMPORARY_REDIRECT, {
      Location: "/login",
    });
    res.end();
    return;
  }
  onAuth(req, res);
});


module.exports = dispatcher;
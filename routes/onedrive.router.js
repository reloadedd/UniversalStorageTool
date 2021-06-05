/* ======================
 * --- Global Imports ---
 * ======================
 */
const url = require("url");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");


/* =====================
 * --- Local Imports ---
 * =====================
 */
const Dispatcher = require("../util/dispatcher");
const { onAuth,
        verifyUserAuthenticated,
        getTokenHavingCode,
        STATE } = require("../app/controllers/onedrive.controller");


/* ===============
 * --- Objects ---
 * ===============
 */
const dispatcher = new Dispatcher();


/* =========================
 * --- Dispatched Routes ---
 * =========================
 */
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

dispatcher.on("GET", "/get_token", async (req, res) => {
  const state = url.parse(req.url, true).query.state;

  if (state !== STATE) {
    res.writeHead(StatusCodes.TEMPORARY_REDIRECT, {
      Location: "/login",
    });
    res.end();
  }

  if (await verifyUserAuthenticated(req, res)) {
    /* Terminate function execution */
    return;
  }

  if (!(await getTokenHavingCode(req, res))) {
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

  res.writeHead(StatusCodes.TEMPORARY_REDIRECT, {
    Location: "/account",
  });
  res.end();
});


/* ======================
 * --- Module Exports ---
 * ======================
 */
module.exports = dispatcher;
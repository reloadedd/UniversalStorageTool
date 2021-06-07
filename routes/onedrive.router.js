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
const {
    onOAuthAuthorization,
    onDriveAddition,
    getAvailableSpace,
    verifyUserAuthenticated,
    getTokensHavingCode,
    ONEDRIVE_STATE,
} = require("../app/controllers/onedrive.controller");

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
    if (req.OneDriveToken) {
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
    onOAuthAuthorization(req, res);
});

dispatcher.on("GET", "/get_token", async (req, res) => {
    const state = url.parse(req.url, true).query.state;

    if (state !== ONEDRIVE_STATE) {
        res.writeHead(StatusCodes.TEMPORARY_REDIRECT, {
            Location: "/login",
        });
        res.end();
    }

    if (!(await verifyUserAuthenticated(req, res))) {
        /* Terminate function execution */
        return;
    }

    if (!(await getTokensHavingCode(req, res))) {
        if (req.cookies) {
            res.writeHead(StatusCodes.TEMPORARY_REDIRECT, {
                Location: "/account",
                "Set-Cookie": req.cookies,
            });
        } else {
            res.writeHead(StatusCodes.TEMPORARY_REDIRECT, {
                Location: "/account",
            });
        }
    }

    res.end();
});

dispatcher.on("POST", "/add", async (req, res) => {
    await onDriveAddition(req, res);
});

dispatcher.on("GET", "/get_available_space", async (req, res) => {
    if (!req.OneDriveToken) {
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

    await getAvailableSpace(req, res);
});

/* ======================
 * --- Module Exports ---
 * ======================
 */
module.exports = dispatcher;

const url = require("url");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const { StatusCodes } = require("http-status-codes");
exports.goToLogin = (req, res) => {
    try {
        jwt.verify(req.jwtToken, req.UNST_JWT_SECRET);
        return false;
    } catch (ex) {
        res.writeHead(StatusCodes.TEMPORARY_REDIRECT, { Location: "/login" });
        res.end();
        return true;
    }
};

exports.gotCode = async (req, res) => {
    const code = url.parse(req.url, true).query.code;
    if (!code) return false;

    const data = await (
        await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            body: JSON.stringify({
                code: code,
                client_id: process.env.UNST_GDRIVE_CLIENT_ID,
                client_secret: process.env.UNST_GDRIVE_CLIENT_SECRET,
                redirect_uri: process.env.UNST_IS_SERVER_UP
                    ? "https://reloadedd.me:3000/account"
                    : "http://localhost:2999/account",
                scope: "https://www.googleapis.com/auth/drive",
                grant_type: "authorization_code",
            }),
        })
    ).json();

    fetch(
        process.env.UNST_IS_SERVER_UP
            ? "https://reloadedd.me:3000/g-drive/add"
            : "http://localhost:2999/g-drive/add",
        {
            method: "POST",
            body: JSON.stringify({
                refreshToken: data.refresh_token,
                jwtToken: req.jwtToken,
            }),
        },
    );
    console.log(data);

    res.writeHead(StatusCodes.OK, {
        "Set-Cookie":
            "gDriveToken=" +
            data.access_token +
            "; path=/; httpOnly; Max-Age=" +
            data.expires_in,
        "Content-Type": "text/html",
    });
    return true;
};

const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const url = require("url");
const { StatusCodes } = require("http-status-codes");
exports.onAuth = (req, res) => {
    res.writeHead(StatusCodes.TEMPORARY_REDIRECT, {
        Location:
            "https://www.dropbox.com/oauth2/authorize" +
            "?client_id=" +
            process.env.UNST_DROPBOX_APP_KEY +
            "&redirect_uri=" +
            (process.env.UNST_IS_SERVER_UP
                ? "https://reloadedd.me:3000/dropbox/token"
                : "http://localhost:2999/dropbox/token") +
            "&token_access_type=offline" +
            "&response_type=code",
    });
    res.end();
};

exports.onToken = async (req, res) => {
    const authorizationCode = url.parse(req.url, true).query.code;
    const data = await (
        await fetch("https://api.dropboxapi.com/oauth2/token", {
            method: "POST",
            headers: {
                Authorization:
                    "Basic " +
                    Buffer.from(
                        process.env.UNST_DROPBOX_APP_KEY +
                            ":" +
                            process.env.UNST_DROPBOX_APP_SECRET,
                    ).toString("base64"),
            },
            body: JSON.stringify({
                code: authorizationCode,
                grant_type: "authorization_code",
                redirect_uri: "http://localhost:2999/account",
            }),
        })
    ).json();

    console.log(data);
    res.end(JSON.stringify(data));
};

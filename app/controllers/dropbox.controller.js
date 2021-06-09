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
                "Content-Type":
                    "application/x-www-form-urlencoded;charset=UTF-8",
                Authorization:
                    "Basic " +
                    Buffer.from(
                        process.env.UNST_DROPBOX_APP_KEY +
                            ":" +
                            process.env.UNST_DROPBOX_APP_SECRET,
                    ).toString("base64"),
            },
            body: [
                "grant_type=authorization_code",
                "redirect_uri=" +
                    (process.env.UNST_IS_SERVER_UP
                        ? "https://reloadedd.me:3000/dropbox/token"
                        : "http://localhost:2999/dropbox/token"),
                ,
                "code=" + authorizationCode,
            ].join("&"),
        })
    ).json();

    console.log(data);

    try {
        const userEmail = jwt.verify(req.jwtToken, req.UNST_JWT_SECRET).email;
        const user = await req.db.users.findOne({
            where: { email: userEmail },
        });
        const drive = await req.db.dropboxes.create({
            refreshToken: data.refresh_token,
        });
        user.setDropbox(drive);
        res.writeHead(StatusCodes.TEMPORARY_REDIRECT, {
            Location: "/account",
        });
        res.end();
    } catch {
        res.writeHead(StatusCodes.BAD_REQUEST, {
            "Content-Type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "Bad data.",
            }),
        );
    }
};

exports.getSpace = async (req, res) => {
    const data = await (
        await fetch("https://api.dropboxapi.com/2/users/get_space_usage", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + req.dropboxToken,
            },
        })
    ).json();
    if (req.cookies) {
        res.writeHead(StatusCodes.OK, {
            "Content-Type": "application/json",
            "Set-Cookie": req.cookies,
        });
    } else {
        res.writeHead(StatusCodes.OK, {
            "Content-Type": "application/json",
        });
    }
    res.end(
        JSON.stringify({
            totalSpace: data.allocation.allocated,
            usedSpace: data.used,
        }),
    );
};

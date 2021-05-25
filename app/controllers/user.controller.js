const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fetch = require("node-fetch");

exports.register = (req, res) => {
    const User = req.db.users;
    if (!req.body || !req.body.email || !req.body.password) {
        res.writeHead(400, {
            "Content-Type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "Content cannot be empty!",
            }),
        );
        return;
    }

    const user = {
        email: req.body.email,
        displayName: req.body.displayName
            ? req.body.displayName
            : req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
    };

    User.create(user)
        .then(async () => {
            res.writeHead(200, {
                "Set-Cookie":
                    "jwt=" +
                    jwt.sign(
                        { id: user.id, email: user.email },
                        req.JWT_SECRET,
                        {
                            expiresIn: "30d",
                        },
                    ) +
                    "; path=/; HttpOnly",
                "Content-Type": "application/json",
            });
            res.end(
                JSON.stringify({
                    message: "Set cookie",
                }),
            );
        })
        .catch((err) => {
            console.log(err);
            res.writeHead(500, {
                "Content-Type": "application/json",
            });
            res.end(
                JSON.stringify({
                    message:
                        err.errors[0].message ||
                        "Some error occurred while creating the User.",
                }),
            );
        });
};

exports.login = async (req, res) => {
    const User = req.db.users;
    if (!req.body || !req.body.email || !req.body.password) {
        res.writeHead(400, {
            "Content-Type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "Content cannot be empty!",
            }),
        );
        return;
    }
    const thisUser = await User.findOne({ where: { email: req.body.email } });
    if (
        !thisUser ||
        !bcrypt.compareSync(req.body.password, thisUser.password)
    ) {
        res.writeHead(400, {
            "Content-Type": "application/json",
        });
        res.end(
            JSON.stringify({
                message: "Bad credentials.",
            }),
        );
        return;
    }
    const cookies = [];
    cookies.push(
        "jwt=" +
            jwt.sign(
                { id: thisUser.id, email: thisUser.email },
                req.JWT_SECRET,
                {
                    expiresIn: "30d",
                },
            ) +
            "; path=/; HttpOnly",
    );
    const drive = await thisUser.getGoogleDrive();
    if (drive) {
        cookies.push(
            "gDriveToken=" +
                (
                    await (
                        await fetch(
                            process.env.IS_UP
                                ? "http://reloadedd.me:2999/g-drive/refresh-token"
                                : "http://localhost:2999/g-drive/refresh-token",
                            {
                                method: "POST",
                                body: JSON.stringify({
                                    refreshToken: drive.refreshToken,
                                }),
                            },
                        )
                    ).json()
                ).accessToken +
                "; path=/; HttpOnly",
        );
    }
    res.writeHead(200, {
        "Set-Cookie": cookies,
        "Content-Type": "application/json",
    });
    res.end(
        JSON.stringify({
            message: "Set cookie",
        }),
    );
};

exports.update = (req, res) => {};

exports.delete = (req, res) => {};

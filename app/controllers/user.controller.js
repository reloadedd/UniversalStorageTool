const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");

exports.register = (req, res) => {
    const User = req.db.users;
    if (!req.body || !req.body.email || !req.body.password) {
        res.writeHead(StatusCodes.BAD_REQUEST, {
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
        displayName: req.body.displayName || req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
    };

    User.create(user)
        .then(async () => {
            res.writeHead(StatusCodes.OK, {
                "Set-Cookie":
                    "jwt=" +
                    jwt.sign(
                        { id: user.id, email: user.email },
                        req.UNST_JWT_SECRET,
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
            res.writeHead(StatusCodes.INTERNAL_SERVER_ERROR, {
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
        res.writeHead(StatusCodes.BAD_REQUEST, {
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
        res.writeHead(StatusCodes.BAD_REQUEST, {
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
                req.UNST_JWT_SECRET,
                {
                    expiresIn: "30d",
                },
            ) +
            "; path=/; HttpOnly",
    );
    res.writeHead(StatusCodes.OK, {
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

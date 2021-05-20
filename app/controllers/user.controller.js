const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../util/secret');

exports.create = (req, res) => {
    const User = req.db.users
    if (!req.body || !req.body.email || !req.body.password) {
        res.writeHead(400, {
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
            message: 'Content cannot be empty!'
        }));
        return;
    }

    const user = {
        email: req.body.email,
        display_name: req.body.display_name ? req.body.display_name : req.body.email,
        password: req.body.password
    };

    User.create(user)
        .then(async data => {
            res.writeHead(200, {
                'Set-Cookie': 'jwt=' + jwt.sign({id: user.id, email: user.email}, JWT_SECRET, {expiresIn: '30d'}) + '; HttpOnly',
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
                message: 'Set cookie'
            }));
        })
        .catch(err => {
            console.log(err);
            res.writeHead(500, {
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
                message:
                    err.errors[0].message || "Some error occurred while creating the User."
            }));
        });
};

exports.login = async (req, res) => {
    const User = req.db.users;
    if (!req.body || !req.body.email || !req.body.password) {
        res.writeHead(400, {
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
            message: 'Content cannot be empty!'
        }));
        return;
    }
    let thisUser = await User.findOne({where: {email: req.body.email, password: req.body.password}})
    if (!thisUser) {
        res.writeHead(400, {
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
            message: 'Bad credentials.'
        }));
        return;
    }
    res.writeHead(200, {
        'Set-Cookie': 'jwt=' + jwt.sign({id: thisUser.id, email: thisUser.email}, JWT_SECRET, {expiresIn: '30d'}) + '; HttpOnly',
        'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
        message: 'Set cookie'
    }));


}

exports.update = (req, res) => {

};

exports.delete = (req, res) => {

};
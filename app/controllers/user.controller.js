const jwt = require('jsonwebtoken');

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
                'Content-Type': 'application/json'
            });
            res.end(jwt.sign(user, 'shh'));
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
        'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({jwt: jwt.sign(thisUser.dataValues, 'shh')}));


}

exports.update = (req, res) => {

};

exports.delete = (req, res) => {

};
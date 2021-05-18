const jwt = require('jsonwebtoken');

exports.create = (req, res) => {
    const User = req.db.users
    if (!req.data.email || !req.data.password) {
        res.writeHead(400, {
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
            message: 'Content cannot be empty!'
        }));
        return;
    }

    const user = {
        email: req.data.email,
        display_name: req.data.display_name ? req.data.display_name : req.data.email,
        password: req.data.password
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

exports.findAll = (req, res) => {
}

exports.login = async (req, res) => {
    const User = req.db.users;
    if (!req.data.email || !req.data.password) {
        res.writeHead(400, {
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
            message: 'Content cannot be empty!'
        }));
        return;
    }
    let thisUser = await User.findOne({where: {email: req.data.email, password: req.data.password}})
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
    res.end(jwt.sign(thisUser.dataValues, 'shh'));


}

exports.findOne = (req, res) => {

};

exports.update = (req, res) => {

};

exports.delete = (req, res) => {

};

exports.deleteAll = (req, res) => {

};

exports.findAllPublished = (req, res) => {

};
const jwt = require('jsonwebtoken');

exports.create = (req, res) => {
    const User = req.db.users;
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    })
    req.on('end', () => {
        data = JSON.parse(data);
        // Validate request
        if (!data.email || !data.password) {
            res.writeHead(400, {
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
                message: 'Content cannot be empty!'
            }));
            return;
        }

        const user = {
            email: data.email,
            display_name: data.display_name ? data.display_name : data.email,
            password: data.password
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

    })
};

exports.findAll = (req, res) => {
}

exports.login = (req, res) => {
    const User = req.db.users;
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    })
    req.on('end', async () => {
        data = JSON.parse(data);
        // Validate request
        if (!data.email || !data.password) {
            res.writeHead(400, {
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
                message: 'Content cannot be empty!'
            }));
            return;
        }
        let thisUser = await User.findOne({where: {email: data.email, password: data.password}})
        if(!thisUser){
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

    });

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
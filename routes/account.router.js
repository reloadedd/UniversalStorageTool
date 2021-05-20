const Dispatcher = require('../util/dispatcher');
const userController = require('../app/controllers/user.controller');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { JWT_SECRET } = require('../util/secret');

let dispatcher = new Dispatcher();

dispatcher.on('GET', 'account', (req, res) => {
    if (!req.token) {
        res.writeHead(307, {Location: '/login'});
        res.end();
        return;
    }

    try {
        jwt.verify(req.token, JWT_SECRET);
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        let data = fs.readFileSync('app/views/account.html');
        res.end(data);
    } catch (ex) {
        res.writeHead(307, {Location: '/login'});
        res.end();
    }
});

module.exports = dispatcher;

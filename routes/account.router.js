const Dispatcher = require('../util/dispatcher');
const userController = require('../app/controllers/user.controller');
const jwt = require('jsonwebtoken');
const fs = require('fs');

let dispatcher = new Dispatcher();

dispatcher.on('GET', 'account', (req, res) => {
    if (!req.token) {
        res.writeHead(307, {Location: '/login'});
        res.end();
        return;
    }

    try {
        let id = jwt.verify(req.token, 'shh');
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

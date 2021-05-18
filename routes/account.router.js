const Dispatcher = require('../util/dispatcher');
const userController = require('../app/controllers/user.controller');

let dispatcher = new Dispatcher();

dispatcher.on('GET', 'account', (req, res) => {
    if(!req.token){
        res.writeHead(301, {Location: '/login'});
        res.end();
    }
});

module.exports = dispatcher;

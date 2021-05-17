const Dispatcher = require('../util/dispatcher');
const userController = require('../app/controllers/user.controller');

let dispatcher = new Dispatcher();

dispatcher.on('POST', 'register', userController.create);
dispatcher.on('POST', 'login', userController.login)

module.exports = dispatcher;
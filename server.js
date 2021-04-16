const http = require('http');
const router = require('./routes/index');
const { PORT, display_banner } = require('./config/config.js');


let server = http.createServer(function(request, response) {
    router.dispatch(request, response);
});

/* Start listening for incoming connections */
server.listen(PORT, 'localhost', () => { display_banner() });
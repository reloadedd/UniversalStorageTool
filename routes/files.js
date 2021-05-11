const ua_parser = require('ua-parser');
const url = require('url');
const Dispatcher = require('../util/dispatcher');
const fileTemplate = require('../app/models/file');
let dispatcher = new Dispatcher();

dispatcher.on('GET', 'file', (req, res) => {
    let browser = ua_parser.parse(req.headers['user-agent']);

    /* Log the request to the stdout */
    console.log('[ LOG ]:'.bold, req.headers['host'], '(', browser.toString(), ')', '->', req.url);
    let id = url.parse(req.url, true).query.id;
    res.writeHead(200, {'Content-type': 'text/plain'})
    res.end(fileTemplate(id, id));
})

module.exports = dispatcher;
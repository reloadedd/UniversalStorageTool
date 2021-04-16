const ua_parser = require('ua-parser');
const ejs = require('ejs');
const url = require('url');
const Dispatcher = require('../util/dispatcher');
let dispatcher = new Dispatcher();

dispatcher.on('GET', 'file', (req, res) => {
    let browser = ua_parser.parse(req.headers['user-agent']);

    /* Log the request to the stdout */
    console.log('[ LOG ]:'.info, req.headers['host'], '(', browser.toString(), ')', '->', req.url);
    let id = url.parse(req.url, true).query.id;
    ejs.renderFile('app/models/file.ejs', {id : id, number: id})
        .then(data => {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(data);
        })
})

module.exports = dispatcher;
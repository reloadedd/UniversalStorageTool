const useragent = require('useragent');
const url = require('url');
const Dispatcher = require('../util/dispatcher');
const fileTemplate = require('../app/models/file.model');
let dispatcher = new Dispatcher();

dispatcher.on('GET', 'file', (req, res) => {
    let browser = useragent.parse(req.headers['user-agent']);

    /* Log the request to the stdout */
    console.log('[ LOG ]:'.bold, req.headers['host'], '(', browser.toString(), ')', '->', req.url);
    let id = url.parse(req.url, true).query.id;
    res.writeHead(200, {'Content-type': 'text/plain'})
    res.end(fileTemplate(id, id));
})

module.exports = dispatcher;
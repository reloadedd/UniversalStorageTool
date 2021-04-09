const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const HttpDispatcher = require('httpdispatcher');
const ua_parser = require('ua-parser');
const { PORT, display_banner } = require('./config/config.js');
const BASE_VIEW_DIRECTORY = 'app/views'
const INDEX = `${BASE_VIEW_DIRECTORY}/index.html`;
const NOT_FOUND = `${BASE_VIEW_DIRECTORY}/not_found.html`;
let dispatcher = new HttpDispatcher();

dispatcher.onGet('/file', (req, res) => {
  let browser = ua_parser.parse(req.headers['user-agent']);

  /* Log the request to the stdout */
  console.log('[ LOG ]:'.info, req.headers['host'], '(', browser.toString(), ')', '->', req.url);
    ejs.renderFile('app/models/file.ejs', {id : url.parse(req.url, true).id, number: url.parse(req.url, true).id})
        .then(data => {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(data);
    })
})

dispatcher.onGet(/\//, (request, response) => {
  let browser = ua_parser.parse(request.headers['user-agent']);
  let resource = request.url.slice(1) === '' ? '/' : request.url.slice(1);
  let extension = request.url.split('.')[1];

  /* Log the request to the stdout */
  console.log('[ LOG ]:'.info, request.headers['host'], '(', browser.toString(), ')', '->', request.url);

  /* Send a MIME type if the resource is well known for us to hear about it, else send nothing */
  let mimetype = MIMETypes[extension === undefined ? 'html' : extension];
  if (mimetype) {
    response.writeHead(200, {
      'Content-Type': mimetype
    });
  }

  if (resource !== '/' && extension === undefined) {
    resource = `${BASE_VIEW_DIRECTORY}/${resource}.html`
  } else if (resource === '/' || resource === 'index.html') {
    resource = INDEX;
  }

  if (fs.existsSync(resource)) {
    fs.readFile(resource, (err, data) => {
      if (err) {
        console.log('[ ERROR ]:'.error, err.message);
      } else {
        response.end(data);
      }
    });
  } else {
    /* Send 404 page */
    fs.readFile(NOT_FOUND, (err, data) => {
      if (err) {
        console.log('[ ERROR ]:'.error, 'Well, the not found page, is apparently...not found!');
        response.end("NOT FOUND!");
      } else {
        response.end(data);
      }
    });
  }

})

MIMETypes = {
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  xml: 'text/xml',
  mp4: 'video/mp4',
  png: 'image/png',
  ico: 'image/x-icon'
}

let server = http.createServer(function(request, response) {
  dispatcher.dispatch(request, response);
});

/* Start listening for incoming connections */
server.listen(PORT, 'localhost', () => { display_banner() });

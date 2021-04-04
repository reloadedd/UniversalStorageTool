const http = require('http');
const fs = require('fs');
const doAsync = require('doasync');

const PORT = 8080;


http.createServer(function(request, response) {
  console.log('[ INFO ]: Received request from', request.headers['host'], 'using', request.headers['user-agent']);
  response.writeHead(200, {
    'Content-Type': 'text/html'
  });

  doAsync(fs).readFile('app/views/index.html')
      .then((data) => response.end(data));
}).listen(PORT);

console.log(`[ INFO ]: The server is up and running! Talk with it at ${PORT}`);

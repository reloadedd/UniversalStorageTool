const http = require('http');
const https = require('https')
const fs = require('fs');
const db = require('./app/models');
const router = require('./routes');
const { PORT, display_banner, SSL_CA_BUNDLE, SSL_CERTIFICATE, SSL_PRIVATE_KEY } = require('./config/config.js');

let server;
let httpsAvailable;

try {
    /*
     * SSL Configuration in order to enable HTTPS.
     *
     * In order to enable HTTPS, the following are needed:
     *  -- the certificate file (.crt)
     *  -- the private key belonging to the certificate (.key)
     *  -- the ca-bundle.crt file which will be split into an array of multiple certificates
     *
     */
    const certificate = fs.readFileSync(process.env[SSL_CERTIFICATE], {encoding: 'utf8'});
    const privateKey = fs.readFileSync(process.env[SSL_PRIVATE_KEY], {encoding: 'utf8'});
    const caBundle = fs.readFileSync(process.env[SSL_CA_BUNDLE], {encoding:'utf8'});
    const ca = caBundle.split('-----END CERTIFICATE-----\n') .map(cert => cert +'-----END CERTIFICATE-----\r\n');
    /* Remove the last item of the array which isn't a certificate (at least in our case) */
    ca.pop();

    let httpsOptions = {
        cert: certificate,
        ca: ca,
        key: privateKey
    }

    server = https.createServer(httpsOptions, function(request, response) {
        request.db = db;
        router.dispatch(request, response);
    });
    httpsAvailable = true;
} catch (e) {
    server = http.createServer(function(request, response) {
        request.db = db;
        router.dispatch(request, response);
    });
    httpsAvailable = false;
}

/* Start listening for incoming connections */
server.listen(PORT, '0.0.0.0', () => { display_banner(httpsAvailable) });

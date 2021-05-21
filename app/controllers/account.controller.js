const url = require('url');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
exports.goToLogin = (req, res) => {
    if (!req.token) {
        res.writeHead(307, {Location: '/login'});
        res.end();
        return true;
    }
    try {
        jwt.verify(req.token, req.JWT_SECRET);
        return false;
    } catch (ex) {
        res.writeHead(307, {Location: '/login'});
        res.end();
        return true;
    }
}

exports.gotCode = async (req, res) => {
    let code = url.parse(req.url, true).query.code;
    if (!code)
        return;


    let data = await (await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        body: JSON.stringify({
            code: code,
            client_id: process.env.GDRIVE_CLIENT_ID,
            client_secret: process.env.GDRIVE_CLIENT_SECRET,
            redirect_uri: (process.env.IS_UP ? 'http://reloadedd.me:2999/account' : 'http://localhost:2999/account'),
            scope: 'https://www.googleapis.com/auth/drive',
            grant_type: 'authorization_code'
        })
    })).json()


    fetch((process.env.IS_UP ? 'http://reloadedd.me:2999/g-drive/add' : 'http://localhost:2999/g-drive/add'), {
        method: 'POST',
        body: JSON.stringify({
            refreshToken: data.refresh_token,
            jwtToken: req.token
        })
    })


}
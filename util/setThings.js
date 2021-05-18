exports.setData = (req, res) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        data = JSON.parse(data);
        req.body = data;
    });
}

exports.setToken = (req, res) => {
    req.token = req.headers['authorization'].replace('Bearer ', '');
}
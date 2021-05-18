exports.setData = (req, res) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        try {
            data = JSON.parse(data);
            req.body = data;
        } catch {
            console.log("no data");
        }
    });
}

exports.setToken = (req, res) => {
    try {
        req.token = req.headers['authorization'].replace('Bearer ', '');
    } catch {
        console.log("no token");
    }
}
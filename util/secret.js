const fs = require('fs');
try{
    exports.JWT_SECRET = fs.readFileSync('jwt_secret.env', 'utf-8');
} catch {
    exports.JWT_SECRET = 'shh';
}
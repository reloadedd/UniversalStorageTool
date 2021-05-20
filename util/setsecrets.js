module.exports = (req) => {
    req.JWT_SECRET = process.env.JWT_SECRET || 'shh';
}
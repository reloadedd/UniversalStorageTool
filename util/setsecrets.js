module.exports = (req) => {
    req.UNST_JWT_SECRET = process.env.UNST_JWT_SECRET || "shh";
};

module.exports = {
    HOST: process.env.UNST_DATABASE_HOST,
    USER: process.env.UNST_DATABASE_USER,
    PASSWORD: process.env.UNST_DATABASE_PASSWORD,
    DB: process.env.UNST_DATABASE_NAME,
    dialect: "mariadb",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};
module.exports = {
    HOST: process.env.UNST_DATABASE_HOST || "localhost",
    USER: process.env.UNST_DATABASE_USER || "root",
    PASSWORD: process.env.UNST_DATABASE_PASSWORD || "",
    DB: process.env.UNST_DATABASE_NAME || "myCoolDatabase",
    dialect: "mariadb",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
};

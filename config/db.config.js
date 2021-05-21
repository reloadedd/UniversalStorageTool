module.exports = {
    HOST: process.env.DATABASE_HOST || "localhost",
    USER: process.env.DATABASE_USER || "root",
    PASSWORD: process.env.DATABASE_PASSWORD || "",
    DB: process.env.DATABASE_NAME || "myCoolDatabase",
    dialect: "mariadb",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
};

const dbConfig = require("../../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle,
    },
    logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./user.model")(sequelize, Sequelize);
db.googleDrives = require("./googleDrive.model")(sequelize, Sequelize);
db.onedrive = require("./onedrive.model")(sequelize, Sequelize);
db.users.hasOne(db.googleDrives);
db.users.hasOne(db.onedrive);
db.sequelize.sync();

module.exports = db;

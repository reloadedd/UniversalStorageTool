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
db.dropboxes = require("./dropbox.model")(sequelize, Sequelize);
db.directories = require("./directory.model")(sequelize, Sequelize);
db.files = require("./file.model")(sequelize, Sequelize);
db.fragments = require("./fragment.model")(sequelize, Sequelize);

db.users.hasMany(db.directories);
db.users.hasMany(db.files);

db.users.hasOne(db.googleDrives);
db.users.hasOne(db.onedrive);
db.users.hasOne(db.dropboxes);

db.directories.hasMany(db.files);
db.directories.hasMany(db.directories);
db.files.hasMany(db.fragments);

db.sequelize.sync();
module.exports = db;

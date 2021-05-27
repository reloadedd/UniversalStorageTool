module.exports = (sequelize, Sequelize) => {
    return sequelize.define("GoogleDrive", {
        refreshToken: {
            type: Sequelize.STRING,
        },
    });
};

module.exports = (sequelize, Sequelize) => {
    return sequelize.define("Dropbox", {
        refreshToken: {
            type: Sequelize.STRING,
        },
    });
};

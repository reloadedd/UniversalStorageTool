module.exports = (sequelize, Sequelize) => {
    return sequelize.define("OneDrive", {
        refreshToken: {
            type: Sequelize.STRING(512),
        },
    });
};

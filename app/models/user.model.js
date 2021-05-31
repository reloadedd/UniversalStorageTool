module.exports = (sequelize, Sequelize) => {
    return sequelize.define("User", {
        email: {
            type: Sequelize.STRING,
            unique: true,
        },
        displayName: {
            type: Sequelize.STRING,
        },
        password: {
            type: Sequelize.STRING,
        },
    });
};

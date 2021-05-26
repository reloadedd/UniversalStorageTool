module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("User", {
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

    return User;
};

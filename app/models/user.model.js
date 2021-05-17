module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("User", {
        email: {
            type: Sequelize.STRING,
            unique: true
        },
        display_name: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        }
    });

    User.sync();
    return User;
};
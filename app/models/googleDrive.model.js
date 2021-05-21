module.exports = (sequelize, Sequelize) => {
    const GoogleDrive = sequelize.define("GoogleDrive", {
        refreshToken: {
            type: Sequelize.STRING
        }
    });

    return GoogleDrive;
}
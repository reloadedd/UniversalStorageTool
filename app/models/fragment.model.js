module.exports = (sequelize, Sequelize) => {
    return sequelize.define("Fragment", {
        id: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        driveType: {
            type: Sequelize.INTEGER,
        },
        index: {
            type: Sequelize.INTEGER,
        },
    });
};

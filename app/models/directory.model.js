module.exports = (sequelize, Sequelize) => {
    return sequelize.define("Directory", {
        name: {
            type: Sequelize.STRING,
        },
    });
};

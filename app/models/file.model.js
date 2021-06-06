module.exports = (sequelize, Sequelize) => {
    return sequelize.define("File", {
        name: {
            type: Sequelize.STRING,
        },
        size: {
            type: Sequelize.BIGINT,
        },
        mimeType: {
            type: Sequelize.STRING,
        },
    });
};

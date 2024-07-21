const connection = require("../contexts/AppContext");
const sequelize = require("sequelize");

const Direction = connection.define("Direction", {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    IdUser: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    name: {
        type: sequelize.STRING,
        allowNull: false,
    },
    address: {
        type: sequelize.STRING,
        allowNull: false,
    },
    });

module.exports = Direction;
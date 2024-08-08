const connection = require("../contexts/AppContext");
const sequelize = require("sequelize");

const User = connection.define("User", {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: sequelize.STRING,
        allowNull: true,
    },
    lastName: {
        type: sequelize.STRING,
        allowNull: true,
    },
    email: {
        type: sequelize.STRING,
        allowNull: false,
    },
    phone : {
        type: sequelize.STRING,
        allowNull: true,
    },
    password: {
        type: sequelize.STRING,
        allowNull: false,
    },
    picture: {
        type: sequelize.STRING,
        allowNull: true,
    },
    username: {
        type: sequelize.STRING,
        allowNull: false,
    },
    role: {
        type: sequelize.DataTypes.ENUM('admin', 'user', 'commerce', "delivery"),
        allowNull: false,
    },
    openingTime : {
        type: sequelize.TIME,
        allowNull: true,
    },
    closingTime : {
        type: sequelize.TIME,
        allowNull: true,
    },
    commerceType : {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    isActive : {
        type: sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    cedula : {
        type: sequelize.STRING,
        allowNull: true,
    },
    });

module.exports = User;
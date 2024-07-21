const sequelize = require("sequelize");
const connection = require("../contexts/AppContext");

const Order = connection.define("Order", {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    IdUser: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    IdDireccion: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    IdCommerce: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    subtotal: {
        type: sequelize.DOUBLE,
        allowNull: false,
    },
    total : {
        type: sequelize.DOUBLE,
        allowNull: false,
    },
    dateHour: {
        type: sequelize.DATE,
        allowNull: false,
    },
    status: {
        type: sequelize.STRING,
        allowNull: false,
    },
    typeProcess : {
        type: sequelize.STRING,
        allowNull: false,
    },
    });

module.exports = Order;
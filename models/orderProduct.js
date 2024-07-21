const connection = require("../contexts/AppContext");
const sequelize = require("sequelize");

const OrderProduct = connection.define("OrderProduct", {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    IdOrder: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    IdProduct: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    });

module.exports = OrderProduct;
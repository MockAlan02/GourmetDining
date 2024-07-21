const connection = require("../contexts/AppContext");
const sequelize = require("sequelize");

const Product = connection.define("Product", {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: sequelize.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize.STRING,
        allowNull: false,
    },
    price: {
        type: sequelize.DOUBLE,
        allowNull: false,
    },
    picture: {
        type: sequelize.STRING,
        allowNull: false,
    },
    IdGenre: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    IdCommerce: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    });
module.exports = Product;
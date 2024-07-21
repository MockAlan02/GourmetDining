const connection = require("../contexts/AppContext");
const sequelize = require("sequelize");

const Favorite = connection.define("Favorite", {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    IdUser: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    IdCommerce: {
        type: sequelize.INTEGER,
        allowNull: false,
    },

    });
    module.exports = Favorite;
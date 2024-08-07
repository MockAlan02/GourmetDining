const connection = require("../contexts/AppContext");
const sequelize = require("sequelize");

const Genre = connection.define("Genre", {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: sequelize.STRING,
        allowNull: false,
    },
    description : {
        type: sequelize.STRING,
        allowNull: false,
    },
    IdCommerce: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    });
module.exports = Genre;
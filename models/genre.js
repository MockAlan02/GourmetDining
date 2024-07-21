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
    });
module.exports = Genre;
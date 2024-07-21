const connection = require("../contexts/AppContext");
const sequelize = require("sequelize");

const TaxConfiguration = connection.define("TaxConfiguration", {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tax: {
        type: sequelize.DOUBLE,
        allowNull: false,
    },
    });

module.exports = TaxConfiguration;
const connection = require("../contexts/AppContext");
const sequelize = require("sequelize");

const CommerceType = connection.define("CommerceType", {
  id: {
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: sequelize.STRING,
    allowNull: false,
  },
  picture : {
    type: sequelize.STRING,
    allowNull: false,
  },
});

module.exports = CommerceType;

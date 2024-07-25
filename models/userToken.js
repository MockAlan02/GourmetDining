const connection = require("../contexts/AppContext");
const sequelize = require("sequelize");

const UserToken = connection.define("UserToken", {
  id: {
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  token: {
    type: sequelize.STRING,
    allowNull: false,
  },
  userId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  purpose: {
    type: sequelize.STRING,
    allowNull: false,
  },
  expireAt: {
    type: sequelize.DATE,
    allowNull: false,
  },
});

module.exports = UserToken;

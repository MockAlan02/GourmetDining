const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";

<<<<<<< HEAD
const config = require("../config/config.js")[env];

=======
const config = require('../config/configuration')['development']
console.log(process.env.DBName)
console.log(process.env.DBUser)
console.log(process.env.DBName)
console.log(config)
>>>>>>> c96cfceba350b1792ea67111e20bc7f139a2df1e
const connection = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false 
    }
  }
});

//prove connection 
connection
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
module.exports = connection;

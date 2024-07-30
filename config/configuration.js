const config = {
  development: {
    username: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME,
    host: process.env.DBHOST,
    dialect: "postgres",
  }
  
};

module.exports = config;

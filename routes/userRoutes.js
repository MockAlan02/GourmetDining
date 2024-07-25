const express = require("express");
const routes = express.Router();
const { getAllUsers } = require("../controllers/userController");

routes.get("/users", getAllUsers);

module.exports = routes;

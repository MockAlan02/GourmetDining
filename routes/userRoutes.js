const express = require("express");
const routes = express.Router();
const userController = require("../controllers/userController");

routes.get("/users", userController.getAllUsers);

module.exports = routes;

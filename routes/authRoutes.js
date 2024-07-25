const express = require("express");
const routes = express.Router();
const {
  login,
  clientOrDelivery,
  commerce,
} = require("../validators/validators");

const {
  getLogin,
  postLogin,
  getRegister,
  postRegisterClientOrDelivery,
  postRegisterCommerceCliente,
} = require("../controllers/authController");

routes.post("/login", login, postLogin);
routes.post("/registerCommerce", commerce, postRegisterCommerceCliente);
routes.post("/registerclient", clientOrDelivery, postRegisterClientOrDelivery);

module.exports = routes;

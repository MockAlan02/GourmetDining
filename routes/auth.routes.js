const express = require("express");
const routes = express.Router();
const {
  login,
  clientOrDelivery,
  commerce
} = require("../validators/validators");

const {
  getLogin,
  postLogin,
  getRegister,
  getResetPassword,
  postRegisterClientOrDelivery,
  postRegisterCommerceCliente,
} = require("../controllers/auth.controller");

routes.get('/', getLogin);
routes.get('/newPassword', getResetPassword);
routes.post("/login", login, postLogin);
routes.post("/registerCommerce", commerce, postRegisterCommerceCliente);
routes.post("/registerclient", clientOrDelivery, postRegisterClientOrDelivery);

module.exports = routes;

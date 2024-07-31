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
  getRegisterCommerce,
  postRegisterClientOrDelivery,
  postRegisterCommerceCliente,
  getactivationpage,
  resetPasswordToken,
  getnewPassword,
  resetPassword
} = require("../controllers/auth.controller");
const router = require("./customer.routes");

routes.get('/', getLogin);
routes.get("/resetPassword/:token", getnewPassword);
routes.post("/newpasswordToken/:token", resetPassword);
routes.get("/confirmation/:token", getactivationpage);
routes.get('/newPassword', getResetPassword);
routes.post("/resetPassword", resetPasswordToken);
routes.post("/login", login, postLogin);
routes.post("/registerCommerce", commerce, postRegisterCommerceCliente);
routes.get("/registercommerce", getRegisterCommerce);
routes.get("/registerclient", getRegister);
routes.post("/registerclient", clientOrDelivery, postRegisterClientOrDelivery);

module.exports = routes;

const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");

router.get('/', customerController.index);
router.get('/restaurantsbyType', customerController.restaurantsbyType);
router.get("/address", customerController.customeraddress);
router.get("/form/newAdress", customerController.newaddress);
router.post("/form/newAdress", customerController.createAddress);
router.post("/delete/address/:id", customerController.deleteAddress);
router.get('/restaurantsbyType/:id', customerController.restaurantsbyType);
router.post('/filter', customerController.filter);
router.post('/favorite/:id', customerController.favorite);
router.get('/commerceDetails/:id', customerController.commerceDetails);
router.post('/createOrder', customerController.createOrder);
router.put('/updateClient', customerController.updateClient);
router.get('/myOrders', customerController.myOrders);
router.get('/orderDetails/:id', customerController.orderDetails);

module.exports = router;

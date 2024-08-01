const express = require("express");
const router = express.Router();
const delivery = require("../controllers/delivery.controller");

router.get('/', delivery.index)
router.get('/orders', delivery.ordersDelivery)
router.get('/profile', delivery.profileDelivery)


module.exports = router;
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

router.get("/", adminController.index);
router.get("/clients", adminController.listClients);
router.post("/clients/status/:id", adminController.toggleInactiveOrActiveUser);
router.get("/deliveries", adminController.listDeliveries);
router.post(
  "/deliveries/toggle/:id",
  adminController.toggleInactiveOrActiveDelivery
);
router.get("/commerces", adminController.listCommerces);
router.post(
  "/commerces/toggle/:id",
  adminController.toggleInactiveOrActiveCommerce
);
router.get("/config-maintenance", adminController.configMaintenance);
router.get("/configuration/edit/:id", adminController.editConfig);
router.post("/configuration/edit/:id", adminController.saveConfig);
router.get("/admins", adminController.listAdmins);
router.get("/create", adminController.getCreateAdmin);
router.post("/create", adminController.createAdmin);
router.get("/edit/:id", adminController.editAdmin);
router.post("/edit/:id", adminController.saveAdmin);
router.post("/delete/:id", adminController.deleteAdmin);
router.post("/admins/status/:id", adminController.toggleInactiveOrActiveAdmin);

module.exports = router;

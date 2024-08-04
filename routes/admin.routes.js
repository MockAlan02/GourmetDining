const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

router.get('/', adminController.index);
router.get('/clients', adminController.listClients);
router.post('/clients/:id/toggle', adminController.toggleClientStatus);
router.get('/deliveries', adminController.listDeliveries);
router.post('/deliveries/:id/toggle', adminController.toggleDeliveryStatus);
router.get('/commerces', adminController.listCommerces);
router.post('/commerces/:id/toggle', adminController.toggleCommerceStatus);
router.get('/config-maintenance', adminController.configMaintenance);
router.get('/config-edit', adminController.editConfig);
router.post('/config-edit', adminController.saveConfig);
router.get('/admins', adminController.listAdmins);
router.post('/admins/create', adminController.createAdmin);
router.get('/admins/:id/edit', adminController.editAdmin);
router.post('/admins/:id/save', adminController.saveAdmin);
router.post('/admins/:id/delete', adminController.deleteAdmin);

module.exports = router;

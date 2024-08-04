const express = require('express');
const router = express.Router();
const commerceController = require('../controllers/commerce.controller');
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' }); 

router.get('/', commerceController.index);
router.get('/order/:id', commerceController.getOrderDetails);
router.post('/order/:id/assign-delivery', commerceController.assignDelivery);
router.get('/profile', commerceController.getProfile);
router.post('/profile/update', commerceController.updateProfile);
router.get('/products', commerceController.listProducts);
router.get('/products/create', commerceController.createProductForm);
router.post('/products/create', upload.single('image'), commerceController.createProduct);
router.get('/products/edit/:id', commerceController.editProductForm);
router.post('/products/edit/:id', upload.single('image'), commerceController.updateProduct);
router.get('/products/delete/:id', commerceController.deleteProductConfirm);
router.post('/products/delete/:id', commerceController.deleteProduct);
router.get('/categories', commerceController.listCategories);
router.get('/categories/create', commerceController.createCategoryForm);
router.post('/categories/create', commerceController.createCategory);
router.get('/categories/edit/:id', commerceController.editCategoryForm);
router.post('/categories/edit/:id', commerceController.updateCategory);
router.get('/categories/delete/:id', commerceController.deleteCategoryConfirm);
router.post('/categories/delete/:id', commerceController.deleteCategory);

module.exports = router;

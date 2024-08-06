const {body} = require('express-validator');

const login  = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long')
];


const clientOrDelivery =[
    body('name').isString().withMessage('Name must be a string'),
    body('lastName').isString().withMessage('Last name must be a string'),
    body('phone').isNumeric().withMessage('Phone must be a number'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('username').isString().withMessage('Username must be a string'),
    body('role').isString().withMessage('Role must be a string'),
    body('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
    body('confirmPassword').isLength({min: 6}).withMessage('Password must be at least 6 characters long')
];


const commerce = [
    body('username').isString().withMessage('Name must be a string'),
    body('phone').isNumeric().withMessage('Phone must be a number'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('openingTime').isTime().withMessage('Opening time must be a Date'),
    body('closingTime').isTime().withMessage('Closing time must be a Date'),
    body('commerceType').isNumeric().withMessage('Commerce type must be a number'),
    body('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
    body('confirmPassword').isLength({min: 6}).withMessage('Password must be at least 6 characters long')
];
module.exports = {
    login,
    clientOrDelivery,
    commerce
};
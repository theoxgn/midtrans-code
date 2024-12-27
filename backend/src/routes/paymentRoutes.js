const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const { body } = require('express-validator');

// Validation middleware
const validatePayment = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('paymentType').isString().withMessage('Payment type is required'),
  body('items').isArray().withMessage('Items must be an array')
];

// Card token route
router.post('/card/token', [
  body('card_number').isString().notEmpty(),
  body('card_exp_month').isString().notEmpty(),
  body('card_exp_year').isString().notEmpty(),
  body('card_cvv').isString().notEmpty(),
], PaymentController.getCardToken);

// Create transaction route
router.post('/create', PaymentController.createTransaction);

// Notification route
router.post('/notification', PaymentController.handleNotification);

// Get status route
router.get('/status/:orderId', PaymentController.getStatus);

// Get transactions route
router.get('/transactions', PaymentController.getTransactions);

module.exports = router;
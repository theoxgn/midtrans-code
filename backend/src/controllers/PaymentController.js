const { core } = require('../config/midtrans');
const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

class PaymentController {
  static async getCardToken(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { card_number, card_exp_month, card_exp_year, card_cvv } = req.body;

      // Create specific instance for getting card token
      const midtransClient = require('midtrans-client');
      const coreApi = new midtransClient.CoreApi({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY
      });

      // Get card token
      const cardResponse = await coreApi.cardToken({
        card_number,
        card_exp_month,
        card_exp_year,
        card_cvv,
        client_key: process.env.MIDTRANS_CLIENT_KEY // Important: include client key here
      });

      // Log response untuk debugging
      console.log('Card Token Response:', cardResponse);

      res.json(cardResponse);
    } catch (error) {
      console.error('Card Token Error:', error);
      // Log full error untuk debugging
      console.error('Full error:', {
        message: error.message,
        stack: error.stack,
        response: error.ApiResponse
      });
      res.status(500).json({ error: error.message });
    }
  }

  static async createTransaction(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { 
        payment_type, 
        item_details, 
        customer_details, 
        bank_transfer, 
        credit_card,
        gopay, 
        qris 
      } = req.body;
      
      const orderId = `ORDER-${Date.now()}`;
      const gross_amount = item_details.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      // Base transaction details
      const transactionDetails = {
        payment_type,
        transaction_details: {
          order_id: orderId,
          gross_amount: gross_amount 
        },
        item_details,
        customer_details
      };

      // Add payment-specific details based on payment_type
      switch(payment_type) {
        case 'credit_card':
          if (!credit_card?.token_id) {
            throw new Error('Credit card token is required');
          }
          transactionDetails.credit_card = {
            token_id: credit_card.token_id,
            authentication: true,
            secure: true,
            save_token_id: credit_card.save_token_id || false
          };
          break;

        case 'bank_transfer':
          if (!bank_transfer?.bank) {
            throw new Error('Bank selection is required');
          }
          transactionDetails.bank_transfer = {
            bank: bank_transfer.bank,
          };
          break;
          
        case 'gopay':
          transactionDetails.gopay = {
            enable_callback: true,
            callback_url: gopay?.callback_url || process.env.GOPAY_CALLBACK_URL
          };
          break;
          
        case 'qris':
          transactionDetails.qris = {
            acquirer: qris?.acquirer || "gopay"
          };
          break;

        default:
          throw new Error('Invalid payment type');
      }

      // Charge the transaction via Midtrans Core API
      const chargeResponse = await core.charge(transactionDetails);

      console.log('Midtrans Charge Response:', chargeResponse);

      // Prepare payment details for storage
      let payment_details = {
        transaction_id: chargeResponse.transaction_id,
        transaction_status: chargeResponse.transaction_status,
        transaction_time: chargeResponse.transaction_time,
        currency: chargeResponse.currency,
        fraud_status: chargeResponse.fraud_status,
        gross_amount: chargeResponse.gross_amount,
      };

      // Add payment method specific details
      switch(payment_type) {
        case 'credit_card':
          payment_details = {
            ...payment_details,
            card_token: credit_card.token_id,
            masked_card: chargeResponse.masked_card,
            bank: chargeResponse.bank,
            card_type: chargeResponse.card_type,
            redirect_url: chargeResponse.redirect_url,
            three_ds_status: chargeResponse.three_ds_status,
            channel_response_code: chargeResponse.channel_response_code,
            channel_response_message: chargeResponse.channel_response_message
          };
          break;

        case 'bank_transfer':
          payment_details = {
            ...payment_details,
            va_numbers: chargeResponse.va_numbers,
            payment_code: chargeResponse.payment_code,
            bill_key: chargeResponse.bill_key,
            biller_code: chargeResponse.biller_code
          };
          break;
          
        case 'gopay':
          payment_details = {
            ...payment_details,
            qr_code_url: chargeResponse.actions?.find(action => action.name === 'generate-qr-code')?.url,
            deeplink_url: chargeResponse.actions?.find(action => action.name === 'deeplink-redirect')?.url,
            status_url: chargeResponse.actions?.find(action => action.name === 'get-status')?.url
          };
          break;
          
        case 'qris':
          payment_details = {
            ...payment_details,
            qr_string: chargeResponse.qr_string,
            acquirer: chargeResponse.acquirer,
            actions: chargeResponse.actions
          };
          break;
      }

      // Save transaction to database
      const savedTransaction = await Transaction.create({
        orderId: orderId,
        amount: parseFloat(gross_amount),
        paymentType: payment_type,
        payment_details: payment_details,
        status: chargeResponse.transaction_status || 'pending'
      });

      console.log('Saved transaction:', savedTransaction);

      res.json({
        status: 'success',
        message: 'Transaction created successfully',
        data: {
          ...chargeResponse,
          order_id: orderId,
          payment_type,
          amount: gross_amount,
          payment_details: payment_details
        }
      });

    } catch (error) {
      console.error('Payment Error:', error);
      res.status(500).json({ 
        status: 'error',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  static async handleNotification(req, res) {
    try {
      const notification = await core.transaction.notification(req.body);
      
      const orderId = notification.order_id;
      const transactionStatus = notification.transaction_status;
      const fraudStatus = notification.fraud_status;

      let finalStatus;

      // Handle different transaction statuses
      switch (transactionStatus) {
        case 'capture':
          finalStatus = fraudStatus === 'challenge' ? 'challenge' : 
                       fraudStatus === 'accept' ? 'success' : 'failure';
          break;
          
        case 'settlement':
          finalStatus = 'success';
          break;
          
        case 'deny':
        case 'cancel':
        case 'expire':
          finalStatus = 'failure';
          break;
          
        case 'pending':
          finalStatus = 'pending';
          break;
          
        default:
          finalStatus = transactionStatus;
      }

      // Update transaction status in database
      await Transaction.updateStatus(orderId, finalStatus);
      
      res.status(200).json({
        status: 'success',
        message: 'Notification processed',
        data: {
          order_id: orderId,
          transaction_status: transactionStatus,
          fraud_status: fraudStatus,
          final_status: finalStatus
        }
      });
    } catch (error) {
      console.error('Notification Error:', error);
      res.status(500).json({ 
        status: 'error',
        message: error.message
      });
    }
  }

  static async getStatus(req, res) {
    try {
      const { orderId } = req.params;
      
      // Get status from Midtrans
      const midtransStatus = await core.transaction.status(orderId);
      
      // Get transaction from database
      const transaction = await Transaction.getByOrderId(orderId);
      
      if (!transaction) {
        return res.status(404).json({
          status: 'error',
          message: 'Transaction not found'
        });
      }

      res.json({
        status: 'success',
        data: {
          order_id: orderId,
          transaction_id: midtransStatus.transaction_id,
          transaction_status: midtransStatus.transaction_status,
          fraud_status: midtransStatus.fraud_status,
          payment_type: midtransStatus.payment_type,
          currency: midtransStatus.currency,
          gross_amount: midtransStatus.gross_amount,
          transaction_time: midtransStatus.transaction_time
        }
      });
    } catch (error) {
      console.error('Get Status Error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  static async getTransactions(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const transactions = await Transaction.find({
        limit,
        offset,
        orderBy: 'created_at',
        order: 'DESC'
      });

      // Transform transactions to include QR code
      const transformedTransactions = await Promise.all(transactions.map(async transaction => {
        const transactionData = { ...transaction };

        // Parse payment_details if it's a string
        let paymentDetails;
        try {
          paymentDetails = typeof transaction.payment_details === 'string' 
            ? JSON.parse(transaction.payment_details) 
            : transaction.payment_details;
        } catch (error) {
          console.error('Error parsing payment_details:', error);
          paymentDetails = transaction.payment_details;
        }

        // Handle QR code for non-bank transfer payments
        if (transaction.payment_type !== 'bank_transfer' && paymentDetails) {
          if (paymentDetails.actions) {
            const qrCodeAction = paymentDetails.actions.find(action => 
              action.name === 'generate-qr-code'
            );

            if (qrCodeAction) {
              transactionData.qr_code = {
                url: qrCodeAction.url,
                method: qrCodeAction.method
              };
            }
          }

          // Include other relevant payment details
          if (transaction.payment_type === 'qris' && paymentDetails.qr_string) {
            transactionData.qr_string = paymentDetails.qr_string;
          }

          // Include all actions for reference
          if (paymentDetails.actions) {
            transactionData.payment_actions = paymentDetails.actions;
          }
        }

        return transactionData;
      }));

      const total = await Transaction.count();
      const totalPages = Math.ceil(total / limit);

      res.json({
        data: transformedTransactions,
        meta: {
          current_page: page,
          total_pages: totalPages,
          total_records: total,
          per_page: limit
        }
      });
    } catch (error) {
      console.error('Get Transactions Error:', error);
      res.status(500).json({ 
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = PaymentController;
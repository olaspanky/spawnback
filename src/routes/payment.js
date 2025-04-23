const express = require('express');
const router = express.Router();
const axios = require('axios');

// Initialize Paystack transaction
router.post('/paystack/initialize', async (req, res) => {
    try {
      const { email, amount, productId, userId } = req.body;
      const token = req.headers['x-auth-token'] || '';
  
      // Validate required fields
      if (!email || !amount || !productId || !userId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email,
          amount: amount * 100,
          currency: 'NGN',
          callback_url: `https://spawnback.vercel.app/api/payment/paystack/callback`,
          metadata: {
            custom_fields: [
              { display_name: 'User ID', variable_name: 'user_id', value: userId },
              { display_name: 'Product ID', variable_name: 'product_id', value: productId },
              { display_name: 'Token', variable_name: 'token', value: token },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error initializing Paystack transaction:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Failed to initialize payment' });
    }
  });

// Verify Paystack payment after callback
router.get('/paystack/callback', async (req, res) => {
    try {
      const { reference } = req.query;
  
      if (!reference) {
        console.error('Missing reference in Paystack callback');
        return res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
      }
  
      console.log('Verifying Paystack transaction with reference:', reference);
  
      // Verify the transaction with Paystack
      const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });
  
      const { status, data } = response.data;
      console.log('Paystack verification response:', response.data);
  
      if (status && data.status === 'success') {
        console.log('Paystack transaction successful, verifying with backend...');
        const productId = data.metadata.custom_fields.find(field => field.variable_name === 'product_id')?.value;
        const token = data.metadata.custom_fields.find(field => field.variable_name === 'token')?.value;
  
        if (!productId) {
          console.error('Product ID not found in Paystack metadata');
          return res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
        }
  
        if (!token) {
          console.error('Token not found in Paystack metadata');
          return res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
        }
  
        // Call the existing verification endpoint with the token
        const verifyResponse = await axios.post(
          'https://spawnback.vercel.app/api/purchases/verify-payment',
          {
            reference,
            itemID: productId,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token,
            },
          }
        );
  
        console.log('Backend verification response:', verifyResponse.data);
  
        if (verifyResponse.data.success) {
          console.log('Payment verified successfully, redirecting to:', verifyResponse.data.redirectUrl);
          const redirectUrl = verifyResponse.data.redirectUrl;
          res.redirect(`${process.env.FRONTEND_URL}${redirectUrl}`);
        } else {
          console.error('Backend verification failed:', verifyResponse.data.message);
          res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
        }
      } else {
        console.error('Paystack transaction failed:', data.status);
        res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
      }
    } catch (error) {
      console.error('Error verifying Paystack payment:', error.response ? error.response.data : error.message);
      res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
    }
  });

module.exports = router;
const express = require('express');
const axios = require('axios');

const crypto = require('crypto');
const router = express.Router();

const KHALTI_VERIFY_URL = process.env.KHALTI_VERIFY_URL || 'https://khalti.com/api/v2/payment/verify/';
const KHALTI_INITIATE_URL = process.env.KHALTI_INITIATE_URL || 'https://dev.khalti.com/api/v2/epayment/initiate/';
const KHALTI_LOOKUP_URL = process.env.KHALTI_LOOKUP_URL || 'https://dev.khalti.com/api/v2/epayment/lookup/';
const ESEWA_VERIFY_URL = process.env.ESEWA_VERIFY_URL || 'https://esewa.com.np/epay/transrec';

router.post('/khalti/verify', async (req, res) => {
  const { token, amount } = req.body;
  if (!token || !amount) {
    return res.status(400).json({ message: 'Token and amount are required for Khalti verification' });
  }
  if (!process.env.KHALTI_SECRET_KEY) {
    return res.status(500).json({ message: 'Khalti secret key is not configured' });
  }

  const amountInPaisa = Math.round(Number(amount) * 100);

  try {
    const response = await axios.post(
      KHALTI_VERIFY_URL,
      { token, amount: amountInPaisa },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.json({
      success: true,
      reference: response.data.idx || token,
      details: response.data
    });
  } catch (error) {
    console.error('Khalti verification failed', error.response?.data || error.message);
    return res.status(402).json({
      message: 'Khalti payment could not be verified',
      error: error.response?.data || error.message
    });
  }
});

router.post('/khalti/initiate', async (req, res) => {
  if (!process.env.KHALTI_SECRET_KEY) {
    return res.status(500).json({ message: 'Khalti secret key is not configured' });
  }

  const {
    amount,
    purchase_order_id,
    purchase_order_name,
    return_url,
    failure_url,
    website_url,
    customer_info,
    amount_breakdown,
    product_details,
    merchant_username,
    merchant_extra
  } = req.body;

  if (!amount || !purchase_order_id || !purchase_order_name || !return_url || !website_url) {
    return res.status(400).json({
      message: 'amount, purchase_order_id, purchase_order_name, return_url, and website_url are required'
    });
  }

  const amountInPaisa = Math.round(Number(amount) * 100);
  if (Number.isNaN(amountInPaisa) || amountInPaisa <= 0) {
    return res.status(400).json({ message: 'amount must be a positive number' });
  }

  const payload = {
    return_url,
    website_url,
    amount: amountInPaisa,
    purchase_order_id,
    purchase_order_name
  };
  if (failure_url) payload.failure_url = failure_url;
  if (customer_info) payload.customer_info = customer_info;
  if (amount_breakdown) payload.amount_breakdown = amount_breakdown;
  if (product_details) payload.product_details = product_details;
  if (merchant_username) payload.merchant_username = merchant_username;
  if (merchant_extra) payload.merchant_extra = merchant_extra;

  try {
    const response = await axios.post(KHALTI_INITIATE_URL, payload, {
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Khalti initiation failed', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      message: 'Unable to initiate Khalti payment',
      error: error.response?.data || error.message
    });
  }
});

router.post('/khalti/lookup', async (req, res) => {
  const { pidx } = req.body;
  if (!pidx) {
    return res.status(400).json({ message: 'pidx is required to lookup Khalti payment' });
  }
  if (!process.env.KHALTI_SECRET_KEY) {
    return res.status(500).json({ message: 'Khalti secret key is not configured' });
  }

  try {
    const response = await axios.post(
      KHALTI_LOOKUP_URL,
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error('Khalti lookup failed', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      message: 'Unable to lookup Khalti payment',
      error: error.response?.data || error.message
    });
  }
});

router.post('/esewa/verify', async (req, res) => {
  const { pid, amt, refId } = req.body;
  if (!pid || !amt || !refId) {
    return res.status(400).json({ message: 'pid, amt and refId are required for eSewa verification' });
  }
  if (!process.env.ESEWA_MERCHANT_CODE) {
    return res.status(500).json({ message: 'eSewa merchant code is not configured' });
  }

  const form = new URLSearchParams();
  form.append('amt', Number(amt).toFixed(2));
  form.append('rid', refId);
  form.append('pid', pid);
  form.append('scd', process.env.ESEWA_MERCHANT_CODE);

  try {
    const response = await axios.post(ESEWA_VERIFY_URL, form.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const success = /<\s*status\s*>([^<]+)<\s*\/status\s*>/i.exec(response.data);
    const isSuccess = success && /success/i.test(success[1]);

    if (!isSuccess) {
      return res.status(402).json({
        message: 'eSewa reported a failed transaction',
        raw: response.data
      });
    }

    return res.json({
      success: true,
      reference: refId,
      raw: response.data
    });
  } catch (error) {
    console.error('eSewa verification failed', error.response?.data || error.message);
    return res.status(402).json({
      message: 'eSewa payment could not be verified',
      error: error.response?.data || error.message
    });
  }
});

router.post('/esewa/checkout', (req, res) => {
  if (!process.env.ESEWA_SECRET_KEY) {
    return res.status(500).json({ message: 'eSewa secret key is not configured' });
  }

  const { pid, amount, tax_amount, total_amount, product_code } = req.body;
  if (!pid || !amount || !total_amount || !product_code) {
    return res.status(400).json({ message: 'Missing required checkout values' });
  }

  const signedFields = 'total_amount,transaction_uuid,product_code';
  const signaturePayload = `total_amount=${total_amount},transaction_uuid=${pid},product_code=${product_code}`;
  const signature = crypto
    .createHmac('sha256', process.env.ESEWA_SECRET_KEY)
    .update(signaturePayload)
    .digest('base64');

  res.json({
    signature,
    signed_field_names: signedFields,
    payload: {
      amount,
      tax_amount: tax_amount || '0',
      total_amount,
      transaction_uuid: pid,
      product_code
    }
  });
});

router.post('/esewa/status', async (req, res) => {
  const { product_code, total_amount, transaction_uuid } = req.body;
  if (!product_code || !total_amount || !transaction_uuid) {
    return res.status(400).json({ message: 'product_code, total_amount, transaction_uuid are required' });
  }

  const baseUrl = process.env.ESEWA_STATUS_URL || 'https://rc.esewa.com.np/api/epay/transaction/status/';
  const url = `${baseUrl}?product_code=${encodeURIComponent(product_code)}&total_amount=${encodeURIComponent(
    total_amount
  )}&transaction_uuid=${encodeURIComponent(transaction_uuid)}`;

  try {
    const response = await axios.get(url);
    return res.json(response.data);
  } catch (error) {
    console.error('eSewa status check failed', error.response?.data || error.message);
    return res.status(500).json({
      message: 'Unable to fetch eSewa transaction status',
      error: error.response?.data || error.message
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const ordersPath = path.resolve(__dirname, '../data/orders.json');
const pricesPath = path.resolve(__dirname, '../data/prices.json');

function readData(filePath) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
  } catch (err) {
    return [];
  }
}

function writeData(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Get Prices
router.get('/prices', (req, res) => {
  const prices = readData(pricesPath);
  res.json({ success: true, prices: prices[0] || { gasPerKg: 1400, pooledDelivery: 800, expressDelivery: 1500 } });
});

// Create Order
router.post('/orders', (req, res) => {
  try {
    const { name, phone, serviceType, gasKg, deliveryType, details, address, email, hasReceipt } = req.body;

    if (!name || !phone || !serviceType || !address) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const orders = readData(ordersPath);
    const pricesList = readData(pricesPath);
    const rates = pricesList[0] || { gasPerKg: 1400, pooledDelivery: 800, expressDelivery: 1500 };

    let totalPrice = 0;
    let formattedSizeOrDetails = '';

    if (serviceType === 'Gas Refill') {
      const kg = parseFloat(gasKg) || 1;
      const deliveryFee = deliveryType === 'Express' ? rates.expressDelivery : rates.pooledDelivery;
      totalPrice = (kg * rates.gasPerKg) + deliveryFee;
      formattedSizeOrDetails = `${kg}kg Gas (${deliveryType} - ₦${deliveryFee} delivery)`;
    } else if (serviceType === 'Heavy Load') {
      totalPrice = 0; // Confirmed with manager
      formattedSizeOrDetails = `Heavy Load: ${details || 'Appliance/Cargo'} ${hasReceipt ? '[Receipt Verified]' : ''}`;
    } else if (serviceType === 'Errand') {
      totalPrice = 0; // Confirmed with manager
      formattedSizeOrDetails = `Errand: ${details || 'General Errand'}`;
    }

    const orderId = 'NGS-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
      orderId,
      name,
      phone,
      serviceType,
      sizeOrDetails: formattedSizeOrDetails,
      totalPrice,
      address,
      email: email || '',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    writeData(ordersPath, orders);

    res.json({ success: true, orderId, totalPrice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get Order Status for Tracking
router.get('/orders/:orderId', (req, res) => {
  const orders = readData(ordersPath);
  const order = orders.find(o => o.orderId === req.params.orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  
  const pendingCount = orders.filter(o => o.status === 'Pending' && o.serviceType === 'Gas Refill').length;
  res.json({ success: true, status: order.status, batchCount: pendingCount });
});

module.exports = router;
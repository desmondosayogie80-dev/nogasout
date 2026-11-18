const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const ordersPath = path.resolve(__dirname, '../data/orders.json');
const pricesPath = path.resolve(__dirname, '../data/prices.json');

// Helper to safely read JSON files
function readData(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
}

// Helper to safely write JSON files
function writeData(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing file:', err);
  }
}

// Manager PIN Login
router.post('/login', (req, res) => {
  const { pin } = req.body;
  if (pin === '1234') {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid PIN' });
  }
});

// Get All Orders
router.get('/orders', (req, res) => {
  const orders = readData(ordersPath);
  res.json({ success: true, orders });
});

// Update Order Status
router.post('/orders/status', (req, res) => {
  try {
    const { orderId, status } = req.body;
    const orders = readData(ordersPath);
    const orderIndex = orders.findIndex(o => o.orderId === orderId);

    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      writeData(ordersPath, orders);
      res.json({ success: true, message: 'Status updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// Update Prices (Manager only)
router.post('/prices', (req, res) => {
  try {
    const { gasPerKg, pooledDelivery, expressDelivery } = req.body;

    const updatedPrices = [{
      gasPerKg: parseFloat(gasPerKg) || 1400,
      pooledDelivery: parseFloat(pooledDelivery) || 800,
      expressDelivery: parseFloat(expressDelivery) || 1500
    }];

    writeData(pricesPath, updatedPrices);
    res.json({ success: true, message: 'Prices updated successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update prices' });
  }
});

module.exports = router;
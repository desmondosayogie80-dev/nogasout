// Handle PIN Login
async function adminLogin() {
  const pin = document.getElementById('adminPin').value;
  if (!pin) {
    alert('Please enter PIN');
    return;
  }

  try {
    const res = await fetch('/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    const data = await res.json();

    if (data.success) {
      document.getElementById('loginCard').style.display = 'none';
      document.getElementById('dashboardCard').style.display = 'block';
      loadAdminOrders();
      loadAdminPrices();
    } else {
      alert(data.message || 'Invalid PIN');
    }
  } catch (err) {
    alert('Error logging in.');
  }
}

// Fetch and Render Orders
async function loadAdminOrders() {
  const ordersList = document.getElementById('ordersList');
  try {
    const res = await fetch('/admin/orders');
    const data = await res.json();

    if (data.success && data.orders.length > 0) {
      ordersList.innerHTML = data.orders.map(order => `
        <div class="card" style="margin-bottom: 12px; border: 1px solid #334155; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.02);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>Order ID: ${order.orderId}</strong>
            <span style="color: #38bdf8; font-weight: bold; font-size: 13px;">${(order.status || 'pending').toUpperCase()}</span>
          </div>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${order.name} (${order.phone})</p>
          <p style="margin: 5px 0;"><strong>Service:</strong> ${order.serviceType} ${order.kilograms ? '- ' + order.kilograms + 'kg' : ''}</p>
          <p style="margin: 5px 0;"><strong>Address:</strong> ${order.address}</p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₦${order.totalPrice}</p>
          ${order.hasReceipt ? '<p style="color: #10b981; margin: 5px 0;">✔️ Receipt Verified</p>' : ''}
          
          <div style="margin-top: 10px; display: flex; gap: 8px;">
            <button onclick="updateOrderStatus('${order.orderId}', 'dispatched')" style="padding: 6px 12px; background: #0284c7; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Dispatch</button>
            <button onclick="updateOrderStatus('${order.orderId}', 'delivered')" style="padding: 6px 12px; background: #10b981; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Mark Delivered</button>
          </div>
        </div>
      `).join('');
    } else {
      ordersList.innerHTML = '<p style="color: #94a3b8;">No active orders yet.</p>';
    }
  } catch (err) {
    ordersList.innerHTML = '<p style="color: #ef4444;">Failed to load orders.</p>';
  }
}

// Update Order Status
async function updateOrderStatus(orderId, status) {
  try {
    const res = await fetch('/admin/orders/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status })
    });
    const data = await res.json();
    if (data.success) {
      loadAdminOrders();
    } else {
      alert(data.message || 'Failed to update status');
    }
  } catch (err) {
    alert('Error connecting to server.');
  }
}

// Load Current Prices into Form
async function loadAdminPrices() {
  try {
    const res = await fetch('/api/prices');
    const data = await res.json();
    if (data.success && data.prices) {
      const prices = Array.isArray(data.prices) ? data.prices[0] : data.prices;
      if (prices) {
        document.getElementById('adminGasRate').value = prices.gasPerKg || 1400;
        document.getElementById('adminPooledFee').value = prices.pooledDelivery || 800;
        document.getElementById('adminExpressFee').value = prices.expressDelivery || 1500;
      }
    }
  } catch (e) {
    console.error('Failed to load prices', e);
  }
}

// Save Updated Prices
document.addEventListener('DOMContentLoaded', () => {
  const priceForm = document.getElementById('priceForm');
  if (priceForm) {
    priceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        gasPerKg: document.getElementById('adminGasRate').value,
        pooledDelivery: document.getElementById('adminPooledFee').value,
        expressDelivery: document.getElementById('adminExpressFee').value
      };

      try {
        const res = await fetch('/admin/prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          alert('Platform prices updated successfully!');
        } else {
          alert('Failed to update prices.');
        }
      } catch (err) {
        alert('Error connecting to server.');
      }
    });
  }
});
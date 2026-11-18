let gasRate = 1400;
let pooledFee = 800;
let expressFee = 1500;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/prices');
    const data = await res.json();
    if (data.success) {
      gasRate = data.prices.gasPerKg || 1400;
      pooledFee = data.prices.pooledDelivery || 800;
      expressFee = data.prices.expressDelivery || 1500;
    }
  } catch (e) {}

  const serviceSelect = document.getElementById('serviceType');
  const gasOptionsGroup = document.getElementById('gasOptionsGroup');
  const detailsGroup = document.getElementById('detailsGroup');
  const receiptGroup = document.getElementById('receiptGroup');
  const gasKgInput = document.getElementById('gasKg');
  const deliveryTypeSelect = document.getElementById('deliveryType');
  const priceBoxContainer = document.getElementById('priceBoxContainer');
  const priceDisplay = document.getElementById('estimatedPrice');

  function updatePrice() {
    if (serviceSelect.value === 'Gas Refill') {
      const kg = parseFloat(gasKgInput.value) || 0;
      const fee = deliveryTypeSelect.value === 'Express' ? expressFee : pooledFee;
      const total = (kg * gasRate) + fee;
      priceDisplay.textContent = `₦${total.toLocaleString()} (${kg}kg @ ₦${gasRate}/kg + ₦${fee} delivery)`;
      priceBoxContainer.style.display = 'block';
    } else {
      priceBoxContainer.style.display = 'none'; // Determined by manager
    }
  }

  serviceSelect.addEventListener('change', (e) => {
    if (e.target.value === 'Gas Refill') {
      gasOptionsGroup.style.display = 'block';
      detailsGroup.style.display = 'none';
      receiptGroup.style.display = 'none';
      updatePrice();
    } else if (e.target.value === 'Heavy Load') {
      gasOptionsGroup.style.display = 'none';
      detailsGroup.style.display = 'block';
      receiptGroup.style.display = 'block';
    } else {
      gasOptionsGroup.style.display = 'none';
      detailsGroup.style.display = 'block';
      receiptGroup.style.display = 'none';
    }
  });

  gasKgInput.addEventListener('input', updatePrice);
  deliveryTypeSelect.addEventListener('change', updatePrice);
  updatePrice();

  const savedOrderId = localStorage.getItem('nogasout_orderId');
  if (savedOrderId) {
    showTracker(savedOrderId);
  }

  document.getElementById('orderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('name').value,
      phone: document.getElementById('phone').value,
      serviceType: serviceSelect.value,
      gasKg: gasKgInput.value,
      deliveryType: deliveryTypeSelect.value,
      details: document.getElementById('details').value,
      address: document.getElementById('address').value,
      email: document.getElementById('email').value,
      hasReceipt: document.getElementById('hasReceipt').checked
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('nogasout_orderId', data.orderId);
        showTracker(data.orderId);
      } else {
        alert('Failed to submit order');
      }
    } catch (err) {
      alert('Network error');
    }
  });
});

function showTracker(orderId) {
  document.getElementById('formCard').style.display = 'none';
  document.getElementById('trackingCard').style.display = 'block';
  document.getElementById('trackOrderId').textContent = orderId;

  pollStatus(orderId);
  setInterval(() => pollStatus(orderId), 3000);
}

async function pollStatus(orderId) {
  try {
    const res = await fetch(`/api/orders/${orderId}`);
    const data = await res.json();
    if (data.success) {
      document.getElementById('trackStatus').textContent = data.status;
      document.getElementById('trackPool').textContent = data.batchCount;
    }
  } catch (e) {}
}

function resetForm() {
  localStorage.removeItem('nogasout_orderId');
  location.reload();
}
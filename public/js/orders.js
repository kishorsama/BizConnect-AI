<<<<<<< HEAD
// js/orders.js - Order management for vendors

const Orders = {
  // Get vendor orders
  async getVendorOrders() {
    try {
      const response = await API.get(API_CONFIG.endpoints.vendorOrders);
      return response.orders;
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      const response = await API.put(`${API_CONFIG.endpoints.updateOrderStatus}/${orderId}/status`, {
        status
      });
      return response.order;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Render orders for vendor dashboard
  renderOrders(orders, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!orders || orders.length === 0) {
      container.innerHTML = '<p class="no-orders">No orders yet</p>';
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="order-card" data-order-id="${order._id}">
        <div class="order-header">
          <div class="order-info">
            <h3 class="order-id">Order #${order._id.slice(-6)}</h3>
            <p class="customer-info">Customer: ${order.customerId.name} (${order.customerId.email})</p>
            <p class="order-date">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div class="order-status">
            <span class="status-badge status-${order.status}">${order.status}</span>
            <span class="payment-status payment-${order.paymentStatus}">${order.paymentStatus}</span>
          </div>
        </div>
        
        <div class="order-items">
          <h4>Items:</h4>
          ${order.items.map(item => `
            <div class="order-item">
              <span class="item-name">${item.productId.name}</span>
              <span class="item-quantity">Qty: ${item.quantity}</span>
              <span class="item-price">₹${item.price} each</span>
              <span class="item-total">₹${item.price * item.quantity}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="order-footer">
          <div class="order-total">
            <strong>Total: ₹${order.totalAmount}</strong>
          </div>
          <div class="shipping-info">
            <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
          </div>
          <div class="order-actions">
            <select class="status-select" onchange="Orders.changeOrderStatus('${order._id}', this.value)">
              <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
              <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
              <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
              <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </div>
        </div>
      </div>
    `).join('');
  },

  // Change order status
  async changeOrderStatus(orderId, newStatus) {
    try {
      await this.updateOrderStatus(orderId, newStatus);
      this.showMessage(`Order status updated to ${newStatus}`, 'success');
      
      // Reload orders to show updated status
      this.loadVendorOrders();
    } catch (error) {
      console.error('Error changing order status:', error);
      this.showMessage(error.message || 'Failed to update order status', 'error');
    }
  },

  // Load and display orders for vendor
  async loadVendorOrders() {
    try {
      const orders = await this.getVendorOrders();
      this.renderOrders(orders, 'vendor-orders-container');
    } catch (error) {
      console.error('Error loading vendor orders:', error);
      this.showMessage('Failed to load orders', 'error');
    }
  },

  // Show message to user
  showMessage(message, type = 'info') {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    // Add to page
    document.body.appendChild(messageDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 3000);
  },

  // Initialize orders functionality
  init() {
    // Load orders when page loads
    this.loadVendorOrders();
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  Orders.init();
});
=======
// Orders drawer with localStorage mock
(function () {
  const STORAGE_KEY = 'bc_orders_v1';

  const Orders = {
    list: [],
    load() { try { this.list = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { this.list = []; } },
    save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.list)); },
    placeFromCart(cartItems) {
      if (!Array.isArray(cartItems) || cartItems.length === 0) return null;
      const order = {
        id: 'ORD-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        createdAt: new Date().toISOString(),
        items: cartItems,
        status: 'Placed',
      };
      this.list.unshift(order);
      this.save();
      this.render();
      return order;
    },
    render() {
      const listEl = document.getElementById('ordersList');
      if (!listEl) return;
      listEl.innerHTML = '';
      this.list.forEach((o) => {
        const total = o.items.reduce((n, i) => n + i.price * i.qty, 0);
        const block = document.createElement('div');
        block.className = 'rounded-xl border border-gray-100 p-3';
        block.innerHTML = `
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-gray-900">${o.id}</p>
              <p class="text-xs text-gray-500">${new Date(o.createdAt).toLocaleString()}</p>
            </div>
            <div class="text-sm font-semibold">₹${total}</div>
          </div>
          <div class="mt-2 grid grid-cols-3 gap-2">
            ${o.items.slice(0,3).map(i => `<img src="${i.image}" class="h-16 w-full object-cover rounded-lg" alt="">`).join('')}
          </div>
          <div class="mt-2 text-xs text-gray-500">${o.items.length} item(s) • ${o.status}</div>
        `;
        listEl.appendChild(block);
      });
    },
    open() { Drawer.open(); },
    close() { Drawer.close(); }
  };

  const Drawer = {
    open() {
      const d = document.getElementById('ordersDrawer');
      const p = d?.querySelector('aside');
      const b = document.getElementById('ordersBackdrop');
      if (!d || !p || !b) return;
      d.classList.remove('hidden');
      requestAnimationFrame(() => { b.classList.remove('opacity-0'); p.classList.remove('translate-x-full'); });
    },
    close() {
      const d = document.getElementById('ordersDrawer');
      const p = d?.querySelector('aside');
      const b = document.getElementById('ordersBackdrop');
      if (!d || !p || !b) return;
      b.classList.add('opacity-0');
      p.classList.add('translate-x-full');
      setTimeout(() => d.classList.add('hidden'), 200);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    Orders.load();
    Orders.render();
    document.getElementById('ordersClose')?.addEventListener('click', () => Orders.close());
    document.getElementById('ordersBackdrop')?.addEventListener('click', () => Orders.close());
    document.querySelectorAll('[data-open-orders]')?.forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); Orders.open(); }));
  });

  window.BCOrders = Orders;
})();


>>>>>>> 51b6fc2876e28e250d13b5c6fc7f4a55df584577

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
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

  // Load vendor orders
  async loadVendorOrders() {
    try {
      const orders = await this.getVendorOrders();
      this.renderVendorOrders(orders);
    } catch (error) {
      console.error('Error loading vendor orders:', error);
      this.showMessage('Failed to load orders', 'error');
    }
  },

  // Render vendor orders
  renderVendorOrders(orders) {
    const ordersContainer = document.getElementById('vendor-orders-container');
    if (!ordersContainer) return;

    if (!orders || orders.length === 0) {
      ordersContainer.innerHTML = '<div class="text-center py-8 text-gray-500">No orders found</div>';
      return;
    }

    ordersContainer.innerHTML = orders.map(order => `
      <div class="order-item p-4 border border-gray-200 rounded-lg mb-4">
        <div class="flex justify-between items-start mb-2">
          <div>
            <h4 class="font-semibold text-gray-900">Order #${order._id.slice(-8)}</h4>
            <p class="text-sm text-gray-600">Customer: ${order.customerId.name}</p>
            <p class="text-sm text-gray-600">Email: ${order.customerId.email}</p>
          </div>
          <div class="text-right">
            <p class="font-semibold text-green-600">₹${order.totalAmount}</p>
            <span class="badge ${this.getStatusClass(order.status)}">${order.status}</span>
          </div>
        </div>
        
        <div class="mb-3">
          <h5 class="font-medium text-gray-900 mb-2">Items:</h5>
          <div class="space-y-1">
            ${order.items.map(item => `
              <div class="flex justify-between text-sm">
                <span>${item.productId.name} x${item.quantity}</span>
                <span>₹${item.price * item.quantity}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="mb-3">
          <p class="text-sm text-gray-600"><strong>Shipping Address:</strong></p>
          <p class="text-sm text-gray-600">${order.shippingAddress}</p>
        </div>
        
        <div class="flex gap-2">
          <select onchange="Orders.updateOrderStatus('${order._id}', this.value)" class="form-select text-sm">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>
      </div>
    `).join('');
  },

  // Get status class for styling
  getStatusClass(status) {
    const statusClasses = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'processing': 'bg-purple-100 text-purple-800',
      'shipped': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  },

  // Show message
  showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 
      type === 'error' ? 'bg-red-500 text-white' : 
      'bg-blue-500 text-white'
    }`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
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
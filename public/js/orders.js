// js/orders.js - Order management for vendors

const Orders = {
  // Get customer orders
  async getCustomerOrders() {
    try {
      const response = await API.get(API_CONFIG.endpoints.customerOrders);
      return response.orders;
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  },

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

  // Load customer orders
  async loadCustomerOrders() {
    try {
      const orders = await this.getCustomerOrders();
      this.renderCustomerOrders(orders);
    } catch (error) {
      console.error('Error loading customer orders:', error);
      // Don't show error message to user, just log it
    }
  },

  // Load vendor orders
  async loadVendorOrders() {
    try {
      const orders = await this.getVendorOrders();
      this.renderVendorOrders(orders);
    } catch (error) {
      console.error('Error loading vendor orders:', error);
      // Don't show error message to user, just log it
    }
  },

  // Render customer orders
  renderCustomerOrders(orders) {
    const ordersContainer = document.getElementById('ordersList');
    if (!ordersContainer) return;

    if (!orders || orders.length === 0) {
      ordersContainer.innerHTML = '<div class="text-center py-8 text-gray-500"><div class="mb-4"><i data-lucide="package" class="w-12 h-12 mx-auto text-gray-300"></i></div><p class="text-lg font-medium">No orders yet</p><p class="text-sm">Your order history will appear here</p></div>';
      return;
    }

    ordersContainer.innerHTML = orders.map(order => `
      <div class="order-item p-4 border border-gray-200 rounded-lg mb-4">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h4 class="font-semibold text-gray-900">Order #${order.orderNumber || order._id.slice(-8)}</h4>
            <p class="text-sm text-gray-600 mt-1"><i data-lucide="store" class="w-4 h-4 inline mr-1"></i>${order.vendorId.name}</p>
            <p class="text-sm text-gray-600"><i data-lucide="calendar" class="w-4 h-4 inline mr-1"></i>${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div class="text-right">
            <p class="font-semibold text-green-600">₹${order.totalAmount}</p>
            <span class="badge ${this.getStatusClass(order.status)} mt-1">${order.status}</span>
          </div>
        </div>
        
        <div class="mb-3">
          <h5 class="font-medium text-gray-900 mb-2 flex items-center">
            <i data-lucide="package" class="w-4 h-4 mr-2"></i>Items Ordered
          </h5>
          <div class="space-y-2">
            ${order.items.map(item => `
              <div class="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                <span class="font-medium">${item.productId.name} x${item.quantity}</span>
                <span class="font-semibold text-green-600">₹${item.price * item.quantity}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="mb-3">
          <p class="text-sm text-gray-600 mb-1 flex items-center">
            <i data-lucide="map-pin" class="w-4 h-4 mr-2"></i><strong>Shipping Address:</strong>
          </p>
          <p class="text-sm text-gray-600 bg-gray-50 p-2 rounded">${order.shippingAddress}</p>
        </div>
      </div>
    `).join('');
  },

  // Render vendor orders
  renderVendorOrders(orders) {
    const ordersContainer = document.getElementById('vendor-orders-container');
    if (!ordersContainer) return;

    if (!orders || orders.length === 0) {
      ordersContainer.innerHTML = '<div class="text-center py-8 text-gray-500"><div class="mb-4"><i data-lucide="package" class="w-12 h-12 mx-auto text-gray-300"></i></div><p class="text-lg font-medium">No orders yet</p><p class="text-sm">Customer orders will appear here</p></div>';
      return;
    }

    ordersContainer.innerHTML = orders.map(order => `
      <div class="order-item p-4 border border-gray-200 rounded-lg mb-4">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h4 class="font-semibold text-gray-900">Order #${order.orderNumber || order._id.slice(-8)}</h4>
            <p class="text-sm text-gray-600 mt-1"><i data-lucide="user" class="w-4 h-4 inline mr-1"></i>${order.customerId.name}</p>
            <p class="text-sm text-gray-600"><i data-lucide="mail" class="w-4 h-4 inline mr-1"></i>${order.customerId.email}</p>
          </div>
          <div class="text-right">
            <p class="font-semibold text-green-600">₹${order.totalAmount}</p>
            <span class="badge ${this.getStatusClass(order.status)} mt-1">${order.status}</span>
          </div>
        </div>
        
        <div class="mb-3">
          <h5 class="font-medium text-gray-900 mb-2 flex items-center">
            <i data-lucide="package" class="w-4 h-4 mr-2"></i>Items Ordered
          </h5>
          <div class="space-y-2">
            ${order.items.map(item => `
              <div class="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                <span class="font-medium">${item.productId.name} x${item.quantity}</span>
                <span class="font-semibold text-green-600">₹${item.price * item.quantity}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="mb-3">
          <p class="text-sm text-gray-600 mb-1 flex items-center">
            <i data-lucide="map-pin" class="w-4 h-4 mr-2"></i><strong>Shipping Address:</strong>
          </p>
          <p class="text-sm text-gray-600 bg-gray-50 p-2 rounded">${order.shippingAddress}</p>
        </div>
        
        <div class="flex gap-2">
          <select onchange="Orders.updateOrderStatus('${order._id}', this.value)" class="form-select text-sm bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
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
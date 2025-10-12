// Page-specific JS for Vendor Dashboard (menu + auth personalization)
(function(){
  // Protect page for vendor role
  if (typeof Auth !== 'undefined' && typeof Auth.protectPage === 'function') {
    Auth.protectPage(['vendor']);
  }

  // Personalize user name and check approval status
  try {
    const user = (typeof Auth !== 'undefined' && typeof Auth.getCurrentUser === 'function') ? Auth.getCurrentUser() : null;
    if (user) {
      var nameNode = document.getElementById('userName');
      if (nameNode) nameNode.textContent = user.name;
      
      // Update shop name and address in topbar
      var shopNameNode = document.getElementById('shopName');
      var shopAddressNode = document.getElementById('shopAddress');
      if (shopNameNode) shopNameNode.textContent = user.shopName || 'Complete Your Profile';
      if (shopAddressNode) shopAddressNode.textContent = user.address || 'Click Profile to complete setup';
      
      // Check approval status and show appropriate message
      if (user.approvalStatus === 'pending') {
        showApprovalStatus('Your vendor application is pending approval. You can still manage your profile.', 'warning');
      } else if (user.approvalStatus === 'rejected') {
        showApprovalStatus('Your vendor application was rejected. Please contact admin for more information.', 'error');
      } else if (user.approvalStatus === 'approved') {
        // Vendor is approved, everything is good
      }
    }
  } catch (_) {}

  // Helper function to show approval status
  function showApprovalStatus(message, type) {
    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'warning' ? '#f59e0b' : '#ef4444'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-weight: 500;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 500px;
      text-align: center;
    `;
    statusDiv.textContent = message;
    document.body.appendChild(statusDiv);
    
    setTimeout(() => {
      if (document.body.contains(statusDiv)) {
        document.body.removeChild(statusDiv);
      }
    }, 5000);
  }

  // Helper function to compress images
  function compressImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = function() {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          resolve(blob);
        }, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // Helper function to convert file to base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Profile menu dropdown logic
  const profileBtn = document.getElementById('profileMenuButton');
  const profileMenu = document.getElementById('profileMenu');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      profileMenu.style.display = (profileMenu.style.display === 'block') ? 'none' : 'block';
    });
    
    document.addEventListener('click', function(e) {
      if (profileMenu.style.display === 'block' && !profileMenu.contains(e.target) && e.target !== profileBtn) {
        profileMenu.style.display = 'none';
      }
    });
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      if (window.Auth && typeof window.Auth.logout === 'function') return Auth.logout();
      if (typeof Auth !== 'undefined') Auth.logout();
    });
  }

  // Load vendor order statistics
  async function loadVendorOrderStats() {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Loading vendor order stats, token:', token ? 'found' : 'not found');
      if (!token) {
        console.log('No token found, skipping order stats load');
        return;
      }

      const response = await fetch('/api/vendor/order-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // Update the metric numbers
      const packedElement = document.getElementById('kpi-packed-number');
      const shippedElement = document.getElementById('kpi-shipped-number');
      const deliveredElement = document.getElementById('kpi-delivered-number');
      const invoicedElement = document.getElementById('kpi-invoiced-number');

      console.log('Elements found:', {
        packed: !!packedElement,
        shipped: !!shippedElement,
        delivered: !!deliveredElement,
        invoiced: !!invoicedElement
      });

      if (packedElement) packedElement.textContent = data.metrics.toBePacked;
      if (shippedElement) shippedElement.textContent = data.metrics.toBeShipped;
      if (deliveredElement) deliveredElement.textContent = data.metrics.toBeDelivered;
      if (invoicedElement) invoicedElement.textContent = data.metrics.toBeInvoiced;

      console.log('Order statistics loaded:', data.metrics);
    } catch (error) {
      console.error('Error loading vendor order stats:', error);
    }
  }

  // Handle metric card clicks to show orders
  function handleMetricCardClick(status) {
    // Map status to order statuses
    const statusMap = {
      'packed': ['pending', 'confirmed'],
      'shipped': ['processing'],
      'delivered': ['shipped'],
      'invoiced': ['delivered']
    };

    const orderStatuses = statusMap[status] || [];
    showOrdersForStatus(orderStatuses, status);
  }

  // Show orders for specific status
  async function showOrdersForStatus(statuses, category) {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await fetch('/api/vendor/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Filter orders by status
      const filteredOrders = data.orders.filter(order => statuses.includes(order.status));
      
      // Create modal to show orders
      showOrdersModal(filteredOrders, category);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }

  // Show orders modal
  function showOrdersModal(orders, category) {
    // Remove existing modal if any
    const existingModal = document.getElementById('ordersModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'ordersModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 20px;
      max-width: 800px;
      width: 90%;
      max-height: 80%;
      overflow-y: auto;
    `;

    const title = document.createElement('h2');
    title.textContent = `Orders - ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    title.style.cssText = 'margin: 0 0 20px 0; color: #333;';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 15px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    `;
    closeBtn.onclick = () => modal.remove();

    modalContent.appendChild(closeBtn);
    modalContent.appendChild(title);

    if (orders.length === 0) {
      const noOrders = document.createElement('p');
      noOrders.textContent = 'No orders found for this category.';
      noOrders.style.cssText = 'text-align: center; color: #666; padding: 20px;';
      modalContent.appendChild(noOrders);
    } else {
      orders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.style.cssText = `
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 10px;
          background: #f9f9f9;
        `;

        orderDiv.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
            <div>
              <h4 style="margin: 0; color: #333;">Order #${order.orderNumber || order._id.slice(-8)}</h4>
              <p style="margin: 5px 0; color: #666; font-size: 14px;">Customer: ${order.customerId.name}</p>
              <p style="margin: 5px 0; color: #666; font-size: 14px;">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-weight: bold; color: #059669;">₹${order.totalAmount}</p>
              <select onchange="updateOrderStatus('${order._id}', this.value)" style="margin-top: 5px; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom: 10px;">
            <h5 style="margin: 0 0 5px 0; color: #333;">Items:</h5>
            ${order.items.map(item => `
              <div style="display: flex; justify-content: space-between; font-size: 14px; color: #666;">
                <span>${item.productId.name} x${item.quantity}</span>
                <span>₹${item.price * item.quantity}</span>
              </div>
            `).join('')}
          </div>
          <div>
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>Address:</strong> ${order.shippingAddress}
            </p>
          </div>
        `;

        modalContent.appendChild(orderDiv);
      });
    }

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    };
  }

  // Update order status
  window.updateOrderStatus = async function(orderId, newStatus) {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await fetch(`/api/vendor/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Order status updated:', data);

      // Reload order statistics
      loadVendorOrderStats();

      // Show success message
      showMessage('Order status updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating order status:', error);
      showMessage('Failed to update order status', 'error');
    }
  };

  // Show message function
  function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      z-index: 1001;
      background: ${type === 'success' ? '#059669' : '#dc2626'};
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }

  // Add click handlers to dashboard cards
  function addDashboardCardClickHandlers() {
    // Inventory Overview click handler
    const inventoryCard = document.getElementById('inventory-overview');
    if (inventoryCard) {
      inventoryCard.addEventListener('click', function() {
        console.log('Inventory Overview clicked');
        showInventoryModal();
      });
    }

    // Sales Orders click handler
    const salesOrdersCard = document.getElementById('sales-orders');
    if (salesOrdersCard) {
      salesOrdersCard.addEventListener('click', function() {
        console.log('Sales Orders clicked');
        showSalesOrdersModal();
      });
    }

    // Top Products click handler
    const topProductsCard = document.getElementById('top-products');
    if (topProductsCard) {
      topProductsCard.addEventListener('click', function() {
        console.log('Top Products clicked');
        showTopProductsModal();
      });
    }
  }

  // Show inventory modal
  function showInventoryModal() {
    const modal = createModal('Inventory Overview', `
      <div class="inventory-modal-content">
        <div class="inventory-stats-grid">
          <div class="stat-card">
            <h4>Total Products</h4>
            <span id="modal-total-items">0</span>
          </div>
          <div class="stat-card">
            <h4>Low Stock Items</h4>
            <span id="modal-low-stock" class="warning">0</span>
          </div>
          <div class="stat-card">
            <h4>Active Products</h4>
            <span id="modal-active-items" class="success">0</span>
          </div>
          <div class="stat-card">
            <h4>Categories</h4>
            <span id="modal-categories">0</span>
          </div>
        </div>
        <div class="inventory-actions">
          <button onclick="window.location.href='items.html'" class="btn btn-primary">
            <i class="fas fa-plus"></i> Add New Product
          </button>
          <button onclick="window.location.href='items.html'" class="btn btn-secondary">
            <i class="fas fa-edit"></i> Manage Products
          </button>
        </div>
      </div>
    `);
    document.body.appendChild(modal);
    loadInventoryStats();
  }

  // Show sales orders modal
  function showSalesOrdersModal() {
    const modal = createModal('Sales Orders', `
      <div class="sales-orders-modal-content">
        <div class="order-stats-grid">
          <div class="order-stat-card">
            <h4>Pending Orders</h4>
            <span id="modal-pending-orders">0</span>
          </div>
          <div class="order-stat-card">
            <h4>Confirmed Orders</h4>
            <span id="modal-confirmed-orders">0</span>
          </div>
          <div class="order-stat-card">
            <h4>Processing Orders</h4>
            <span id="modal-processing-orders">0</span>
          </div>
          <div class="order-stat-card">
            <h4>Shipped Orders</h4>
            <span id="modal-shipped-orders">0</span>
          </div>
          <div class="order-stat-card">
            <h4>Delivered Orders</h4>
            <span id="modal-delivered-orders">0</span>
          </div>
        </div>
        <div class="sales-actions">
          <button onclick="handleMetricCardClick('packed')" class="btn btn-primary">
            <i class="fas fa-box"></i> View Orders to Pack
          </button>
          <button onclick="handleMetricCardClick('shipped')" class="btn btn-secondary">
            <i class="fas fa-shipping-fast"></i> View Orders to Ship
          </button>
        </div>
      </div>
    `);
    document.body.appendChild(modal);
    loadSalesOrderStats();
  }

  // Show top products modal
  function showTopProductsModal() {
    const modal = createModal('Top Products', `
      <div class="top-products-modal-content">
        <div id="top-products-list">
          <div class="loading">Loading top products...</div>
        </div>
        <div class="products-actions">
          <button onclick="window.location.href='items.html'" class="btn btn-primary">
            <i class="fas fa-plus"></i> Add New Product
          </button>
          <button onclick="window.location.href='reports.html'" class="btn btn-secondary">
            <i class="fas fa-chart-bar"></i> View Reports
          </button>
        </div>
      </div>
    `);
    document.body.appendChild(modal);
    loadTopProducts();
  }

  // Create modal function
  function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close" onclick="this.closest('.modal').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;
    return modal;
  }

  // Load inventory statistics
  async function loadInventoryStats() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/vendor/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return;

      const data = await response.json();
      const products = data.products || [];

      const totalItems = products.length;
      const lowStock = products.filter(p => p.stock < 10).length;
      const activeItems = products.filter(p => p.isActive).length;
      const categories = [...new Set(products.map(p => p.category))].length;

      document.getElementById('modal-total-items').textContent = totalItems;
      document.getElementById('modal-low-stock').textContent = lowStock;
      document.getElementById('modal-active-items').textContent = activeItems;
      document.getElementById('modal-categories').textContent = categories;
    } catch (error) {
      console.error('Error loading inventory stats:', error);
    }
  }

  // Load sales order statistics
  async function loadSalesOrderStats() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/vendor/order-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return;

      const data = await response.json();
      const stats = data.stats || {};

      document.getElementById('modal-pending-orders').textContent = stats.pending || 0;
      document.getElementById('modal-confirmed-orders').textContent = stats.confirmed || 0;
      document.getElementById('modal-processing-orders').textContent = stats.processing || 0;
      document.getElementById('modal-shipped-orders').textContent = stats.shipped || 0;
      document.getElementById('modal-delivered-orders').textContent = stats.delivered || 0;
    } catch (error) {
      console.error('Error loading sales order stats:', error);
    }
  }

  // Load top products
  async function loadTopProducts() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/vendor/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return;

      const data = await response.json();
      const products = data.products || [];

      // Sort by stock (assuming lower stock means more popular/sold)
      const topProducts = products
        .filter(p => p.isActive)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);

      const productsList = document.getElementById('top-products-list');
      productsList.innerHTML = topProducts.map(product => `
        <div class="product-item">
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/48x48'">
          </div>
          <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-details">
              <span class="product-price">₹${product.price}</span>
              <span class="product-stock">Stock: ${product.stock}</span>
            </div>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading top products:', error);
      document.getElementById('top-products-list').innerHTML = '<div class="error">Failed to load products</div>';
    }
  }

  // Load dashboard data to update main dashboard view
  async function loadDashboardData() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      // Load inventory stats
      await loadInventoryDashboardStats();
      
      // Load sales order stats
      await loadSalesOrderDashboardStats();
      
      // Load top products
      await loadTopProductsDashboard();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  // Load inventory stats for main dashboard
  async function loadInventoryDashboardStats() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/vendor/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return;

      const data = await response.json();
      const products = data.products || [];

      const totalItems = products.length;
      const lowStock = products.filter(p => p.stock < 10).length;
      const activeItems = products.filter(p => p.isActive).length;
      const categories = [...new Set(products.map(p => p.category))].length;

      // Update main dashboard elements
      const totalItemsEl = document.getElementById('total-items');
      const lowStockEl = document.getElementById('low-stock');
      const activeItemsEl = document.getElementById('active-items');
      const itemGroupsEl = document.getElementById('item-groups');

      if (totalItemsEl) totalItemsEl.textContent = totalItems;
      if (lowStockEl) lowStockEl.textContent = lowStock;
      if (activeItemsEl) activeItemsEl.textContent = activeItems;
      if (itemGroupsEl) itemGroupsEl.textContent = categories;

    } catch (error) {
      console.error('Error loading inventory dashboard stats:', error);
    }
  }

  // Load sales order stats for main dashboard
  async function loadSalesOrderDashboardStats() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/vendor/order-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return;

      const data = await response.json();
      const stats = data.stats || {};

      // Update main dashboard elements
      const pendingEl = document.getElementById('pending-orders');
      const confirmedEl = document.getElementById('confirmed-orders');
      const processingEl = document.getElementById('processing-orders');
      const shippedEl = document.getElementById('shipped-orders');
      const deliveredEl = document.getElementById('delivered-orders');

      if (pendingEl) pendingEl.textContent = stats.pending || 0;
      if (confirmedEl) confirmedEl.textContent = stats.confirmed || 0;
      if (processingEl) processingEl.textContent = stats.processing || 0;
      if (shippedEl) shippedEl.textContent = stats.shipped || 0;
      if (deliveredEl) deliveredEl.textContent = stats.delivered || 0;

    } catch (error) {
      console.error('Error loading sales order dashboard stats:', error);
    }
  }

  // Load top products for main dashboard
  async function loadTopProductsDashboard() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/vendor/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return;

      const data = await response.json();
      const products = data.products || [];

      // Sort by stock (assuming lower stock means more popular/sold)
      const topProducts = products
        .filter(p => p.isActive)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 2); // Show top 2 products in main dashboard

      // Update the top products section in main dashboard
      const topProductsContainer = document.querySelector('#top-products .top-products');
      if (topProductsContainer && topProducts.length > 0) {
        topProductsContainer.innerHTML = topProducts.map(product => `
          <div class="product-item">
            <div class="product-image">
              <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/48x48'">
            </div>
            <div class="product-info">
              <div class="product-name">${product.name}</div>
              <div class="product-sales">Stock: ${product.stock} units</div>
            </div>
          </div>
        `).join('');
      }

    } catch (error) {
      console.error('Error loading top products dashboard:', error);
    }
  }

  // Add smooth animations and interactions
  document.addEventListener('DOMContentLoaded', function() {
    // Load order statistics
    loadVendorOrderStats();
    
    // Load dashboard data
    loadDashboardData();
    
    // Add click handlers to dashboard cards
    addDashboardCardClickHandlers();
    
    // Ensure profile modal is hidden on page load
    const profileModal = document.getElementById('profileInfoModal');
    if (profileModal) {
      profileModal.setAttribute('hidden', '');
      profileModal.style.display = 'none';
      console.log('Profile modal hidden on page load');
    }
    // Animate metric cards on load and add click handlers
    const metricCards = document.querySelectorAll('.metric-card');
    console.log('Found metric cards:', metricCards.length);
    metricCards.forEach((card, index) => {
      console.log('Processing card', index, 'with ID:', card.id);
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.cursor = 'pointer';
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);

      // Add click handler based on card ID
      card.addEventListener('click', function() {
        const cardId = this.id;
        console.log('Metric card clicked:', cardId);
        if (cardId === 'kpi-packed') {
          handleMetricCardClick('packed');
        } else if (cardId === 'kpi-shipped') {
          handleMetricCardClick('shipped');
        } else if (cardId === 'kpi-delivered') {
          handleMetricCardClick('delivered');
        } else if (cardId === 'kpi-invoiced') {
          handleMetricCardClick('invoiced');
        }
      });

      // Add hover effect
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      });

      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '';
      });
    });

    // Animate dashboard cards
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    dashboardCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, (metricCards.length * 100) + (index * 150));
    });

    // Add hover effects to action buttons
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
      btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px) scale(1.02)';
      });
      
      btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
      });
    });

    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.primary-btn, .action-btn');
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });

    // Add scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll('.dashboard-card, .metric-card');
    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  });

  // Add CSS for ripple effect
  const style = document.createElement('style');
  style.textContent = `
    .ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple-animation 0.6s linear;
      pointer-events: none;
    }
    
    @keyframes ripple-animation {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    .primary-btn, .action-btn {
      position: relative;
      overflow: hidden;
    }
  `;
  document.head.appendChild(style);

  // Profile menu: view profile info modal
  var profileInfoBtn = document.getElementById('profileInfoBtn');
  var profileInfoModal = document.getElementById('profileInfoModal');
  var profileInfoClose = document.getElementById('profileInfoClose');
  var profileInfoCloseBtn = document.getElementById('profileInfoCloseBtn');
  
  function fillProfileInfo() {
    var u = (typeof Auth !== 'undefined' && typeof Auth.getCurrentUser === 'function') ? Auth.getCurrentUser() : {};
    document.getElementById('piShopNameIn').value = u.shopName || '';
    document.getElementById('piPhoneIn').value = u.phone || '';
    document.getElementById('piBusinessTypeIn').value = u.businessType || '';
    document.getElementById('piAddressIn').value = u.address || '';
    document.getElementById('piGstIn').value = u.gstNumber || '';
    document.getElementById('piPanIn').value = u.panNumber || '';
    document.getElementById('piDescriptionIn').value = u.businessDescription || '';
    document.getElementById('piTurnoverIn').value = u.annualTurnover || '';
    document.getElementById('piEmployeesIn').value = u.employeeCount || '';
  }
  
  function closeProfileModal() {
    if (profileInfoModal) {
      console.log('Closing profile modal');
      profileInfoModal.setAttribute('hidden', '');
      profileInfoModal.style.display = 'none';
    }
  }
  
  if (profileInfoBtn && profileInfoModal) {
    profileInfoBtn.addEventListener('click', function(e){
      e.preventDefault();
      console.log('Opening profile modal');
      profileMenu.style.display = 'none';
      fillProfileInfo();
      profileInfoModal.removeAttribute('hidden');
      profileInfoModal.style.display = 'flex';
    });
  }
  
  if (profileInfoClose && profileInfoModal) {
    profileInfoClose.addEventListener('click', closeProfileModal);
  }
  
  if (profileInfoCloseBtn && profileInfoModal) {
    profileInfoCloseBtn.addEventListener('click', closeProfileModal);
  }
  
  // Close modal when clicking outside
  if (profileInfoModal) {
    profileInfoModal.addEventListener('click', function(e) {
      if (e.target === profileInfoModal) {
        closeProfileModal();
      }
    });
  }
  
  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && profileInfoModal && !profileInfoModal.hasAttribute('hidden')) {
      closeProfileModal();
    }
  });
  // Save profile info in form
  var piForm = document.getElementById('profileInfoForm');
  if (piForm) {
    piForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      try {
        // Show loading state
        const saveBtn = document.getElementById('profileInfoSave');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        // Prepare profile data
        const profileData = {
          phone: document.getElementById('piPhoneIn').value.trim(),
          shopName: document.getElementById('piShopNameIn').value.trim(),
          businessType: document.getElementById('piBusinessTypeIn')?.value.trim() || '',
          address: document.getElementById('piAddressIn').value.trim(),
          gstNumber: document.getElementById('piGstIn')?.value.trim() || '',
          panNumber: document.getElementById('piPanIn')?.value.trim() || '',
          businessDescription: document.getElementById('piDescriptionIn')?.value.trim() || '',
          annualTurnover: document.getElementById('piTurnoverIn')?.value.trim() || '',
          employeeCount: document.getElementById('piEmployeesIn')?.value.trim() || ''
        };

        // Check if Aadhar file is uploaded
        const aadharFile = document.getElementById('piAadharUpload').files[0];
        if (aadharFile) {
          // Validate file size (5MB max)
          if (aadharFile.size > 5 * 1024 * 1024) {
            throw new Error('Aadhar file size must be less than 5MB');
          }

          // Validate file type
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
          if (!allowedTypes.includes(aadharFile.type)) {
            throw new Error('Please upload a valid image (JPG, PNG) or PDF file');
          }

          // Compress image if it's an image file
          let processedFile = aadharFile;
          if (aadharFile.type.startsWith('image/')) {
            saveBtn.textContent = 'Processing Aadhar file...';
            processedFile = await compressImage(aadharFile);
          }

          // Convert file to base64
          const aadharBase64 = await fileToBase64(processedFile);
          profileData.aadharFile = {
            name: processedFile.name || aadharFile.name,
            type: processedFile.type || aadharFile.type,
            size: processedFile.size,
            data: aadharBase64
          };
        }

        // Update profile via API
        console.log('Sending profile data:', profileData);
        console.log('API endpoint:', API_CONFIG.endpoints.vendorProfile);
        console.log('Full URL:', API_CONFIG.baseURL + API_CONFIG.endpoints.vendorProfile);
        console.log('Current timestamp:', new Date().toISOString());
        
        let response;
        try {
          response = await API.put(API_CONFIG.endpoints.vendorProfile, profileData);
          console.log('Profile update response:', response);
        } catch (error) {
          console.error('API Error Details:', {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            response: error.response,
            stack: error.stack
          });
          
          // Show more detailed error message
          let errorMsg = 'Failed to update profile. ';
          if (error.message.includes('fetch')) {
            errorMsg += 'Network error - please check your connection.';
          } else if (error.message.includes('401')) {
            errorMsg += 'Session expired - please login again.';
          } else if (error.message.includes('500')) {
            errorMsg += 'Server error - please try again later.';
          } else {
            errorMsg += error.message;
          }
          
          throw new Error(errorMsg);
        }
        
        // Update local user data
        const currentUser = Auth.getCurrentUser();
        if (currentUser) {
          Object.assign(currentUser, response.vendor);
          Storage.setUser(currentUser);
        }

        // Update UI elements
        var nameNode = document.getElementById('userName');
        if (nameNode) nameNode.textContent = currentUser.name;
        
        var shopNameNode = document.getElementById('shopName');
        var shopAddressNode = document.getElementById('shopAddress');
        if (shopNameNode) shopNameNode.textContent = profileData.shopName;
        if (shopAddressNode) shopAddressNode.textContent = profileData.address;

        // Show success message
        showMessage('Profile updated successfully!', 'success');
        
        // Close modal
        closeProfileModal();
        
      } catch (error) {
        console.error('Error updating profile:', error);
        const errorMessage = error.message || 'Failed to update profile. Please try again.';
        showMessage(errorMessage, 'error');
      } finally {
        // Reset button state
        const saveBtn = document.getElementById('profileInfoSave');
        saveBtn.textContent = 'Save';
        saveBtn.disabled = false;
      }
    });
  }

  // Helper function to show messages
  function showMessage(message, type) {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-weight: 500;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  }

  // Menu removed per request; no dropdown logic needed
})();



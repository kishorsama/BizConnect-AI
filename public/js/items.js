// Enhanced Items page with real API integration
(function(){
  // Protect page for vendor role
  if (typeof Auth !== 'undefined' && typeof Auth.protectPage === 'function') {
    Auth.protectPage(['vendor']);
  }

  // Personalize user info
  try { 
    var u = Auth.getCurrentUser && Auth.getCurrentUser(); 
    if (u) { 
      var n = document.getElementById('userName'); 
      if (n) n.textContent = u.name;
      // Update shop name and address in topbar
      var shopNameNode = document.getElementById('shopName');
      var shopAddressNode = document.getElementById('shopAddress');
      if (shopNameNode) shopNameNode.textContent = u.shopName || 'BizConnect Demo Shop';
      if (shopAddressNode) shopAddressNode.textContent = u.address || '123 Market Lane, Main City';
    } 
  } catch(_){}

  // DOM elements
  const tableBody = document.querySelector('#itemsTable tbody');
  const productModal = document.getElementById('productModal');
  const modalTitle = document.getElementById('modalTitle');
  const productForm = document.getElementById('productForm');
  const btnAddItem = document.getElementById('btnAddItem');
  const closeModal = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const saveBtn = document.getElementById('saveBtn');

  // State management
  let products = [];
  let editingProductId = null;

  // Utility functions
  function formatPrice(price) {
    return '₹' + Number(price).toFixed(2);
  }

  function showMessage(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-weight: 500;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 400px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 4000);
  }

  function closeModalDialog() {
    if (productModal) {
      productModal.setAttribute('hidden', '');
      productForm.reset();
      editingProductId = null;
      modalTitle.textContent = 'Add New Product';
      saveBtn.textContent = 'Save Product';
    }
  }

  function openModalDialog(title = 'Add New Product') {
    if (!productModal) return;
    modalTitle.textContent = title;
    productModal.removeAttribute('hidden');
  }

  function clearForm() {
    productForm.reset();
    document.getElementById('productActive').checked = true;
  }

  // Load products from API
  async function loadProducts() {
    try {
      showMessage('Loading products...', 'info');
      
      // Use the Products API to load vendor products
      if (typeof Products !== 'undefined' && typeof Products.getVendorProducts === 'function') {
        products = await Products.getVendorProducts();
      } else {
        // Fallback to direct API call
        const response = await API.get(API_CONFIG.endpoints.vendorProducts);
        products = response.products || [];
      }
      
      renderProducts();
      showMessage(`Loaded ${products.length} products`, 'success');
    } catch (error) {
      console.error('Error loading products:', error);
      showMessage('Failed to load products: ' + error.message, 'error');
      // Fallback to empty array
      products = [];
      renderProducts();
    }
  }

  // Render products in table
  function renderProducts() {
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (products.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: #6b7280;">
            <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">No products yet</div>
            <div>Click "Add New Item" to create your first product</div>
          </td>
        </tr>
      `;
      return;
    }

    products.forEach(product => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
              ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` : '📦'}
            </div>
            <div>
              <div style="font-weight: 600; color: #111827;">${product.name}</div>
              <div style="font-size: 14px; color: #6b7280;">${product.category || 'Uncategorized'}</div>
            </div>
          </div>
        </td>
        <td style="font-family: monospace; color: #6b7280;">${product.sku || product._id?.slice(-8) || 'N/A'}</td>
        <td style="font-weight: 600; color: #059669;">${formatPrice(product.price)}</td>
        <td>
          <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; background: ${product.stock > 10 ? '#dcfce7' : product.stock > 0 ? '#fef3c7' : '#fee2e2'}; color: ${product.stock > 10 ? '#166534' : product.stock > 0 ? '#92400e' : '#991b1b'};">
            ${product.stock} units
          </span>
        </td>
        <td>
          <span class="status-chip ${product.isActive ? 'active' : 'inactive'}">
            ${product.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 8px;">
            <button class="action-btn-small edit" data-edit="${product._id || product.id}" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer;">Edit</button>
            <button class="action-btn-small delete" data-delete="${product._id || product.id}" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer;">Delete</button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    // Bind event listeners
    bindEventListeners();
  }

  function bindEventListeners() {
    // Edit buttons
    tableBody.querySelectorAll('button[data-edit]').forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = this.getAttribute('data-edit');
        editProduct(productId);
      });
    });

    // Delete buttons
    tableBody.querySelectorAll('button[data-delete]').forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = this.getAttribute('data-delete');
        deleteProduct(productId);
      });
    });
  }

  // Edit product
  function editProduct(productId) {
    const product = products.find(p => (p._id || p.id) === productId);
    if (!product) {
      showMessage('Product not found', 'error');
      return;
    }

    editingProductId = productId;
    
    // Fill form with product data
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productPrice').value = product.price || '';
    document.getElementById('productStock').value = product.stock || '';
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productImage').value = product.image || '';
    document.getElementById('productActive').checked = product.isActive !== false;

    openModalDialog('Edit Product');
  }

  // Delete product
  async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      saveBtn.textContent = 'Deleting...';
      saveBtn.disabled = true;

      // Use Products API if available
      if (typeof Products !== 'undefined' && typeof Products.deleteProduct === 'function') {
        await Products.deleteProduct(productId);
      } else {
        // Fallback to direct API call
        await API.delete(`${API_CONFIG.endpoints.vendorProducts}/${productId}`);
      }

      showMessage('Product deleted successfully', 'success');
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      showMessage('Failed to delete product: ' + error.message, 'error');
    } finally {
      saveBtn.textContent = 'Save Product';
      saveBtn.disabled = false;
    }
  }

  // Save product (add or edit)
  async function saveProduct(formData) {
    const productData = {
      name: formData.get('name').trim(),
      description: formData.get('description').trim(),
      price: parseFloat(formData.get('price')),
      stock: parseInt(formData.get('stock')),
      category: formData.get('category'),
      image: formData.get('image').trim(),
      isActive: formData.get('isActive') === 'on'
    };

    console.log('Saving product with data:', productData);
    
    // Check if user is authenticated
    const token = Storage.getToken();
    console.log('Current token:', token);
    
    if (!token) {
      showMessage('You must be logged in to add products', 'error');
      return false;
    }

    // Validation
    if (!productData.name) {
      showMessage('Product name is required', 'error');
      return false;
    }
    if (!productData.description) {
      showMessage('Product description is required', 'error');
      return false;
    }
    if (productData.price <= 0) {
      showMessage('Price must be greater than 0', 'error');
      return false;
    }
    if (productData.stock < 0) {
      showMessage('Stock cannot be negative', 'error');
      return false;
    }
    if (!productData.category) {
      showMessage('Please select a category', 'error');
      return false;
    }

    try {
      saveBtn.textContent = editingProductId ? 'Updating...' : 'Adding...';
      saveBtn.disabled = true;

      // Test server connectivity first
      try {
        const testResponse = await API.get('/test');
        console.log('Server test response:', testResponse);
      } catch (testError) {
        console.error('Server connectivity test failed:', testError);
        showMessage('Cannot connect to server. Please check if the server is running.', 'error');
        return false;
      }

      let result;
      if (editingProductId) {
        // Update existing product
        if (typeof Products !== 'undefined' && typeof Products.updateProduct === 'function') {
          result = await Products.updateProduct(editingProductId, productData);
        } else {
          result = await API.put(`${API_CONFIG.endpoints.vendorProducts}/${editingProductId}`, productData);
        }
        showMessage('Product updated successfully', 'success');
      } else {
        // Add new product
        if (typeof Products !== 'undefined' && typeof Products.addProduct === 'function') {
          result = await Products.addProduct(productData);
        } else {
          result = await API.post(API_CONFIG.endpoints.vendorProducts, productData);
        }
        showMessage('Product added successfully', 'success');
      }

      closeModalDialog();
      await loadProducts();
      return true;
    } catch (error) {
      console.error('Error saving product:', error);
      showMessage('Failed to save product: ' + error.message, 'error');
      return false;
    } finally {
      saveBtn.textContent = editingProductId ? 'Update Product' : 'Save Product';
      saveBtn.disabled = false;
    }
  }

  // Event listeners
  if (btnAddItem) {
    btnAddItem.addEventListener('click', function() {
      editingProductId = null;
      clearForm();
      openModalDialog('Add New Product');
    });
  }

  if (closeModal) {
    closeModal.addEventListener('click', closeModalDialog);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModalDialog);
  }

  // Close modal when clicking outside
  if (productModal) {
    productModal.addEventListener('click', function(e) {
      if (e.target === productModal) {
        closeModalDialog();
      }
    });
  }

  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && productModal && !productModal.hasAttribute('hidden')) {
      closeModalDialog();
    }
  });

  // Form submission
  if (productForm) {
    productForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const formData = new FormData(productForm);
      await saveProduct(formData);
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

  // Initialize page
  document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
  });
})();
// js/products.js

const Products = {
  // Get all products for customer browsing
  async getAllProducts() {
    try {
      const response = await API.get(API_CONFIG.endpoints.products);
      return response.products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get products for vendor dashboard
  async getVendorProducts() {
    try {
      const response = await API.get(API_CONFIG.endpoints.vendorProducts);
      return response.products;
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      throw error;
    }
  },

  // Add new product (vendor only)
  async addProduct(productData) {
    try {
      const response = await API.post(API_CONFIG.endpoints.vendorProducts, productData);
      return response.product;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  // Render products for customer view
  renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!products || products.length === 0) {
      container.innerHTML = '<p class="no-products">No products available</p>';
      return;
    }

    container.innerHTML = products.map(product => `
      <div class="product-card" data-product-id="${product._id}">
        <div class="product-image">
          ${product.image ? 
            `<img src="${product.image}" alt="${product.name}" />` : 
            `<div class="no-image">No Image</div>`
          }
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-details">
            <span class="product-price">₹${product.price}</span>
            <span class="product-stock">Stock: ${product.stock}</span>
          </div>
          <div class="product-vendor">
            <small>Sold by: ${product.vendorId?.name || 'Unknown Vendor'}</small>
          </div>
          <div class="product-actions">
            <div class="quantity-controls">
              <button class="btn-quantity" onclick="Products.decreaseQuantity('${product._id}')">-</button>
              <span class="quantity" id="qty-${product._id}">1</span>
              <button class="btn-quantity" onclick="Products.increaseQuantity('${product._id}')">+</button>
            </div>
            <button class="btn-add-cart" onclick="Products.addToCart('${product._id}')">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  // Render products for vendor dashboard
  renderVendorProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!products || products.length === 0) {
      container.innerHTML = '<p class="no-products">No products added yet</p>';
      return;
    }

    container.innerHTML = products.map(product => `
      <div class="product-card vendor-product" data-product-id="${product._id}">
        <div class="product-image">
          ${product.image ? 
            `<img src="${product.image}" alt="${product.name}" />` : 
            `<div class="no-image">No Image</div>`
          }
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-details">
            <span class="product-price">₹${product.price}</span>
            <span class="product-stock">Stock: ${product.stock}</span>
            <span class="product-category">${product.category}</span>
          </div>
          <div class="product-status">
            <span class="status ${product.isActive ? 'active' : 'inactive'}">
              ${product.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    `).join('');
  },

  // Quantity controls
  increaseQuantity(productId) {
    const quantityElement = document.getElementById(`qty-${productId}`);
    const currentQty = parseInt(quantityElement.textContent);
    quantityElement.textContent = currentQty + 1;
  },

  decreaseQuantity(productId) {
    const quantityElement = document.getElementById(`qty-${productId}`);
    const currentQty = parseInt(quantityElement.textContent);
    if (currentQty > 1) {
      quantityElement.textContent = currentQty - 1;
    }
  },

  // Add product to cart
  async addToCart(productId) {
    try {
      const quantityElement = document.getElementById(`qty-${productId}`);
      const quantity = parseInt(quantityElement.textContent);

      // Use Cart.addToCart method instead of direct API call
      await Cart.addToCart(productId, quantity);
      
      // Reset quantity to 1
      quantityElement.textContent = '1';
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showMessage(error.message || 'Failed to add product to cart', 'error');
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

  // Load and display products for customer
  async loadProductsForCustomer() {
    try {
      const products = await this.getAllProducts();
      this.renderProducts(products, 'products-container');
    } catch (error) {
      console.error('Error loading products:', error);
      this.showMessage('Failed to load products', 'error');
    }
  },

  // Load and display products for vendor
  async loadProductsForVendor() {
    try {
      const products = await this.getVendorProducts();
      this.renderVendorProducts(products, 'vendor-products-container');
    } catch (error) {
      console.error('Error loading vendor products:', error);
      this.showMessage('Failed to load products', 'error');
    }
  },

  // Update existing product (vendor only)
  async updateProduct(productId, productData) {
    try {
      const response = await API.put(`${API_CONFIG.endpoints.vendorProducts}/${productId}`, productData);
      return response.product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product (vendor only)
  async deleteProduct(productId) {
    try {
      const response = await API.delete(`${API_CONFIG.endpoints.vendorProducts}/${productId}`);
      return response;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};

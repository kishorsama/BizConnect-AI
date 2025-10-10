<<<<<<< HEAD
// js/cart.js - Updated to work with backend API

const Cart = {
  // Load cart from backend
  async loadCart() {
    try {
      const response = await API.get(API_CONFIG.endpoints.cart);
      this.renderCart(response.cart);
    } catch (error) {
      console.error('Error loading cart:', error);
      this.showMessage('Failed to load cart', 'error');
    }
  },

  // Add item to cart via API
  async addToCart(productId, quantity = 1) {
    try {
      await API.post(API_CONFIG.endpoints.addToCart, {
        productId,
        quantity
      });
      
      this.showMessage('Item added to cart successfully!', 'success');
      this.loadCart(); // Reload cart to show updated items
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showMessage(error.message || 'Failed to add item to cart', 'error');
    }
  },

  // Remove item from cart via API
  async removeFromCart(productId) {
    try {
      await API.delete(`${API_CONFIG.endpoints.removeFromCart}/${productId}`);
      
      this.showMessage('Item removed from cart', 'success');
      this.loadCart(); // Reload cart to show updated items
    } catch (error) {
      console.error('Error removing from cart:', error);
      this.showMessage(error.message || 'Failed to remove item from cart', 'error');
    }
  },

  // Create order from cart
  async createOrder(shippingAddress) {
    try {
      const response = await API.post(API_CONFIG.endpoints.createOrder, {
        shippingAddress
      });
      
      this.showMessage('Order created successfully!', 'success');
      this.loadCart(); // Cart should be empty after order creation
      
      return response.orders;
    } catch (error) {
      console.error('Error creating order:', error);
      this.showMessage(error.message || 'Failed to create order', 'error');
      throw error;
    }
  },

  // Render cart items
  renderCart(cart) {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartDrawerContainer = document.getElementById('cartItems');
    const cartCountElement = document.getElementById('cart-count');
    const cartTotalElement = document.getElementById('cart-total');
    const cartSubtotalElement = document.getElementById('cartSubtotal');
    
    // Update both cart containers if they exist
    const containers = [cartItemsContainer, cartDrawerContainer].filter(Boolean);

    if (containers.length === 0) return;

    if (!cart || !cart.items || cart.items.length === 0) {
      const emptyMessage = '<p class="empty-cart">Your cart is empty</p>';
      containers.forEach(container => {
        container.innerHTML = emptyMessage;
      });
      if (cartCountElement) cartCountElement.textContent = '0';
      if (cartTotalElement) cartTotalElement.textContent = '₹0';
      if (cartSubtotalElement) cartSubtotalElement.textContent = '₹0';
      
      // Also update the cart count in the header
      const headerCartCount = document.getElementById('cartCount');
      if (headerCartCount) {
        headerCartCount.textContent = '0';
      }
      return;
    }

    let totalAmount = 0;
    
    const cartHTML = cart.items.map(item => {
      const itemTotal = item.productId.price * item.quantity;
      totalAmount += itemTotal;
      
      return `
        <div class="cart-item" data-product-id="${item.productId._id}">
          <div class="item-image">
            ${item.productId.image ? 
              `<img src="${item.productId.image}" alt="${item.productId.name}" />` : 
              `<div class="no-image">No Image</div>`
            }
          </div>
          <div class="item-details">
            <h4 class="item-name">${item.productId.name}</h4>
            <p class="item-description">${item.productId.description}</p>
            <div class="item-price">₹${item.productId.price} each</div>
            <div class="item-vendor">Sold by: ${item.productId.vendorId.name}</div>
          </div>
          <div class="item-controls">
            <div class="quantity-controls">
              <button class="btn-quantity" onclick="Cart.updateQuantity('${item.productId._id}', ${item.quantity - 1})">-</button>
              <span class="quantity">${item.quantity}</span>
              <button class="btn-quantity" onclick="Cart.updateQuantity('${item.productId._id}', ${item.quantity + 1})">+</button>
            </div>
            <div class="item-total">₹${itemTotal}</div>
            <button class="btn-remove" onclick="Cart.removeFromCart('${item.productId._id}')">
              Remove
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Update all containers
    containers.forEach(container => {
      container.innerHTML = cartHTML;
    });

    if (cartCountElement) {
      cartCountElement.textContent = cart.items.length;
    }
    
    // Also update the cart count in the header
    const headerCartCount = document.getElementById('cartCount');
    if (headerCartCount) {
      headerCartCount.textContent = cart.items.length;
    }
    
    if (cartTotalElement) {
      cartTotalElement.textContent = `₹${totalAmount}`;
    }

    if (cartSubtotalElement) {
      cartSubtotalElement.textContent = `₹${totalAmount}`;
    }
  },

  // Update item quantity (simplified - just remove and re-add)
  async updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      await this.removeFromCart(productId);
    } else {
      // For simplicity, we'll remove and re-add with new quantity
      await this.removeFromCart(productId);
      await this.addToCart(productId, newQuantity);
    }
  },

  // Show checkout form
  showCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.style.display = 'block';
    }
  },

  // Hide checkout form
  hideCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.style.display = 'none';
    }
  },

  // Process checkout
  async processCheckout() {
    const shippingAddress = document.getElementById('shipping-address').value;
    
    if (!shippingAddress.trim()) {
      this.showMessage('Please enter shipping address', 'error');
      return;
    }

    try {
      const orders = await this.createOrder(shippingAddress);
      
      // Show success message with order details
      let message = 'Order created successfully!\n\n';
      orders.forEach((order, index) => {
        message += `Order ${index + 1}: ₹${order.totalAmount}\n`;
      });
      
      alert(message);
      
      // Hide checkout form
      this.hideCheckoutForm();
      
    } catch (error) {
      console.error('Checkout error:', error);
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

  // Cart drawer functionality
  openCartDrawer() {
=======
// Simple cart module with localStorage persistence and drawer UI
(function () {
  const STORAGE_KEY = 'bc_cart_v1';

  const state = {
    items: [],
  };

  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      state.items = raw ? JSON.parse(raw) : [];
    } catch (e) {
      state.items = [];
    }
  };

  const findIndex = (id) => state.items.findIndex((i) => i.id === id);

  const Cart = {
    add(product, qty = 1) {
      const idx = findIndex(product.id);
      if (idx >= 0) state.items[idx].qty += qty;
      else state.items.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty });
      save();
      this.render();
      window.dispatchEvent(new Event('cart:changed'));
    },
    remove(id) {
      state.items = state.items.filter((i) => i.id !== id);
      save();
      this.render();
      window.dispatchEvent(new Event('cart:changed'));
    },
    update(id, qty) {
      const idx = findIndex(id);
      if (idx >= 0) {
        state.items[idx].qty = Math.max(1, qty);
        save();
        this.render();
        window.dispatchEvent(new Event('cart:changed'));
      }
    },
    clear() {
      state.items = [];
      save();
      this.render();
      window.dispatchEvent(new Event('cart:changed'));
    },
    count() {
      return state.items.reduce((n, i) => n + i.qty, 0);
    },
    qty(id) {
      const item = state.items.find((i) => i.id === id);
      return item ? item.qty : 0;
    },
    subtotal() {
      return state.items.reduce((n, i) => n + i.price * i.qty, 0);
    },
    open() { Drawer.open(); },
    close() { Drawer.close(); },
    render() {
      const list = document.getElementById('cartItems');
      const badge = document.getElementById('cartCount');
      const subtotalEl = document.getElementById('cartSubtotal');
      if (!list) return;
      list.innerHTML = '';
      state.items.forEach((i) => {
        const row = document.createElement('div');
        row.className = 'flex items-center gap-3 p-3 rounded-xl border border-gray-100';
        row.innerHTML = `
          <img src="${i.image}" class="w-16 h-12 rounded-lg object-cover" alt="${i.name}">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-900 truncate">${i.name}</p>
            <p class="text-xs text-gray-500">₹${i.price} each</p>
          </div>
          <div class="flex items-center gap-2">
            <button data-dec="${i.id}" class="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">-</button>
            <span class="min-w-6 text-center">${i.qty}</span>
            <button data-inc="${i.id}" class="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">+</button>
          </div>
          <button data-del="${i.id}" class="ml-2 p-2 rounded-full hover:bg-gray-100"><i data-lucide="trash-2" class="w-4 h-4 text-gray-500"></i></button>
        `;
        list.appendChild(row);
      });
      if (badge) badge.textContent = String(this.count());
      if (subtotalEl) subtotalEl.textContent = `₹${this.subtotal()}`;
      if (window.lucide) window.lucide.createIcons();

      // Bind qty and delete buttons
      list.querySelectorAll('[data-inc]').forEach((b) => b.addEventListener('click', () => this.update(b.getAttribute('data-inc'), (state.items.find(i => i.id === b.getAttribute('data-inc'))?.qty || 1) + 1)));
      list.querySelectorAll('[data-dec]').forEach((b) => b.addEventListener('click', () => this.update(b.getAttribute('data-dec'), (state.items.find(i => i.id === b.getAttribute('data-dec'))?.qty || 1) - 1)));
      list.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => this.remove(b.getAttribute('data-del'))));
    },
    getState() { return JSON.parse(JSON.stringify(state.items)); }
  };

  // Drawer
  const Drawer = {
    open() {
>>>>>>> 51b6fc2876e28e250d13b5c6fc7f4a55df584577
      const drawer = document.getElementById('cartDrawer');
      const panel = drawer?.querySelector('aside');
      const backdrop = document.getElementById('cartBackdrop');
      if (!drawer || !panel || !backdrop) return;
<<<<<<< HEAD
    
=======
>>>>>>> 51b6fc2876e28e250d13b5c6fc7f4a55df584577
      drawer.classList.remove('hidden');
      requestAnimationFrame(() => {
        backdrop.classList.remove('opacity-0');
        panel.classList.remove('translate-x-full');
      });
    },
<<<<<<< HEAD

  closeCartDrawer() {
=======
    close() {
>>>>>>> 51b6fc2876e28e250d13b5c6fc7f4a55df584577
      const drawer = document.getElementById('cartDrawer');
      const panel = drawer?.querySelector('aside');
      const backdrop = document.getElementById('cartBackdrop');
      if (!drawer || !panel || !backdrop) return;
<<<<<<< HEAD
    
      backdrop.classList.add('opacity-0');
      panel.classList.add('translate-x-full');
      setTimeout(() => drawer.classList.add('hidden'), 200);
  },

  // Initialize cart functionality
  init() {
    // Load cart when page loads
    this.loadCart();
    
    // Bind cart drawer controls
    const cartButton = document.getElementById('cartButton');
    const cartClose = document.getElementById('cartClose');
    const cartBackdrop = document.getElementById('cartBackdrop');
    
    if (cartButton) {
      cartButton.addEventListener('click', () => this.openCartDrawer());
    }
    if (cartClose) {
      cartClose.addEventListener('click', () => this.closeCartDrawer());
    }
    if (cartBackdrop) {
      cartBackdrop.addEventListener('click', () => this.closeCartDrawer());
    }
    
    // Bind checkout buttons
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutBtnMain = document.getElementById('checkout-btn-main');
    
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        this.showCheckoutForm();
      });
    }
    
    if (checkoutBtnMain) {
      checkoutBtnMain.addEventListener('click', () => {
        this.showCheckoutForm();
      });
    }
    
    // Bind process checkout button
    const processCheckoutBtn = document.getElementById('process-checkout-btn');
    if (processCheckoutBtn) {
      processCheckoutBtn.addEventListener('click', () => {
        this.processCheckout();
      });
    }
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
});
=======
      backdrop.classList.add('opacity-0');
      panel.classList.add('translate-x-full');
      setTimeout(() => drawer.classList.add('hidden'), 200);
    }
  };

  // Wire open/close
  document.addEventListener('DOMContentLoaded', () => {
    load();
    Cart.render();
    const cartBtn = document.getElementById('cartButton');
    const closeBtn = document.getElementById('cartClose');
    const backdrop = document.getElementById('cartBackdrop');
    cartBtn?.addEventListener('click', () => Drawer.open());
    closeBtn?.addEventListener('click', () => Drawer.close());
    backdrop?.addEventListener('click', () => Drawer.close());
    document.getElementById('checkoutBtn')?.addEventListener('click', () => {
      if (window.BCOrders) {
        const order = window.BCOrders.placeFromCart(this.getState());
        if (order) {
          alert(`Order ${order.id} placed!`);
          this.clear();
          Drawer.close();
          window.BCOrders.open();
        }
      }
    });
  });

  // Expose minimal API
  window.BCCart = Cart;
})();
>>>>>>> 51b6fc2876e28e250d13b5c6fc7f4a55df584577



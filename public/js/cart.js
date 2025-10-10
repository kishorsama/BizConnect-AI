// js/cart.js - Updated to work with backend API

const Cart = {
  // Load cart from backend
  async loadCart() {
    try {
      const response = await API.get(API_CONFIG.endpoints.cart);
      this.renderCart(response.cart);
    } catch (error) {
      console.error('Error loading cart:', error);
      this.renderCart({ items: [] });
    }
  },

  // Render cart items
  renderCart(cart) {
    console.log('Rendering cart:', cart);
    const cartItemsContainer = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const cartCountText = document.getElementById('cart-count');
    const cartTotalText = document.getElementById('cart-total');
    
    console.log('Cart elements found:', {
      cartItemsContainer: !!cartItemsContainer,
      cartCount: !!cartCount,
      cartTotal: !!cartTotal,
      cartCountText: !!cartCountText,
      cartTotalText: !!cartTotalText
    });
    
    if (!cartItemsContainer) return;

    if (!cart.items || cart.items.length === 0) {
      cartItemsContainer.innerHTML = '<div class="text-center py-8 text-gray-500">Your cart is empty</div>';
      if (cartCount) cartCount.textContent = '0';
      if (cartTotal) cartTotal.textContent = '₹0';
      if (cartCountText) cartCountText.textContent = '0 items in cart';
      if (cartTotalText) cartTotalText.textContent = '₹0';
      return;
    }

    let total = 0;
    cartItemsContainer.innerHTML = cart.items.map(item => {
      const itemTotal = item.productId.price * item.quantity;
      total += itemTotal;
      
      return `
        <div class="flex items-center gap-3 p-3 border-b border-gray-100">
          <img src="${item.productId.image || '/img/placeholder.jpg'}" alt="${item.productId.name}" class="w-12 h-12 rounded-lg object-cover">
          <div class="flex-1">
            <h4 class="font-medium text-gray-900">${item.productId.name}</h4>
            <p class="text-sm text-gray-600">₹${item.productId.price}</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="Cart.updateQuantity('${item.productId._id}', ${item.quantity - 1})" class="p-1 rounded-full hover:bg-gray-100">-</button>
            <span class="w-8 text-center">${item.quantity}</span>
            <button onclick="Cart.updateQuantity('${item.productId._id}', ${item.quantity + 1})" class="p-1 rounded-full hover:bg-gray-100">+</button>
            <button onclick="Cart.removeItem('${item.productId._id}')" class="p-1 rounded-full hover:bg-gray-100 text-red-600">×</button>
          </div>
        </div>
      `;
    }).join('');

    const totalCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    console.log('Updating cart display:', { totalCount, total });
    
    // Update all cart count and total elements
    if (cartCount) cartCount.textContent = totalCount;
    if (cartTotal) cartTotal.textContent = `₹${total}`;
    if (cartCountText) cartCountText.textContent = `${totalCount} items in cart`;
    if (cartTotalText) cartTotalText.textContent = `₹${total}`;
  },

  // Add item to cart
  async addToCart(productId, quantity = 1) {
    try {
      await API.post(API_CONFIG.endpoints.addToCart, {
        productId,
        quantity
      });
      this.loadCart();
      this.showMessage('Item added to cart!', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showMessage('Failed to add item to cart', 'error');
    }
  },

  // Update item quantity
  async updateQuantity(productId, newQuantity) {
    console.log('Updating quantity:', { productId, newQuantity });
    
    if (newQuantity < 1) {
      await this.removeItem(productId);
      return;
    }

    try {
      // For now, remove and re-add with new quantity
      console.log('Removing item from cart...');
      await API.delete(`${API_CONFIG.endpoints.removeFromCart}/${productId}`);
      
      console.log('Adding item back with new quantity...');
      await API.post(API_CONFIG.endpoints.addToCart, {
        productId,
        quantity: newQuantity
      });
      
      console.log('Reloading cart...');
      this.loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      this.showMessage('Failed to update quantity', 'error');
    }
  },

  // Remove item from cart
  async removeItem(productId) {
    try {
      await API.delete(`${API_CONFIG.endpoints.removeFromCart}/${productId}`);
      this.loadCart();
      this.showMessage('Item removed from cart', 'success');
    } catch (error) {
      console.error('Error removing from cart:', error);
      this.showMessage('Failed to remove item', 'error');
    }
  },

  // Clear cart
  async clearCart() {
    try {
      // Remove all items one by one
      const cartItems = document.querySelectorAll('#cartItems .flex');
      for (const item of cartItems) {
        const removeBtn = item.querySelector('button[onclick*="removeItem"]');
        if (removeBtn) {
          const onclick = removeBtn.getAttribute('onclick');
          const productId = onclick.match(/'([^']+)'/)[1];
          await this.removeItem(productId);
        }
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
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
  async processCheckout(shippingAddress) {
    try {
      const response = await API.post(API_CONFIG.endpoints.createOrder, {
        shippingAddress
      });
      
      this.showMessage('Order placed successfully!', 'success');
      this.hideCheckoutForm();
      this.loadCart(); // This will clear the cart
      
      // Redirect to orders page or show success message
      setTimeout(() => {
        window.location.href = '/customer-dashboard';
      }, 2000);
      
    } catch (error) {
      console.error('Error processing checkout:', error);
      this.showMessage('Failed to place order', 'error');
    }
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

  // Cart drawer functionality
  openCartDrawer() {
    Drawer.open();
  },

  closeCartDrawer() {
    Drawer.close();
  },

  // Initialize cart functionality
  init() {
    console.log('Cart.init() called');
    
    // Load cart when page loads
    this.loadCart();
    
    // Bind cart drawer controls
    const cartButton = document.getElementById('cartButton');
    const cartClose = document.getElementById('cartClose');
    const cartBackdrop = document.getElementById('cartBackdrop');
    
    console.log('Cart elements found:', {
      cartButton: !!cartButton,
      cartClose: !!cartClose,
      cartBackdrop: !!cartBackdrop
    });
    
    if (cartButton) {
      cartButton.addEventListener('click', () => {
        console.log('Cart button clicked');
        Drawer.open();
      });
    }
    if (cartClose) {
      cartClose.addEventListener('click', () => {
        console.log('Cart close clicked');
        Drawer.close();
      });
    }
    if (cartBackdrop) {
      cartBackdrop.addEventListener('click', () => {
        console.log('Cart backdrop clicked');
        Drawer.close();
      });
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
  }
};

// Drawer functionality
const Drawer = {
  open() {
    console.log('Drawer.open() called');
    const drawer = document.getElementById('cartDrawer');
    const panel = drawer?.querySelector('aside');
    const backdrop = document.getElementById('cartBackdrop');
    
    console.log('Drawer elements found:', {
      drawer: !!drawer,
      panel: !!panel,
      backdrop: !!backdrop
    });
    
    if (!drawer || !panel || !backdrop) {
      console.error('Missing drawer elements');
      return;
    }
    
    drawer.classList.remove('hidden');
    requestAnimationFrame(() => {
      backdrop.classList.remove('opacity-0');
      panel.classList.remove('translate-x-full');
    });
    console.log('Drawer opened successfully');
  },
  close() {
    const drawer = document.getElementById('cartDrawer');
    const panel = drawer?.querySelector('aside');
    const backdrop = document.getElementById('cartBackdrop');
    if (!drawer || !panel || !backdrop) return;
    
    backdrop.classList.add('opacity-0');
    panel.classList.add('translate-x-full');
    setTimeout(() => drawer.classList.add('hidden'), 200);
  }
};

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
});
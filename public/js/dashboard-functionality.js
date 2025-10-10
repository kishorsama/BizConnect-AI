// js/dashboard-functionality.js

const DashboardFunctionality = {
  // Location functionality
  initLocation() {
    const locationText = document.getElementById('locationText');
    const changeLocationBtn = document.getElementById('changeLocationBtn');
    
    // Set default location
    if (locationText) {
      locationText.textContent = 'Mumbai, Maharashtra';
    }
    
    // Handle location change
    if (changeLocationBtn) {
      changeLocationBtn.addEventListener('click', () => {
        this.showLocationModal();
      });
    }
  },

  showLocationModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Select Delivery Location</h3>
        <div class="space-y-2">
          <button class="w-full text-left p-2 hover:bg-gray-100 rounded" onclick="DashboardFunctionality.setLocation('Mumbai, Maharashtra')">Mumbai, Maharashtra</button>
          <button class="w-full text-left p-2 hover:bg-gray-100 rounded" onclick="DashboardFunctionality.setLocation('Delhi, Delhi')">Delhi, Delhi</button>
          <button class="w-full text-left p-2 hover:bg-gray-100 rounded" onclick="DashboardFunctionality.setLocation('Bangalore, Karnataka')">Bangalore, Karnataka</button>
          <button class="w-full text-left p-2 hover:bg-gray-100 rounded" onclick="DashboardFunctionality.setLocation('Chennai, Tamil Nadu')">Chennai, Tamil Nadu</button>
          <button class="w-full text-left p-2 hover:bg-gray-100 rounded" onclick="DashboardFunctionality.setLocation('Kolkata, West Bengal')">Kolkata, West Bengal</button>
        </div>
        <button class="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded" onclick="DashboardFunctionality.closeLocationModal()">Cancel</button>
      </div>
    `;
    document.body.appendChild(modal);
  },

  setLocation(location) {
    const locationText = document.getElementById('locationText');
    if (locationText) {
      locationText.textContent = location;
    }
    localStorage.setItem('deliveryLocation', location);
    this.closeLocationModal();
    this.showMessage(`Delivery location set to ${location}`, 'success');
  },

  closeLocationModal() {
    const modal = document.querySelector('.fixed.inset-0.bg-black');
    if (modal) {
      modal.remove();
    }
  },

  // Search functionality
  initSearch() {
    const searchInput = document.querySelector('input[placeholder="Search grocery products"]');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
      
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.performSearch(e.target.value);
        }
      });
    }
  },

  handleSearch(query) {
    // Real-time search suggestions could be implemented here
    if (query.length > 2) {
      console.log('Searching for:', query);
    }
  },

  async performSearch(query) {
    if (!query.trim()) return;
    
    try {
      // Get all products and filter by search query
      const products = await Products.getAllProducts();
      const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );
      
      // Update products display
      Products.renderProducts(filteredProducts, 'products-container');
      this.showMessage(`Found ${filteredProducts.length} products for "${query}"`, 'info');
    } catch (error) {
      console.error('Search error:', error);
      this.showMessage('Search failed', 'error');
    }
  },

  // Nearby shops functionality
  initNearbyShops() {
    const nearbyMenuButton = document.getElementById('nearbyMenuButton');
    const nearbyMenu = document.getElementById('nearbyMenu');
    const nearbyList = document.getElementById('nearbyList');
    
    if (nearbyMenuButton && nearbyMenu) {
      nearbyMenuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleNearbyMenu();
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!nearbyMenu.contains(e.target) && !nearbyMenuButton.contains(e.target)) {
          nearbyMenu.classList.add('hidden');
        }
      });
    }
    
    // Load nearby shops
    this.loadNearbyShops();
  },

  toggleNearbyMenu() {
    const nearbyMenu = document.getElementById('nearbyMenu');
    if (nearbyMenu) {
      nearbyMenu.classList.toggle('hidden');
    }
  },

  async loadNearbyShops() {
    const nearbyList = document.getElementById('nearbyList');
    if (!nearbyList) return;
    
    try {
      // Get vendors from products
      const products = await Products.getAllProducts();
      const vendors = [...new Set(products.map(p => p.vendorId.name))];
      
      nearbyList.innerHTML = vendors.map(vendor => `
        <div class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-600 font-semibold">${vendor.charAt(0)}</span>
            </div>
            <div>
              <div class="font-medium text-gray-900">${vendor}</div>
              <div class="text-sm text-gray-500">Open • 0.5 km away</div>
            </div>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading nearby shops:', error);
      nearbyList.innerHTML = '<div class="px-4 py-3 text-gray-500">No shops available</div>';
    }
  },

  // Profile functionality
  initProfile() {
    const profileMenuButton = document.getElementById('profileMenuButton');
    const profileMenu = document.getElementById('profileMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (profileMenuButton && profileMenu) {
      profileMenuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleProfileMenu();
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!profileMenu.contains(e.target) && !profileMenuButton.contains(e.target)) {
          profileMenu.classList.add('hidden');
        }
      });
    }
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }
    
    // Handle profile menu items
    this.initProfileMenuItems();
    
    // Update profile info
    this.updateProfileInfo();
  },

  toggleProfileMenu() {
    const profileMenu = document.getElementById('profileMenu');
    if (profileMenu) {
      profileMenu.classList.toggle('hidden');
    }
  },

  updateProfileInfo() {
    const user = Auth.getCurrentUser();
    if (user) {
      // Update profile image (you could add user avatar functionality)
      const profileImg = document.querySelector('#profileMenuButton img');
      if (profileImg) {
        profileImg.alt = user.name;
        profileImg.title = user.name;
      }
    }
  },

  initProfileMenuItems() {
    // Orders
    const ordersLink = document.querySelector('[data-open-orders]');
    if (ordersLink) {
      ordersLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showOrders();
      });
    }
    
    // Favourites
    const favLink = document.querySelector('[data-open-fav]');
    if (favLink) {
      favLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showFavourites();
      });
    }
  },

  showOrders() {
    this.showMessage('Orders feature coming soon!', 'info');
  },

  showFavourites() {
    this.showMessage('Favourites feature coming soon!', 'info');
  },

  handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      Auth.logout();
    }
  },

  // Cart count functionality
  initCartCount() {
    // Update cart count when cart changes
    const updateCartCount = () => {
      const cartCount = document.getElementById('cartCount');
      if (cartCount) {
        // This will be updated by the cart system
        // For now, we'll set it to 0 and let cart.js handle updates
        cartCount.textContent = '0';
      }
    };
    
    updateCartCount();
  },

  // Message system
  showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
      type === 'warning' ? 'bg-yellow-500' :
      'bg-blue-500'
    }`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 3000);
  },

  // Initialize all functionality
  init() {
    console.log('Initializing dashboard functionality...');
    
    this.initLocation();
    this.initSearch();
    this.initNearbyShops();
    this.initProfile();
    this.initCartCount();
    
    console.log('Dashboard functionality initialized');
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  DashboardFunctionality.init();
});

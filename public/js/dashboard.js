// Initialize Lucide icons and small UI hooks
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  // Search hooks (filters product grids)
  const searchInput = document.querySelector('input[placeholder="Search grocery products"], input[placeholder="Search here"]');
  const getQuery = () => (searchInput?.value || '').trim().toLowerCase();

  // Profile dropdown interactions
  const menuBtn = document.getElementById('profileMenuButton');
  const menu = document.getElementById('profileMenu');
  const wrapper = document.getElementById('profileMenuWrapper');
  const logoutBtn = document.getElementById('logoutBtn');

  const closeMenu = () => {
    if (menu) menu.classList.add('hidden');
  };

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!wrapper?.contains(e.target)) {
        closeMenu();
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (window.Auth && typeof window.Auth.logout === 'function') {
        window.Auth.logout();
      } else if (typeof Auth !== 'undefined') {
        Auth.logout();
      }
    });
  }

  // Nearby shops dropdown
  const nearBtn = document.getElementById('nearbyMenuButton');
  const nearMenu = document.getElementById('nearbyMenu');
  const nearWrap = document.getElementById('nearbyMenuWrapper');
  const nearList = document.getElementById('nearbyList');
  if (nearBtn && nearMenu) {
    nearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nearMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
      if (!nearWrap?.contains(e.target)) nearMenu.classList.add('hidden');
    });
  }

  // Populate nearby shops (mocked based on location)
  const renderNearby = (shops) => {
    if (!nearList) return;
    nearList.innerHTML = '';
    shops.forEach((s) => {
      const row = document.createElement('a');
      row.href = '#';
      row.className = 'flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition';
      row.innerHTML = `
        <img src="https://placehold.co/56x40" class="w-14 h-10 rounded-lg object-cover" alt="${s.name}">
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-800 truncate">${s.name}</p>
          <p class="text-xs text-gray-500 truncate">${s.distance} • ${s.category}</p>
        </div>
      `;
      nearList.appendChild(row);
    });
  };

  // Location pill: try geolocation, then fallback
  const locationText = document.getElementById('locationText');
  const setLoc = (txt) => { if (locationText) locationText.textContent = txt; };

  const mockShops = [
    { name: 'Fresh Basket', distance: '0.4 km', category: 'Fruits & Vegetables' },
    { name: 'City Dairy', distance: '0.7 km', category: 'Dairy & Eggs' },
    { name: 'GoodDay Bakery', distance: '1.1 km', category: 'Bakery' },
    { name: 'Snack Shack', distance: '1.3 km', category: 'Snacks' },
    { name: 'Hydrate Hub', distance: '1.8 km', category: 'Beverages' }
  ];

  const updateForCoords = (lat, lon) => {
    // Short display like Area • PIN (mocked PIN)
    const pin = String(Math.floor(100000 + (Math.abs(lat * lon) % 900000)));
    setLoc(`Near you • ${pin}`);
    renderNearby(mockShops);
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => updateForCoords(pos.coords.latitude, pos.coords.longitude),
      () => { setLoc('Set location • 560001'); renderNearby(mockShops); },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  } else {
    setLoc('Set location • 560001');
    renderNearby(mockShops);
  }

  // ------- Dynamic products rendering -------
  // Load products from API instead of using hardcoded data
  let products = [];
  
  // Function to load products from API
  const loadProducts = async () => {
    try {
      console.log('🔄 Loading products from API...');
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 API Response:', data);
      
      if (data.products && Array.isArray(data.products)) {
        // Transform API data to match expected format
        products = data.products.map(product => ({
          id: product._id,
          name: product.name,
          price: product.price,
          mrp: Math.round(product.price * 1.2), // Add 20% markup as MRP
          image: product.image || 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=200&fit=crop',
          category: product.category,
          description: product.description,
          stock: product.stock
        }));
        
        console.log('✅ Loaded products from API:', products.length);
        console.log('📋 Sample products:', products.slice(0, 3));
        
        // Render products after loading
        renderAll();
      } else {
        console.warn('⚠️ No products found in API response');
        throw new Error('No products found in API response');
      }
    } catch (error) {
      console.error('❌ Error loading products:', error);
      // Fallback to mock data if API fails
      products = [
        { id: 'p1', name: 'Banana (1 kg)', price: 40, mrp: 55, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop', category: 'Fruits & Vegetables' },
        { id: 'p2', name: 'Tomato (1 kg)', price: 32, mrp: 45, image: 'https://images.unsplash.com/photo-1546470427-5a4b0b0b0b0b?w=300&h=200&fit=crop', category: 'Fruits & Vegetables' },
        { id: 'p3', name: 'Apple (1 kg)', price: 120, mrp: 150, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=200&fit=crop', category: 'Fruits & Vegetables' },
        { id: 'p4', name: 'Milk (1 L)', price: 55, mrp: 60, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=200&fit=crop', category: 'Dairy & Eggs' },
        { id: 'p5', name: 'Eggs (12 pcs)', price: 78, mrp: 90, image: 'https://images.unsplash.com/photo-1518569656558-1c25a1a0b3b3?w=300&h=200&fit=crop', category: 'Dairy & Eggs' },
        { id: 'p6', name: 'Butter (200g)', price: 45, mrp: 55, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&h=200&fit=crop', category: 'Dairy & Eggs' },
        { id: 'p7', name: 'Bread (400g)', price: 35, mrp: 40, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop', category: 'Bakery' },
        { id: 'p8', name: 'Croissants (6 pcs)', price: 85, mrp: 100, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&h=200&fit=crop', category: 'Bakery' },
        { id: 'p9', name: 'Potato Chips', price: 20, mrp: 25, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=200&fit=crop', category: 'Snacks' },
        { id: 'p10', name: 'Mixed Nuts', price: 150, mrp: 180, image: 'https://images.unsplash.com/photo-1553456558-a0c0a4a0b0b0b?w=300&h=200&fit=crop', category: 'Snacks' },
        { id: 'p11', name: 'Cola (1.25 L)', price: 75, mrp: 85, image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=300&h=200&fit=crop', category: 'Beverages' },
        { id: 'p12', name: 'Orange Juice (1 L)', price: 65, mrp: 75, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=200&fit=crop', category: 'Beverages' },
        { id: 'p13', name: 'Instant Noodles', price: 12, mrp: 15, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop', category: 'Breakfast & Instant' },
        { id: 'p14', name: 'Cereal (500g)', price: 95, mrp: 110, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop', category: 'Breakfast & Instant' },
        { id: 'p15', name: 'Dishwash Liquid', price: 85, mrp: 99, image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300&h=200&fit=crop', category: 'Household Essentials' },
        { id: 'p16', name: 'Toilet Paper (12 rolls)', price: 120, mrp: 140, image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300&h=200&fit=crop', category: 'Household Essentials' },
        { id: 'p17', name: 'Shampoo (180ml)', price: 115, mrp: 140, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=200&fit=crop', category: 'Personal Care' },
        { id: 'p18', name: 'Toothpaste (100g)', price: 45, mrp: 55, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=200&fit=crop', category: 'Personal Care' }
      ];
      console.log('🔄 Using fallback mock data:', products.length, 'products');
      renderAll();
    }
  };

  const recommendedGrid = document.getElementById('recommendedGrid');
  const dealsGrid = document.getElementById('dealsGrid');
  const cartCount = document.getElementById('cartCount');
  let cartQty = 0;

  const formatCurrency = (n) => `₹${n}`;
  const discountPct = (mrp, price) => Math.round((1 - price / mrp) * 100);

  const createCard = (p) => {
    const d = discountPct(p.mrp, p.price);
    const inCart = window.BCCart ? window.BCCart.qty(p.id) : 0;
    const el = document.createElement('div');
    el.className = 'bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden hover-lift relative';
    el.innerHTML = `
      <div class="relative">
        <img src="${p.image}" alt="${p.name}" class="w-full h-32 object-cover">
        <span class="absolute top-2 left-2 text-[11px] font-semibold bg-green-600 text-white px-2 py-0.5 rounded-full">${d}% OFF</span>
        <button data-fav="${p.id}" class="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white shadow"><i data-lucide="heart" class="w-4 h-4"></i></button>
      </div>
      <div class="p-3">
        <p class="text-sm font-medium text-gray-900 line-clamp-2">${p.name}</p>
        <div class="mt-1 flex items-center gap-2">
          <span class="text-sm font-semibold text-gray-900">${formatCurrency(p.price)}</span>
          <span class="text-xs text-gray-400 line-through">${formatCurrency(p.mrp)}</span>
        </div>
        <div class="mt-4"></div>
        <div class="flex items-center justify-center">
          ${inCart === 0 ? `<button data-add="${p.id}" class="add-btn w-full text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full transition">Add to cart</button>` : `
            <div class="cart-qty-card">
              <button class="cart-qty-btn" data-dec-quick="${p.id}">–</button>
              <span class="cart-qty-number" data-qty-label="${p.id}">${inCart}</span>
              <button class="cart-qty-btn" data-inc-quick="${p.id}">+</button>
            </div>`}
        </div>
      </div>
    `;
    return el;
  };

  const renderProducts = (list, into) => {
    if (!into) return;
    into.innerHTML = '';
    list.forEach((p) => into.appendChild(createCard(p)));
    if (window.lucide) window.lucide.createIcons();

    into.querySelectorAll('button[data-add]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-add');
        const prod = products.find((p) => p.id === id);
        if (window.BCCart && prod) {
          // First add 1 and switch to inline quantity controls
          window.BCCart.add(prod, 1);
          cartQty = window.BCCart.count();
          if (cartCount) cartCount.textContent = String(cartQty);
          const wrap = btn.parentElement?.querySelector(`[data-qty-wrap="${id}"]`);
          const label = btn.parentElement?.querySelector(`[data-qty-label="${id}"]`);
          if (wrap && label) {
            wrap.classList.remove('hidden');
            btn.classList.add('hidden');
            label.textContent = String(window.BCCart.qty(id));
          }
          showAddedFeedback(btn);
        }
      });
    });

    // quick +/- handlers
    into.querySelectorAll('[data-inc-quick]').forEach((b) => b.addEventListener('click', () => {
      const id = b.getAttribute('data-inc-quick');
      const prod = products.find((p) => p.id === id);
      if (!prod || !window.BCCart) return;
      window.BCCart.add(prod, 1);
      const lbl = b.parentElement?.querySelector(`[data-qty-label="${id}"]`);
      if (lbl) lbl.textContent = String(window.BCCart.qty(id));
      if (cartCount) cartCount.textContent = String(window.BCCart.count());
    }));
    into.querySelectorAll('[data-dec-quick]').forEach((b) => b.addEventListener('click', () => {
      const id = b.getAttribute('data-dec-quick');
      if (!window.BCCart) return;
      const current = window.BCCart.qty(id);
      if (current <= 1) {
        window.BCCart.remove(id);
        // revert to add button
        const wrap = b.parentElement;
        const addBtn = wrap?.parentElement?.querySelector(`[data-add="${id}"]`);
        wrap?.classList.add('hidden');
        addBtn?.classList.remove('hidden');
      } else {
        window.BCCart.update(id, current - 1);
        const lbl = b.parentElement?.querySelector(`[data-qty-label="${id}"]`);
        if (lbl) lbl.textContent = String(window.BCCart.qty(id));
      }
      if (cartCount) cartCount.textContent = String(window.BCCart.count());
    }));

    // favourites
    const paintFav = (btn, id) => {
      const icon = btn.querySelector('svg') || btn.querySelector('i');
      const isFav = window.BCFav?.has(id);
      if (!icon) return;
      // Color
      icon.classList.remove('text-rose-500');
      if (isFav) icon.classList.add('text-rose-500');
      // Fill SVG for fav state (Lucide defaults to fill="none")
      if (icon.tagName.toLowerCase() === 'svg') {
        icon.setAttribute('fill', isFav ? 'currentColor' : 'none');
        icon.setAttribute('stroke', isFav ? 'currentColor' : 'currentColor');
      }
    };
    into.querySelectorAll('button[data-fav]').forEach((btn) => {
      const id = btn.getAttribute('data-fav');
      paintFav(btn, id);
      btn.addEventListener('click', () => {
        const prod = products.find((p) => p.id === id);
        if (window.BCFav && prod) {
          window.BCFav.toggle({ id: prod.id, name: prod.name, price: prod.price, image: prod.image });
          paintFav(btn, id);
        }
      });
    });
  };

  const filterByQuery = (list) => {
    const q = getQuery();
    if (!q) return list;
    return list.filter((p) => p.name.toLowerCase().includes(q));
  };

  const renderAll = () => {
    renderProducts(filterByQuery(products), recommendedGrid);
    renderProducts(filterByQuery(products), dealsGrid);
  };

  // Don't render initially - wait for products to load from API

  // Repaint favourites when drawer updates
  window.addEventListener('fav:changed', () => {
    renderProducts(products.slice(0, 10), recommendedGrid);
  });

  // Listen for global cart changes (sync cart count, product controls)
  window.addEventListener('cart:changed', () => {
    // Re-run renderProducts so all grids refresh quantities and controls
    renderAll();
    // Update cart count
    if (cartCount && window.BCCart) {
      cartCount.textContent = String(window.BCCart.count());
    }
  });

  // Set default active category (All)
  const allCategoryBtn = document.querySelector('.js-category[data-category="all"]');
  if (allCategoryBtn) {
    allCategoryBtn.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50');
    allCategoryBtn.querySelector('div').classList.add('bg-blue-50', 'border-blue-200');
  }

  // Category filters
  document.querySelectorAll('.js-category').forEach((btn) => {
    btn.addEventListener('click', () => {
      console.log('Category button clicked');
      
      // Remove active class from all buttons
      document.querySelectorAll('.js-category').forEach(b => {
        b.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
        b.querySelector('div').classList.remove('bg-blue-50', 'border-blue-200');
      });
      
      // Add active class to clicked button
      btn.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50');
      btn.querySelector('div').classList.add('bg-blue-50', 'border-blue-200');
      
      const cat = btn.getAttribute('data-category');
      console.log('Selected category:', cat);
      console.log('Available products:', products);
      
      let list;
      if (cat === 'all') {
        list = products;
        console.log('Showing all products:', list.length);
      } else {
        list = products.filter((p) => p.category === cat);
        console.log(`Filtered products for ${cat}:`, list.length, list);
        // Show empty grid if no products found for this category
      }
      
      // Update BOTH grids with the filtered list
      renderProducts(filterByQuery(list), recommendedGrid);
      renderProducts(filterByQuery(list), dealsGrid);
    });
  });

  // Search events (debounced)
  let t;
  const triggerSearch = () => { clearTimeout(t); t = setTimeout(renderAll, 150); };
  searchInput?.addEventListener('input', triggerSearch);
  searchInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') renderAll(); });

  // Profile menu actions: open Orders/Favourites drawers
  document.querySelector('#profileMenu a:nth-child(1)')?.addEventListener('click', (e) => { e.preventDefault(); window.BCOrders?.open(); });
  document.querySelector('#profileMenu a:nth-child(2)')?.addEventListener('click', (e) => { e.preventDefault(); window.BCFav?.open(); });

  // Load products from API when page loads
  loadProducts();

  // Helper function for showing added feedback
  const showAddedFeedback = (btn) => {
    // Create or reuse a feedback span
    let fb = btn.parentElement.querySelector('.added-feedback');
    if (!fb) {
      fb = document.createElement('span');
      fb.className = 'added-feedback bg-green-500 text-white text-xs px-2 py-1 rounded-full absolute top-1 right-2 z-10 animate-fade-in';
      btn.parentElement.style.position = 'relative';
      btn.parentElement.appendChild(fb);
    }
    fb.textContent = 'Added!';
    fb.style.display = 'inline-block';
    setTimeout(() => {
      if(fb) fb.style.display = 'none';
    }, 1200);
  };
});



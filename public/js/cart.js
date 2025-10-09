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
      const drawer = document.getElementById('cartDrawer');
      const panel = drawer?.querySelector('aside');
      const backdrop = document.getElementById('cartBackdrop');
      if (!drawer || !panel || !backdrop) return;
      drawer.classList.remove('hidden');
      requestAnimationFrame(() => {
        backdrop.classList.remove('opacity-0');
        panel.classList.remove('translate-x-full');
      });
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



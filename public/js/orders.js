// Orders drawer with localStorage mock
(function () {
  const STORAGE_KEY = 'bc_orders_v1';

  const Orders = {
    list: [],
    load() { try { this.list = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { this.list = []; } },
    save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.list)); },
    placeFromCart(cartItems) {
      if (!Array.isArray(cartItems) || cartItems.length === 0) return null;
      const order = {
        id: 'ORD-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        createdAt: new Date().toISOString(),
        items: cartItems,
        status: 'Placed',
      };
      this.list.unshift(order);
      this.save();
      this.render();
      return order;
    },
    render() {
      const listEl = document.getElementById('ordersList');
      if (!listEl) return;
      listEl.innerHTML = '';
      this.list.forEach((o) => {
        const total = o.items.reduce((n, i) => n + i.price * i.qty, 0);
        const block = document.createElement('div');
        block.className = 'rounded-xl border border-gray-100 p-3';
        block.innerHTML = `
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-gray-900">${o.id}</p>
              <p class="text-xs text-gray-500">${new Date(o.createdAt).toLocaleString()}</p>
            </div>
            <div class="text-sm font-semibold">₹${total}</div>
          </div>
          <div class="mt-2 grid grid-cols-3 gap-2">
            ${o.items.slice(0,3).map(i => `<img src="${i.image}" class="h-16 w-full object-cover rounded-lg" alt="">`).join('')}
          </div>
          <div class="mt-2 text-xs text-gray-500">${o.items.length} item(s) • ${o.status}</div>
        `;
        listEl.appendChild(block);
      });
    },
    open() { Drawer.open(); },
    close() { Drawer.close(); }
  };

  const Drawer = {
    open() {
      const d = document.getElementById('ordersDrawer');
      const p = d?.querySelector('aside');
      const b = document.getElementById('ordersBackdrop');
      if (!d || !p || !b) return;
      d.classList.remove('hidden');
      requestAnimationFrame(() => { b.classList.remove('opacity-0'); p.classList.remove('translate-x-full'); });
    },
    close() {
      const d = document.getElementById('ordersDrawer');
      const p = d?.querySelector('aside');
      const b = document.getElementById('ordersBackdrop');
      if (!d || !p || !b) return;
      b.classList.add('opacity-0');
      p.classList.add('translate-x-full');
      setTimeout(() => d.classList.add('hidden'), 200);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    Orders.load();
    Orders.render();
    document.getElementById('ordersClose')?.addEventListener('click', () => Orders.close());
    document.getElementById('ordersBackdrop')?.addEventListener('click', () => Orders.close());
    document.querySelectorAll('[data-open-orders]')?.forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); Orders.open(); }));
  });

  window.BCOrders = Orders;
})();



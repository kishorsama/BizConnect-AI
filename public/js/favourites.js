// Favourites drawer and storage
(function () {
  const STORAGE_KEY = 'bc_favourites_v1';

  const Fav = {
    list: [],
    load() {
      try { this.list = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
      catch { this.list = []; }
    },
    save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.list)); },
    has(id) { return this.list.some((i) => i.id === id); },
    toggle(item) {
      const idx = this.list.findIndex((i) => i.id === item.id);
      if (idx >= 0) this.list.splice(idx, 1); else this.list.push(item);
      this.save(); this.render();
      window.dispatchEvent(new CustomEvent('fav:changed'));
    },
    render() {
      const root = document.getElementById('favItems');
      if (!root) return;
      root.innerHTML = '';
      this.list.forEach((i) => {
        const row = document.createElement('div');
        row.className = 'flex items-center gap-3 p-3 rounded-xl border border-gray-100';
        row.innerHTML = `
          <img src="${i.image}" class="w-16 h-12 rounded-lg object-cover" alt="${i.name}">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-900 truncate">${i.name}</p>
            <p class="text-xs text-gray-500">₹${i.price}</p>
          </div>
          <button data-remove="${i.id}" class="ml-2 p-2 rounded-full hover:bg-gray-100"><i data-lucide="heart-off" class="w-4 h-4 text-rose-500"></i></button>
        `;
        root.appendChild(row);
      });
      if (window.lucide) window.lucide.createIcons();
      root.querySelectorAll('[data-remove]').forEach((b) => b.addEventListener('click', () => {
        this.toggle({ id: b.getAttribute('data-remove') });
      }));
    },
    open() { Drawer.open(); },
    close() { Drawer.close(); }
  };

  const Drawer = {
    open() {
      const d = document.getElementById('favDrawer');
      const p = d?.querySelector('aside');
      const b = document.getElementById('favBackdrop');
      if (!d || !p || !b) return;
      d.classList.remove('hidden');
      requestAnimationFrame(() => { b.classList.remove('opacity-0'); p.classList.remove('translate-x-full'); });
    },
    close() {
      const d = document.getElementById('favDrawer');
      const p = d?.querySelector('aside');
      const b = document.getElementById('favBackdrop');
      if (!d || !p || !b) return;
      b.classList.add('opacity-0');
      p.classList.add('translate-x-full');
      setTimeout(() => d.classList.add('hidden'), 200);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    Fav.load();
    Fav.render();
    document.getElementById('favClose')?.addEventListener('click', () => Fav.close());
    document.getElementById('favBackdrop')?.addEventListener('click', () => Fav.close());
    // Open from profile menu if link has data-open-fav
    document.querySelectorAll('[data-open-fav]')?.forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); Fav.open(); }));
  });

  window.BCFav = Fav;
})();



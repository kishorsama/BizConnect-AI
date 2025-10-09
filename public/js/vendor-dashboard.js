// Page-specific JS for Vendor Dashboard (menu + auth personalization)
(function(){
  // Protect page for vendor role
  if (typeof Auth !== 'undefined' && typeof Auth.protectPage === 'function') {
    Auth.protectPage(['vendor']);
  }

  // Personalize user name (just the name, not 'Welcome, ...')
  try {
    const user = (typeof Auth !== 'undefined' && typeof Auth.getCurrentUser === 'function') ? Auth.getCurrentUser() : null;
    if (user) {
      var nameNode = document.getElementById('userName');
      if (nameNode) nameNode.textContent = user.name;
      // Update shop name and address in topbar
      var shopNameNode = document.getElementById('shopName');
      var shopAddressNode = document.getElementById('shopAddress');
      if (shopNameNode) shopNameNode.textContent = user.shopName || 'BizConnect Demo Shop';
      if (shopAddressNode) shopAddressNode.textContent = user.address || '123 Market Lane, Main City';
    }
  } catch (_) {}

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

  // Profile menu: view profile info modal
  var profileInfoBtn = document.getElementById('profileInfoBtn');
  var profileInfoModal = document.getElementById('profileInfoModal');
  var profileInfoClose = document.getElementById('profileInfoClose');
  function fillProfileInfo() {
    var u = (typeof Auth !== 'undefined' && typeof Auth.getCurrentUser === 'function') ? Auth.getCurrentUser() : {};
    document.getElementById('piShopNameIn').value = u.shopName || 'BizConnect Demo Shop';
    document.getElementById('piVendorNameIn').value = u.name || 'Demo Vendor';
    document.getElementById('piEmailIn').value = u.email || 'vendor@example.com';
    document.getElementById('piPhoneIn').value = u.phone || '+91-90000 00000';
    document.getElementById('piAddressIn').value = u.address || '123 Market Lane, Main City';
  }
  if (profileInfoBtn && profileInfoModal) {
    profileInfoBtn.addEventListener('click', function(e){
      profileMenu.style.display = 'none';
      fillProfileInfo();
      profileInfoModal.removeAttribute('hidden');
    });
  }
  if (profileInfoClose && profileInfoModal) {
    profileInfoClose.addEventListener('click', function(){
      profileInfoModal.setAttribute('hidden', '');
    });
  }
  // Save profile info in form
  var piForm = document.getElementById('profileInfoForm');
  if (piForm) {
    piForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // Update Auth user object if possible
      var u = (typeof Auth !== 'undefined' && typeof Auth.getCurrentUser === 'function') ? Auth.getCurrentUser() : {};
      u.shopName = document.getElementById('piShopNameIn').value.trim();
      u.name = document.getElementById('piVendorNameIn').value.trim();
      u.email = document.getElementById('piEmailIn').value.trim();
      u.phone = document.getElementById('piPhoneIn').value.trim();
      u.address = document.getElementById('piAddressIn').value.trim();
      // Persist to localStorage if exists, else just update global (mock persistence)
      if (window.localStorage && u) {
        var current = (window.localStorage['authUser']) ? JSON.parse(window.localStorage['authUser']) : {};
        Object.assign(current, u);
        window.localStorage['authUser'] = JSON.stringify(current);
      }
      var nameNode = document.getElementById('userName');
      if (nameNode) nameNode.textContent = u.name;
      // Update shop name and address in topbar after save
      var shopNameNode = document.getElementById('shopName');
      var shopAddressNode = document.getElementById('shopAddress');
      if (shopNameNode) shopNameNode.textContent = u.shopName;
      if (shopAddressNode) shopAddressNode.textContent = u.address;
      profileInfoModal.setAttribute('hidden', '');
    });
  }

  // Menu removed per request; no dropdown logic needed
})();



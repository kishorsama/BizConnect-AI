// Items page behavior: mock data + CRUD in-memory
(function(){
  if (typeof Auth !== 'undefined' && typeof Auth.protectPage === 'function') {
    Auth.protectPage(['vendor']);
  }

  // personalize
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

  var tableBody = document.querySelector('#itemsTable tbody');
  var dialog = document.getElementById('itemDialog');
  var dialogTitle = document.getElementById('dialogTitle');
  var fName = document.getElementById('fName');
  var fSku = document.getElementById('fSku');
  var fPrice = document.getElementById('fPrice');
  var fStock = document.getElementById('fStock');
  var fStatus = document.getElementById('fStatus');
  var btnAdd = document.getElementById('btnAddItem');
  var btnCancel = document.getElementById('btnCancel');
  var btnSave = document.getElementById('btnSave');

  var items = [
    { id: 'I-1001', name: 'Cotton T-Shirt', sku: 'TSHIRT-CTN', price: 12.50, stock: 120, status: 'active' },
    { id: 'I-1002', name: 'Kids Romper', sku: 'ROMPER-KD', price: 9.99, stock: 75, status: 'active' },
    { id: 'I-1003', name: 'Winter Jacket', sku: 'JACKET-WN', price: 39.95, stock: 18, status: 'inactive' }
  ];
  var editingId = null;

  function fmt(n){ return '₹' + Number(n).toFixed(2); }
  function closeDialog(){
    if (dialog) {
      dialog.setAttribute('hidden','');
      dialog.style.display = 'none'; // force hide
    }
  }
  function openDialog(title){
    if (!dialog) return;
    dialogTitle.textContent = title;
    dialog.removeAttribute('hidden');
    dialog.style.display = ''; // reset any forced style
  }
  function clearForm(){ fName.value=''; fSku.value=''; fPrice.value=''; fStock.value=''; fStatus.value='active'; }

  function render(list){
    if (!tableBody) return;
    tableBody.innerHTML = '';
    list.forEach(function(it){
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>'+it.name+'</td>'+
        '<td>'+it.sku+'</td>'+
        '<td>'+fmt(it.price)+'</td>'+
        '<td>'+it.stock+'</td>'+
        '<td><span class="status-chip ' + (it.status === 'active' ? 'active' : 'inactive') + '">'+(it.status === 'active' ? 'Active' : 'Inactive')+'</span></td>'+
        '<td>'+
          '<a href="#" class="action-btn-small edit" data-edit="'+it.id+'">Edit</a> '+
          '<a href="#" class="action-btn-small delete" data-del="'+it.id+'">Delete</a>'+
        '</td>';
      tableBody.appendChild(tr);
    });

    // bind actions
    tableBody.querySelectorAll('a[data-edit]').forEach(function(b){
      b.addEventListener('click', function(){
        var id = b.getAttribute('data-edit');
        var it = items.find(function(x){ return x.id === id; });
        if (!it) return;
        editingId = id;
        fName.value = it.name; fSku.value = it.sku; fPrice.value = String(it.price); fStock.value = String(it.stock); fStatus.value = it.status;
        openDialog('Edit Item');
      });
    });
    tableBody.querySelectorAll('a[data-del]').forEach(function(b){
      b.addEventListener('click', function(){
        var id = b.getAttribute('data-del');
        items = items.filter(function(x){ return x.id !== id; });
        render(items);
      });
    });
  }

  // initial render
  render(items);

  // dialog buttons
  if (btnAdd) btnAdd.addEventListener('click', function(){ editingId = null; clearForm(); openDialog('Add Item'); });
  if (btnCancel) btnCancel.addEventListener('click', closeDialog);
  if (btnSave) btnSave.addEventListener('click', function(){
    var isValid = true;
    // Reset styles
    fName.style.borderColor = '';
    fSku.style.borderColor = '';
    if (!fName.value.trim()) { fName.style.borderColor = '#dc2626'; isValid = false; }
    if (!fSku.value.trim()) { fSku.style.borderColor = '#dc2626'; isValid = false; }
    if (!isValid) return;
    var payload = { id: editingId || ('I-' + Math.floor(Math.random()*9000 + 1000)), name: fName.value.trim(), sku: fSku.value.trim(), price: Number(fPrice.value || 0), stock: Number(fStock.value || 0), status: fStatus.value };
    if (editingId) {
      items = items.map(function(x){ return x.id === editingId ? payload : x; });
    } else {
      items.unshift(payload);
    }
    closeDialog();
    render(items);
  });

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
})();



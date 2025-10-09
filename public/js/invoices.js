// Vendor - Invoices page: mock data, render, search
(function(){
  if (typeof Auth !== 'undefined' && typeof Auth.protectPage === 'function') {
    Auth.protectPage(['vendor']);
  }
  // Personalize user name (just the name)
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

  // Profile dropdown logic (matches Items tab)
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

  var tableBody = document.querySelector('#invoicesTable tbody');
  var dialog = document.getElementById('invoiceDialog');
  var dialogContent = document.getElementById('invoiceDetailContent');
  var btnCloseDialog = document.getElementById('closeInvoiceDialog');

  // Change item structure to have product and quantity fields
  var invoices = [
    { id: 'INV-1021', items: [ { name: 'Cotton T-Shirt', qty: 2 }, { name: 'Kids Romper', qty: 1 } ], date: '2024-06-10', amount: 34.99, status: 'paid' },
    { id: 'INV-1031', items: [ { name: 'Winter Jacket', qty: 1 } ], date: '2024-06-12', amount: 39.95, status: 'unpaid' },
    { id: 'INV-1042', items: [ { name: 'Kids Romper', qty: 2 } ], date: '2024-06-14', amount: 19.98, status: 'paid' },
    { id: 'INV-1060', items: [ { name: 'Cotton T-Shirt', qty: 1 }, { name: 'Winter Jacket', qty: 2 } ], date: '2024-06-20', amount: 92.40, status: 'paid' }
  ];

  function fmtAmt(n){ return '₹' + Number(n).toFixed(2); }

  function render(list){
    if (!tableBody) return;
    tableBody.innerHTML = '';
    list.forEach(function(inv, idx){
      var tr = document.createElement('tr');
      // itemsStr is only product names, and qtyStr is all quantities joined
      var itemsStr = inv.items.map(x=>x.name).join('<br>');
      var qtyStr = inv.items.map(x=>x.qty).join('<br>');
      tr.innerHTML =
        '<td>'+inv.id+'</td>'+
        '<td>'+itemsStr+'</td>'+
        '<td>'+qtyStr+'</td>'+
        '<td>'+inv.date+'</td>'+
        '<td>'+fmtAmt(inv.amount)+'</td>'+
        '<td><span class="status-chip ' + inv.status + '">'+inv.status.charAt(0).toUpperCase()+inv.status.slice(1)+'</span></td>'+
        '<td>'+
          '<a href="#" class="action-btn-small view" data-view="'+idx+'" title="View invoice...">View</a>'+
        '</td>';
      tableBody.appendChild(tr);
    });

    // Bind View actions
    tableBody.querySelectorAll('a[data-view]').forEach(function(b){
      b.addEventListener('click', function(){
        var idx = parseInt(b.getAttribute('data-view'),10);
        var inv = list[idx];
        if (!inv) return;
        if (dialogContent) {
          dialogContent.innerHTML =
            '<div><strong>Invoice ID:</strong> '+inv.id+'</div>'+
            '<div style="margin:7px 0 2px 0;"><strong>Date:</strong> '+inv.date+'</div>'+
            '<div><strong>Status:</strong> <span class="chip chip-'+inv.status+'">'+inv.status.charAt(0).toUpperCase()+inv.status.slice(1)+'</span></div>'+
            '<div style="margin:11px 0 3px 0;"><strong>Items:</strong></div>'+
            '<ul style="padding-left:18px;">'+inv.items.map(function(x){ return '<li>'+x.name+' &times; '+x.qty+'</li>'; }).join('')+'</ul>'+
            '<div style="margin-top:8px;"><strong>Total Amount:</strong> '+fmtAmt(inv.amount)+'</div>';
        }
        if (dialog) { dialog.removeAttribute('hidden'); dialog.style.display = ''; }
      });
    });
  }

  render(invoices);

  // Dialog close
  if (btnCloseDialog) btnCloseDialog.addEventListener('click', function(){ if(dialog){ dialog.setAttribute('hidden',''); dialog.style.display = 'none'; }});
})();

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

  // Real invoices data will be loaded from API
  var invoices = [];

  function fmtAmt(n){ return '₹' + Number(n).toFixed(2); }

  // Load real invoice data from API
  async function loadInvoiceData() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('No token found for invoice data');
        return;
      }

      // Fetch vendor orders (these become invoices)
      const response = await fetch('/api/vendor/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const orders = data.orders || [];

      // Convert orders to invoice format
      invoices = orders.map(order => ({
        id: order.orderNumber || order._id.slice(-8),
        items: order.items.map(item => ({
          name: item.productId.name,
          qty: item.quantity
        })),
        date: new Date(order.createdAt).toISOString().split('T')[0],
        amount: order.totalAmount,
        status: getInvoiceStatus(order.status),
        orderId: order._id
      }));

      // Update summary cards
      updateSummaryCards();
      
      // Render the table
      render(invoices);

    } catch (error) {
      console.error('Error loading invoice data:', error);
      // Show error message or fallback data
      updateSummaryCards();
      render([]);
    }
  }

  // Convert order status to invoice status
  function getInvoiceStatus(orderStatus) {
    const statusMap = {
      'pending': 'unpaid',
      'confirmed': 'unpaid', 
      'processing': 'unpaid',
      'shipped': 'paid',
      'delivered': 'paid',
      'cancelled': 'unpaid'
    };
    return statusMap[orderStatus] || 'unpaid';
  }

  // Update summary cards with real data
  function updateSummaryCards() {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const pendingInvoices = invoices.filter(inv => inv.status === 'unpaid').length;
    const totalValue = invoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Update metric cards using IDs
    const totalCard = document.getElementById('total-invoices');
    const paidCard = document.getElementById('paid-invoices');
    const pendingCard = document.getElementById('pending-invoices');
    const valueCard = document.getElementById('total-value');

    if (totalCard) totalCard.textContent = totalInvoices;
    if (paidCard) paidCard.textContent = paidInvoices;
    if (pendingCard) pendingCard.textContent = pendingInvoices;
    if (valueCard) valueCard.textContent = fmtAmt(totalValue);
  }

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

  // Load invoice data when page loads
  document.addEventListener('DOMContentLoaded', function() {
    loadInvoiceData();
  });

  // Dialog close
  if (btnCloseDialog) btnCloseDialog.addEventListener('click', function(){ if(dialog){ dialog.setAttribute('hidden',''); dialog.style.display = 'none'; }});
})();

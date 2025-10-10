// Reports page logic (mock data)
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

  // Profile dropdown logic for Reports page
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

  // MOCK DATA
  const sales = [
    { date: '2024-06-11', amount: 50, orders: 3, products: { 'Cotton T-Shirt':2, 'Kids Romper':1 } },
    { date: '2024-06-12', amount: 112.5, orders: 5, products: { 'Cotton T-Shirt':3, 'Winter Jacket':2 } },
    { date: '2024-06-13', amount: 78, orders: 4, products: { 'Kids Romper':2, 'Winter Jacket':2 } },
    { date: '2024-06-14', amount: 123.5, orders: 6, products: { 'Cotton T-Shirt':4, 'Kids Romper':1, 'Winter Jacket':1 } },
    { date: '2024-06-15', amount: 65, orders: 3, products: { 'Kids Romper':2, 'Winter Jacket':1 } },
    { date: '2024-06-16', amount: 94, orders: 6, products: { 'Cotton T-Shirt':2, 'Kids Romper':2, 'Winter Jacket':2 } },
    { date: '2024-06-17', amount: 137, orders: 8, products: { 'Cotton T-Shirt':5, 'Kids Romper':2, 'Winter Jacket':1 } }
  ];
  const allProducts = [
    { name: 'Cotton T-Shirt', units: 18, revenue: 450, stock: 9 },
    { name: 'Kids Romper', units: 11, revenue: 110, stock: 4 },
    { name: 'Winter Jacket', units: 8, revenue: 320, stock: 2 },
    { name: 'Raincoat', units: 0, revenue: 0, stock: 5 }
  ];
  const invoices = [
    { id: 'INV-101', amount: 56, status: 'paid', date: '2024-06-10', due: '2024-06-15' },
    { id: 'INV-102', amount: 89.5, status: 'unpaid', date: '2024-06-12', due: '2024-06-18' },
    { id: 'INV-103', amount: 120.9, status: 'paid', date: '2024-06-13', due: '2024-06-16' },
    { id: 'INV-104', amount: 39, status: 'unpaid', date: '2024-06-14', due: '2024-06-19' },
    { id: 'INV-105', amount: 36.99, status: 'paid', date: '2024-06-14', due: '2024-06-15' },
    { id: 'INV-106', amount: 60, status: 'unpaid', date: '2024-06-14', due: '2024-06-15' }
  ];
  const today = '2024-06-17';
  const customers = [
    { name: 'Alice', orders: 6, revenue: 410, type: 'returning' },
    { name: 'Bob', orders: 2, revenue: 56, type: 'new' },
    { name: 'Carlos', orders: 2, revenue: 86, type: 'returning' },
    { name: 'Nina', orders: 1, revenue: 42, type: 'new' },
    { name: 'Leah', orders: 1, revenue: 59, type: 'new' },
  ];
  function $id(id){ return document.getElementById(id); }
  function fmt(n){ return '₹'+Number(n).toFixed(2); }
  // KPIs
  const totalSales = sales.reduce((a,b)=>a+b.amount,0);
  const totalOrders = sales.reduce((a,b)=>a+b.orders,0);
  const revenue = totalSales;
  const aov = totalOrders ? (totalSales/totalOrders) : 0;
  // Top product
  let prodQty = {};
  sales.forEach(d=>{Object.entries(d.products).forEach(([k,v])=>{prodQty[k]=(prodQty[k]||0)+v;});});
  let topProd = Object.keys(prodQty).sort((a,b)=>prodQty[b]-prodQty[a])[0]||'-';
  // Update KPI cards with proper formatting
  $id('kpi-total-sales').textContent = fmt(totalSales);
  $id('kpi-orders').textContent = totalOrders;
  $id('kpi-revenue').textContent = fmt(revenue);
  $id('kpi-aov').textContent = fmt(aov);

  // Render Top Selling Products
  const topProductsTable = document.querySelector('#r-top-products tbody');
  if (topProductsTable) {
    topProductsTable.innerHTML = '';
    allProducts.sort((a, b) => b.units - a.units).forEach(product => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${product.name}</strong></td>
        <td>${product.units}</td>
        <td>${fmt(product.revenue)}</td>
      `;
      topProductsTable.appendChild(row);
    });
  }

  // Render Future Best Sellers
  const futureBestSellers = document.querySelector('#future-bestsellers .future-predict-list');
  if (futureBestSellers) {
    futureBestSellers.innerHTML = '';
    const bestSellers = allProducts.filter(p => p.units > 0).sort((a, b) => b.units - a.units).slice(0, 3);
    bestSellers.forEach(product => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${product.name}</strong> - ${product.units} units sold`;
      futureBestSellers.appendChild(li);
    });
  }

  // Render Future Poor Sellers
  const futurePoorSellers = document.querySelector('#future-nosell .future-predict-list');
  if (futurePoorSellers) {
    futurePoorSellers.innerHTML = '';
    const poorSellers = allProducts.filter(p => p.units === 0 || p.stock > 5);
    poorSellers.forEach(product => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${product.name}</strong> - ${product.units} units sold (${product.stock} in stock)`;
      futurePoorSellers.appendChild(li);
    });
  }

  // Render Inventory Insights (Updated for new structure)
  const lowStock = allProducts.filter(p => p.stock <= 3);
  const fastMoving = allProducts.filter(p => p.units > 5);
  const inactive = allProducts.filter(p => p.units === 0);

  // Update inventory insight counts
  const lowStockCountEl = document.getElementById('low-stock-count');
  const fastMovingCountEl = document.getElementById('fast-moving-count');
  const inactiveCountEl = document.getElementById('inactive-count');

  if (lowStockCountEl) lowStockCountEl.textContent = lowStock.length;
  if (fastMovingCountEl) fastMovingCountEl.textContent = fastMoving.length;
  if (inactiveCountEl) inactiveCountEl.textContent = inactive.length;

  // Render Customer Insights (Updated for new structure)
  const newCustomers = customers.filter(c => c.type === 'new').length;
  const returningCustomers = customers.filter(c => c.type === 'returning').length;
  const customerRetention = customers.length ? ((returningCustomers / customers.length) * 100) : 0;

  // Update customer metrics
  const newCustomersEl = document.getElementById('cust-new');
  const returningCustomersEl = document.getElementById('cust-ret');
  const retentionEl = document.getElementById('cust-retention');

  if (newCustomersEl) newCustomersEl.textContent = newCustomers;
  if (returningCustomersEl) returningCustomersEl.textContent = returningCustomers;
  if (retentionEl) retentionEl.textContent = Math.round(customerRetention) + '%';

  // Sales Trend Chart
  const chartLabels = sales.map(s=>s.date);
  const chartData = sales.map(s=>s.amount);
  const ctx = $id('salesTrendChart').getContext('2d');
  if(window.Chart){
    new window.Chart(ctx,{
      type:'bar',data:{labels:chartLabels,datasets:[{data:chartData,label:'Sales',backgroundColor:'#0ea5e9',borderRadius:10}]},options:{scales:{y:{beginAtZero:true}},plugins:{legend:{display:false}}}
    });
  }else { // Fallback
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.fillStyle="#dbeafe"; let max=Math.max(...chartData,1), W=ctx.canvas.width/(chartData.length+1), mx=ctx.canvas.height-18;
    chartData.forEach((v,i)=>{ let h=v/max*mx; ctx.fillRect((i+0.5)*W,mx-h, W*0.6, h); ctx.fillStyle='#333'; ctx.fillText(v,(i+0.5)*W, mx-h-6); ctx.fillStyle="#dbeafe"; });
    ctx.font='13px Arial'; ctx.fillStyle='#0ea5e9'; chartLabels.forEach((d,i)=>ctx.fillText(d,(i+0.5)*W,ctx.canvas.height-4));
  }

  // Export functionality
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      // Create CSV content
      let csvContent = 'Report Type,Value\n';
      csvContent += `Total Sales,${fmt(totalSales)}\n`;
      csvContent += `Total Orders,${totalOrders}\n`;
      csvContent += `Revenue,${fmt(revenue)}\n`;
      csvContent += `Average Order Value,${fmt(aov)}\n`;
      csvContent += `Top Product,${topProd}\n\n`;
      
      csvContent += 'Product,Units Sold,Revenue,Stock\n';
      allProducts.forEach(product => {
        csvContent += `${product.name},${product.units},${fmt(product.revenue)},${product.stock}\n`;
      });
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'business-report.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // --- Future product predictions ---
  // Must run after inventory; before customer insights section.
  function getTrends() {
    // Find all product names
    let prodNames = allProducts.map(p=>p.name);
    let trends = {};
    // Analyze trend for each product by getting units sold in last 3 periods
    prodNames.forEach(function(name){
      let recent = sales.slice(-3).map(day => day.products[name]||0);
      // Trend model: up if last is most and every day >= previous, down if trailing zeros or falling
      // More up-to-date data wins
      if (recent[1] !== undefined && recent[2] !== undefined) {
        if (recent[0] < recent[1] && recent[1] < recent[2] && recent[2] > 0) {
          trends[name]='up';
        } else if (recent[2]===0 && recent[1]===0) {
          trends[name]='nosell';
        } else if (recent[0]>recent[1] && recent[1]>=recent[2]) {
          trends[name]='down';
        }
      } else if (recent[2]===0) { trends[name]='nosell'; }
    });
    return trends;
  }
  var tcardsUp = document.querySelector('#future-bestsellers .future-predict-list');
  var tcardsDown = document.querySelector('#future-nosell .future-predict-list');
  function renderPredictions(){
    let trends = getTrends();
    let ups = Object.entries(trends).filter(([k,v])=>v==='up');
    let downs = Object.entries(trends).filter(([k,v])=>v==='nosell'||v==='down');
    tcardsUp.innerHTML = (ups.length ? ups.map(([k,v])=>`<li><span class="future-trend-up">⬆️</span>${k} <span style='color:#16a34a;margin-left:7px;font-size:13px;'>sales increasing</span></li>`).join('') : '<li>No clear predictions</li>');
    tcardsDown.innerHTML = (downs.length ? downs.map(([k,v])=>`<li><span class="future-trend-down">⬇️</span>${k} <span style='color:#64748b;margin-left:7px;font-size:13px;'>${v==='nosell'?'no units sold':'sales decreasing'}</span></li>`).join('') : '<li>No clear predictions</li>');
  }
  renderPredictions();

  // Customer insights
  const newCust = customers.filter(c=>c.type==='new');
  const retCust = customers.filter(c=>c.type==='returning');
  const topCust = customers.slice().sort((a,b)=>b.revenue-a.revenue)[0]||{};
  $id('r-cust-new').textContent=newCust.length;
  $id('r-cust-ret').textContent=retCust.length;
  $id('r-cust-top').textContent=topCust.name?topCust.name:'-';
  // Pie
  if($id('customerPie').getContext && window.Chart){
    new window.Chart($id('customerPie').getContext('2d'),{
      type:'pie',data:{labels:['New','Returning'],datasets:[{data:[newCust.length, retCust.length],backgroundColor:['#93c5fd','#22d3ee']}]},options:{plugins:{legend:{display:true,position:'bottom'}}}
    });
  }

  // Export (to CSV)
  $id('exportBtn').addEventListener('click',function(){
    let rows=[['Section','Label','Value']];
    rows.push(['Sales Summary','Total Sales',fmt(totalSales)]);
    rows.push(['Sales Summary','Orders',totalOrders]);
    rows.push(['Sales Summary','Revenue',fmt(revenue)]);
    rows.push(['Sales Summary','AOV',fmt(aov)]);
    rows.push(['Sales Summary','Top Product',topProd]);
    sortedProd.forEach(p=>rows.push(['Top Products',p.name,p.units+ ' units / '+fmt(p.revenue)]));
    lowStock.forEach(p=>rows.push(['Low Stock',p.name,p.stock]));
    fastMoving.forEach(p=>rows.push(['Fast Moving',p.name,p.units]));
    inactive.forEach(p=>rows.push(['Inactive',p.name,'No sales']));
    newCust.forEach(c=>rows.push(['Customer New',c.name,fmt(c.revenue)]));
    retCust.forEach(c=>rows.push(['Customer Returning',c.name,fmt(c.revenue)]));
    rows.push(['Top Customer',topCust.name?topCust.name:'-',''+(topCust.revenue||'0')]);
    // CSV
    let csv=rows.map(r=>r.map(x=>(''+x).replace(/\"/g,'"')).join(",")).join("\n");
    let url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    let a=document.createElement('a');a.href=url;a.download='reports.csv';a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
})();

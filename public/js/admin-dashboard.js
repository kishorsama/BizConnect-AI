// Admin Dashboard JavaScript
(function() {
    'use strict';

    // Mock vendor data
    const mockVendors = [
        {
            id: 1,
            name: 'Rajesh Kumar',
            email: 'rajesh@example.com',
            phone: '+91 98765 43210',
            businessName: 'Kumar Electronics',
            businessType: 'Electronics Retail',
            address: '123 MG Road, Bangalore, Karnataka',
            gstNumber: '29ABCDE1234F1Z5',
            panNumber: 'ABCDE1234F',
            documents: ['PAN Card', 'GST Certificate', 'Business License'],
            status: 'pending',
            appliedDate: '2024-01-15',
            businessDescription: 'Leading electronics retailer with 10+ years experience',
            annualTurnover: '₹50,00,000',
            employeeCount: '15',
            website: 'www.kumarelectronics.com'
        },
        {
            id: 2,
            name: 'Priya Sharma',
            email: 'priya@example.com',
            phone: '+91 87654 32109',
            businessName: 'Sharma Fashion House',
            businessType: 'Fashion Retail',
            address: '456 Commercial Street, Mumbai, Maharashtra',
            gstNumber: '27FGHIJ5678G2H6',
            panNumber: 'FGHIJ5678G',
            documents: ['PAN Card', 'GST Certificate', 'Trade License'],
            status: 'pending',
            appliedDate: '2024-01-14',
            businessDescription: 'Premium fashion retailer specializing in ethnic wear',
            annualTurnover: '₹25,00,000',
            employeeCount: '8',
            website: 'www.sharmafashion.com'
        },
        {
            id: 3,
            name: 'Amit Patel',
            email: 'amit@example.com',
            phone: '+91 76543 21098',
            businessName: 'Patel Home Decor',
            businessType: 'Home & Garden',
            address: '789 Sector 17, Chandigarh, Punjab',
            gstNumber: '03KLMNO9012L3M7',
            panNumber: 'KLMNO9012L',
            documents: ['PAN Card', 'GST Certificate', 'Business Registration'],
            status: 'approved',
            appliedDate: '2024-01-13',
            businessDescription: 'Modern home decor solutions and furniture',
            annualTurnover: '₹75,00,000',
            employeeCount: '25',
            website: 'www.patelhomedecor.com'
        },
        {
            id: 4,
            name: 'Sunita Singh',
            email: 'sunita@example.com',
            phone: '+91 65432 10987',
            businessName: 'Singh Grocery Store',
            businessType: 'Food & Beverages',
            address: '321 Nehru Place, Delhi, Delhi',
            gstNumber: '07PQRST3456Q4R8',
            panNumber: 'PQRST3456Q',
            documents: ['PAN Card', 'GST Certificate', 'FSSAI License'],
            status: 'rejected',
            appliedDate: '2024-01-12',
            businessDescription: 'Fresh groceries and daily essentials',
            annualTurnover: '₹15,00,000',
            employeeCount: '5',
            website: 'www.singhgrocery.com'
        },
        {
            id: 5,
            name: 'Vikram Reddy',
            email: 'vikram@example.com',
            phone: '+91 54321 09876',
            businessName: 'Reddy Sports Equipment',
            businessType: 'Sports & Recreation',
            address: '654 Brigade Road, Hyderabad, Telangana',
            gstNumber: '36UVWXY7890U5V9',
            panNumber: 'UVWXY7890U',
            documents: ['PAN Card', 'GST Certificate', 'Business License'],
            status: 'pending',
            appliedDate: '2024-01-11',
            businessDescription: 'Professional sports equipment and fitness gear',
            annualTurnover: '₹40,00,000',
            employeeCount: '12',
            website: 'www.reddysports.com'
        }
    ];

    let currentVendors = [...mockVendors];
    let notifications = [];

    // Initialize the dashboard
    function init() {
        // Protect this page - only 'admin' role is allowed
        Auth.protectPage(['admin']);
        
        // Personalize the page
        const user = Auth.getCurrentUser();
        if (user) {
            document.getElementById('adminUserName').textContent = `Welcome, ${user.name}`;
        }

        // Initialize notifications
        initializeNotifications();
        
        // Initialize modal
        initializeModal();
        
        // Render initial data
        updateStats();
        renderVendorTable();
        updateNotificationCount();
        
        // Setup event listeners
        setupEventListeners();
    }

    // Setup event listeners
    function setupEventListeners() {
        // Filter change
        document.getElementById('statusFilter').addEventListener('change', handleFilterChange);
        
        // Notification bell click
        document.getElementById('notificationBell').addEventListener('click', showNotifications);
        
        // Modal close buttons
        document.getElementById('closeModal').addEventListener('click', closeModal);
        document.getElementById('closeModalBtn').addEventListener('click', closeModal);
        
        // Modal backdrop click
        document.getElementById('vendorDetailModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }

    // Update statistics
    function updateStats() {
        const pending = currentVendors.filter(v => v.status === 'pending').length;
        const approved = currentVendors.filter(v => v.status === 'approved').length;
        const rejected = currentVendors.filter(v => v.status === 'rejected').length;
        const total = currentVendors.length;

        document.getElementById('pendingCount').textContent = pending;
        document.getElementById('approvedCount').textContent = approved;
        document.getElementById('rejectedCount').textContent = rejected;
        document.getElementById('totalVendors').textContent = total;
    }

    // Handle filter change
    function handleFilterChange(e) {
        const filter = e.target.value;
        if (filter === 'all') {
            currentVendors = [...mockVendors];
        } else {
            currentVendors = mockVendors.filter(v => v.status === filter);
        }
        renderVendorTable();
        updateStats();
    }

    // Render vendor table
    function renderVendorTable() {
        const tbody = document.getElementById('vendorTableBody');
        tbody.innerHTML = '';

        currentVendors.forEach(vendor => {
            const row = createVendorRow(vendor);
            tbody.appendChild(row);
        });
    }

    // Create vendor table row
    function createVendorRow(vendor) {
        const row = document.createElement('tr');
        
        // Get initials for avatar
        const initials = vendor.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        row.innerHTML = `
            <td>
                <div class="vendor-info">
                    <div class="vendor-avatar">${initials}</div>
                    <div class="vendor-details">
                        <h4>${vendor.name}</h4>
                        <p>${vendor.email}</p>
                        <p>${vendor.phone}</p>
                    </div>
                </div>
            </td>
            <td>
                <div class="business-details">
                    <h4>${vendor.businessName}</h4>
                    <p>${vendor.businessType}</p>
                    <p>${vendor.address}</p>
                    <p>GST: ${vendor.gstNumber}</p>
                </div>
            </td>
            <td>
                <div class="documents-list">
                    ${vendor.documents.map(doc => `
                        <div class="document-item">
                            <span>📄</span>
                            <span>${doc}</span>
                        </div>
                    `).join('')}
                </div>
            </td>
            <td>
                <span class="status-badge status-${vendor.status}">${vendor.status}</span>
            </td>
            <td>${formatDate(vendor.appliedDate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-view" onclick="viewVendor(${vendor.id})">View</button>
                    ${vendor.status === 'pending' ? `
                        <button class="btn-approve" onclick="approveVendor(${vendor.id})">Approve</button>
                        <button class="btn-reject" onclick="rejectVendor(${vendor.id})">Reject</button>
                    ` : ''}
                </div>
            </td>
        `;
        
        return row;
    }

    // Initialize notifications
    function initializeNotifications() {
        // Add initial notifications for pending vendors
        mockVendors.filter(v => v.status === 'pending').forEach(vendor => {
            addNotification({
                id: Date.now() + Math.random(),
                type: 'vendor_application',
                title: 'New Vendor Application',
                message: `${vendor.name} from ${vendor.businessName} has applied for vendor approval`,
                vendorId: vendor.id,
                timestamp: new Date(),
                read: false
            });
        });
    }

    // Initialize modal
    function initializeModal() {
        const modal = document.getElementById('vendorDetailModal');
        if (modal) {
            modal.hidden = true;
            modal.style.display = 'none';
        }
    }

    // Add notification
    function addNotification(notification) {
        notifications.unshift(notification);
        updateNotificationCount();
    }

    // Update notification count
    function updateNotificationCount() {
        const unreadCount = notifications.filter(n => !n.read).length;
        document.getElementById('notificationCount').textContent = unreadCount;
        
        // Hide count if 0
        const countElement = document.getElementById('notificationCount');
        if (unreadCount === 0) {
            countElement.style.display = 'none';
        } else {
            countElement.style.display = 'block';
        }
    }

    // Show notifications
    function showNotifications() {
        const unreadNotifications = notifications.filter(n => !n.read);
        
        if (unreadNotifications.length === 0) {
            showToast('No new notifications', 'info');
            return;
        }

        // Mark all as read
        notifications.forEach(n => n.read = true);
        updateNotificationCount();

        // Show notification summary
        const vendorNames = unreadNotifications.map(n => {
            const vendor = mockVendors.find(v => v.id === n.vendorId);
            return vendor ? vendor.name : 'Unknown Vendor';
        }).join(', ');

        showToast(`Processed ${unreadNotifications.length} vendor applications: ${vendorNames}`, 'success');
    }

    // View vendor details (shows in modal)
    function viewVendor(vendorId) {
        console.log('Opening modal for vendor:', vendorId);
        const vendor = mockVendors.find(v => v.id === vendorId);
        if (!vendor) {
            console.log('Vendor not found:', vendorId);
            return;
        }

        const modal = document.getElementById('vendorDetailModal');
        const content = document.getElementById('vendorDetailContent');
        
        if (!modal) {
            console.log('Modal element not found');
            return;
        }
        
        content.innerHTML = `
            <div class="vendor-detail-section">
                <h4>👤 Personal Information</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Full Name</div>
                        <div class="detail-value">${vendor.name}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Email Address</div>
                        <div class="detail-value">${vendor.email}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Phone Number</div>
                        <div class="detail-value">${vendor.phone}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">PAN Number</div>
                        <div class="detail-value">${vendor.panNumber}</div>
                    </div>
                </div>
            </div>
            
            <div class="vendor-detail-section">
                <h4>🏢 Business Information</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Business Name</div>
                        <div class="detail-value">${vendor.businessName}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Business Type</div>
                        <div class="detail-value">${vendor.businessType}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">GST Number</div>
                        <div class="detail-value">${vendor.gstNumber}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Website</div>
                        <div class="detail-value">${vendor.website}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Business Address</div>
                        <div class="detail-value">${vendor.address}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Annual Turnover</div>
                        <div class="detail-value">${vendor.annualTurnover}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Employee Count</div>
                        <div class="detail-value">${vendor.employeeCount}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Applied Date</div>
                        <div class="detail-value">${formatDate(vendor.appliedDate)}</div>
                    </div>
                </div>
            </div>
            
            <div class="vendor-detail-section">
                <h4>📝 Business Description</h4>
                <div class="detail-description">${vendor.businessDescription}</div>
            </div>
            
            <div class="vendor-detail-section">
                <h4>📄 Documents Submitted</h4>
                <div class="documents-list">
                    ${vendor.documents.map(doc => `
                        <div class="document-item">
                            <span>📄</span>
                            <span>${doc}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="vendor-detail-section">
                <h4>📊 Application Status</h4>
                <div class="detail-item">
                    <div class="detail-label">Current Status</div>
                    <div class="detail-value" style="background: ${vendor.status === 'pending' ? '#fef3c7' : vendor.status === 'approved' ? '#d1fae5' : '#fee2e2'}; color: ${vendor.status === 'pending' ? '#d97706' : vendor.status === 'approved' ? '#059669' : '#dc2626'}; font-weight: 600; text-transform: uppercase;">
                        ${vendor.status}
                    </div>
                </div>
            </div>
        `;
        
        modal.hidden = false;
        modal.style.display = 'flex';
        console.log('Modal opened successfully');
    }

    // Close modal
    function closeModal() {
        console.log('Closing modal');
        const modal = document.getElementById('vendorDetailModal');
        if (!modal) {
            console.log('Modal element not found for closing');
            return;
        }
        modal.hidden = true;
        modal.style.display = 'none';
        console.log('Modal closed successfully');
    }

    // Approve vendor (called from table)
    function approveVendor(vendorId) {
        const vendor = mockVendors.find(v => v.id === vendorId);
        if (vendor) {
            vendor.status = 'approved';
            updateVendorStatus(vendorId, 'approved');
            
            // Add notification
            addNotification({
                id: Date.now() + Math.random(),
                type: 'vendor_approved',
                title: 'Vendor Approved',
                message: `${vendor.name} from ${vendor.businessName} has been approved`,
                vendorId: vendorId,
                timestamp: new Date(),
                read: false
            });
        }
    }

    // Reject vendor (called from table)
    function rejectVendor(vendorId) {
        const vendor = mockVendors.find(v => v.id === vendorId);
        if (vendor) {
            vendor.status = 'rejected';
            updateVendorStatus(vendorId, 'rejected');
            
            // Add notification
            addNotification({
                id: Date.now() + Math.random(),
                type: 'vendor_rejected',
                title: 'Vendor Rejected',
                message: `${vendor.name} from ${vendor.businessName} has been rejected`,
                vendorId: vendorId,
                timestamp: new Date(),
                read: false
            });
        }
    }

    // Update vendor status
    function updateVendorStatus(vendorId, status) {
        // Update the vendor in the array
        const vendor = mockVendors.find(v => v.id === vendorId);
        if (vendor) {
            vendor.status = status;
        }
        
        // Refresh the display
        const filter = document.getElementById('statusFilter').value;
        if (filter === 'all') {
            currentVendors = [...mockVendors];
        } else {
            currentVendors = mockVendors.filter(v => v.status === filter);
        }
        
        renderVendorTable();
        updateStats();
        
        // Show success message
        showToast(`Vendor ${status} successfully!`, 'success');
    }


    // Format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Show toast notification
    function showToast(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Handle multi-line messages
        if (message.includes('\n')) {
            const lines = message.split('\n');
            lines.forEach(line => {
                const div = document.createElement('div');
                div.textContent = line;
                notification.appendChild(div);
            });
        } else {
            notification.textContent = message;
        }
        
        // Style the notification
        const isDetailedView = message.includes('📋 VENDOR APPLICATION DETAILS');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#1e293b'};
            color: white;
            padding: ${isDetailedView ? '20px' : '12px 20px'};
            border-radius: ${isDetailedView ? '12px' : '6px'};
            font-size: ${isDetailedView ? '13px' : '14px'};
            font-weight: ${isDetailedView ? '400' : '500'};
            z-index: 1001;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: ${isDetailedView ? '500px' : '400px'};
            white-space: pre-line;
            line-height: ${isDetailedView ? '1.6' : '1.4'};
            border: ${isDetailedView ? '1px solid rgba(255,255,255,0.1)' : 'none'};
            font-family: ${isDetailedView ? 'monospace' : 'inherit'};
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after longer duration for detailed views
        const duration = message.includes('📋 VENDOR APPLICATION DETAILS') ? 8000 : message.includes('\n') ? 5000 : 3000;
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Make functions globally available
    window.viewVendor = viewVendor;
    window.approveVendor = approveVendor;
    window.rejectVendor = rejectVendor;

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

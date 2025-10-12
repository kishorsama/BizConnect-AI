// Admin Dashboard JavaScript
(function() {
    'use strict';

    let currentVendors = [];
    let notifications = [];

    // Initialize the dashboard
    async function init() {
        console.log('Initializing admin dashboard...');
        // Protect this page - only 'admin' role is allowed
        Auth.protectPage(['admin']);
        
        // Personalize the page
        const user = Auth.getCurrentUser();
        console.log('Current admin user:', user);
        if (user) {
            document.getElementById('adminUserName').textContent = `Welcome, ${user.name}`;
        }

        // Initialize notifications
        initializeNotifications();
        
        // Initialize modal
        initializeModal();
        
        // Load vendors from API
        console.log('Loading vendors...');
        await loadVendors();
        
        // Render initial data
        updateStats();
        renderVendorTable();
        updateNotificationCount();
        
        // Setup event listeners
        setupEventListeners();
        console.log('Admin dashboard initialized successfully');
    }

    // Load vendors from API
    async function loadVendors() {
        try {
            console.log('Loading vendors from API...');
            const response = await API.get(API_CONFIG.endpoints.adminVendors);
            console.log('API response:', response);
            currentVendors = response.vendors || [];
            console.log('Current vendors:', currentVendors);
            console.log('Vendor IDs:', currentVendors.map(v => ({ name: v.name, id: v._id })));
            
            // Add notifications for pending vendors
            currentVendors.filter(v => v.approvalStatus === 'pending').forEach(vendor => {
                addNotification({
                    id: Date.now() + Math.random(),
                    type: 'vendor_application',
                    title: 'New Vendor Application',
                    message: `${vendor.name} from ${vendor.shopName || 'Unknown Business'} has applied for vendor approval`,
                    vendorId: vendor._id,
                    timestamp: new Date(vendor.createdAt),
                    read: false
                });
            });
        } catch (error) {
            console.error('Error loading vendors:', error);
            showToast('Failed to load vendor applications', 'error');
        }
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
        const pending = currentVendors.filter(v => v.approvalStatus === 'pending').length;
        const approved = currentVendors.filter(v => v.approvalStatus === 'approved').length;
        const rejected = currentVendors.filter(v => v.approvalStatus === 'rejected').length;
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
            // Show all vendors
            renderVendorTable();
        } else {
            // Filter by status
            const filteredVendors = currentVendors.filter(v => v.approvalStatus === filter);
            renderVendorTable(filteredVendors);
        }
        updateStats();
    }

    // Render vendor table
    function renderVendorTable(vendorsToRender = null) {
        console.log('Rendering vendor table...');
        const tbody = document.getElementById('vendorTableBody');
        tbody.innerHTML = '';

        const vendors = vendorsToRender || currentVendors;
        console.log('Vendors to render:', vendors);
        
        vendors.forEach(vendor => {
            const row = createVendorRow(vendor);
            tbody.appendChild(row);
        });
        
        console.log('Vendor table rendered with', vendors.length, 'vendors');
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
                        <p>${vendor.phone || 'N/A'}</p>
                    </div>
                </div>
            </td>
            <td>
                <div class="business-details">
                    <h4>${vendor.shopName || 'N/A'}</h4>
                    <p>${vendor.businessType || 'N/A'}</p>
                    <p>${vendor.address || 'N/A'}</p>
                    <p>GST: ${vendor.gstNumber || 'N/A'}</p>
                </div>
            </td>
            <td>
                <div class="documents-list">
                    ${(vendor.documents && vendor.documents.length > 0) ? vendor.documents.map(doc => `
                        <div class="document-item">
                            <span>📄</span>
                            <span>${doc}</span>
                        </div>
                    `).join('') : '<span class="muted">No documents</span>'}
                </div>
            </td>
            <td>
                <span class="status-badge status-${vendor.approvalStatus}">${vendor.approvalStatus}</span>
            </td>
            <td>${formatDate(vendor.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-view" onclick="viewVendor('${vendor._id}')">View</button>
                    ${vendor.approvalStatus === 'pending' ? `
                        <button class="btn-approve" onclick="approveVendor('${vendor._id}')">Approve</button>
                        <button class="btn-reject" onclick="rejectVendor('${vendor._id}')">Reject</button>
                    ` : ''}
                </div>
            </td>
        `;
        
        return row;
    }

    // Initialize notifications
    function initializeNotifications() {
        // Notifications are now added in loadVendors function
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
            const vendor = currentVendors.find(v => v.id === n.vendorId);
            return vendor ? vendor.name : 'Unknown Vendor';
        }).join(', ');

        showToast(`Processed ${unreadNotifications.length} vendor applications: ${vendorNames}`, 'success');
    }

    // View vendor details (shows in modal)
    function viewVendor(vendorId) {
        console.log('Opening modal for vendor:', vendorId);
        const vendor = currentVendors.find(v => v._id === vendorId);
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
                        <div class="detail-value">${vendor.phone || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">PAN Number</div>
                        <div class="detail-value">${vendor.panNumber || 'N/A'}</div>
                    </div>
                </div>
            </div>
            
            <div class="vendor-detail-section">
                <h4>🏢 Business Information</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Business Name</div>
                        <div class="detail-value">${vendor.shopName || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Business Type</div>
                        <div class="detail-value">${vendor.businessType || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">GST Number</div>
                        <div class="detail-value">${vendor.gstNumber || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Website</div>
                        <div class="detail-value">${vendor.website || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Business Address</div>
                        <div class="detail-value">${vendor.address || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Annual Turnover</div>
                        <div class="detail-value">${vendor.annualTurnover || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Employee Count</div>
                        <div class="detail-value">${vendor.employeeCount || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Applied Date</div>
                        <div class="detail-value">${formatDate(vendor.createdAt)}</div>
                    </div>
                </div>
            </div>
            
            <div class="vendor-detail-section">
                <h4>📝 Business Description</h4>
                <div class="detail-description">${vendor.businessDescription || 'No description provided'}</div>
            </div>
            
            <div class="vendor-detail-section">
                <h4>📄 Documents Submitted</h4>
                <div class="documents-list">
                    ${vendor.aadharFile ? `
                        <div class="document-item" style="background: #f0f8ff; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                <span style="font-size: 1.2rem;">🆔</span>
                                <span style="font-weight: 600; color: #1e40af;">Aadhar Card</span>
                            </div>
                            <div style="font-size: 0.9rem; color: #666;">
                                <div><strong>File:</strong> ${vendor.aadharFile.name}</div>
                                <div><strong>Type:</strong> ${vendor.aadharFile.type}</div>
                                <div><strong>Size:</strong> ${(vendor.aadharFile.size / 1024 / 1024).toFixed(2)} MB</div>
                            </div>
                            <div style="margin-top: 10px;">
                                <button onclick="viewAadharFile('${vendor._id}')" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">
                                    View Aadhar Card
                                </button>
                            </div>
                        </div>
                    ` : '<span class="muted">No Aadhar card uploaded</span>'}
                    
                    ${(vendor.documents && vendor.documents.length > 0) ? vendor.documents.map(doc => `
                        <div class="document-item">
                            <span>📄</span>
                            <span>${doc}</span>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
            
            <div class="vendor-detail-section">
                <h4>📊 Application Status</h4>
                <div class="detail-item">
                    <div class="detail-label">Current Status</div>
                    <div class="detail-value" style="background: ${vendor.approvalStatus === 'pending' ? '#fef3c7' : vendor.approvalStatus === 'approved' ? '#d1fae5' : '#fee2e2'}; color: ${vendor.approvalStatus === 'pending' ? '#d97706' : vendor.approvalStatus === 'approved' ? '#059669' : '#dc2626'}; font-weight: 600; text-transform: uppercase;">
                        ${vendor.approvalStatus}
                    </div>
                </div>
                ${vendor.rejectionReason ? `
                    <div class="detail-item">
                        <div class="detail-label">Rejection Reason</div>
                        <div class="detail-value">${vendor.rejectionReason}</div>
                    </div>
                ` : ''}
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
    async function approveVendor(vendorId) {
        console.log('Approving vendor with ID:', vendorId);
        try {
            const response = await API.put(`${API_CONFIG.endpoints.adminVendors}/${vendorId}/approve`);
            
            // Update local vendor data
            const vendor = currentVendors.find(v => v._id === vendorId);
            if (vendor) {
                vendor.approvalStatus = 'approved';
                vendor.approvedAt = new Date();
            }
            
            // Refresh the display
            renderVendorTable();
            updateStats();
            
            // Add notification
            addNotification({
                id: Date.now() + Math.random(),
                type: 'vendor_approved',
                title: 'Vendor Approved',
                message: `${vendor.name} from ${vendor.shopName || 'Unknown Business'} has been approved`,
                vendorId: vendorId,
                timestamp: new Date(),
                read: false
            });
            
            showToast('Vendor approved successfully!', 'success');
        } catch (error) {
            console.error('Error approving vendor:', error);
            showToast('Failed to approve vendor', 'error');
        }
    }

    // Reject vendor (called from table)
    async function rejectVendor(vendorId) {
        console.log('Rejecting vendor with ID:', vendorId);
        const rejectionReason = prompt('Please provide a reason for rejection (optional):');
        
        try {
            const response = await API.put(`${API_CONFIG.endpoints.adminVendors}/${vendorId}/reject`, {
                rejectionReason: rejectionReason || 'Application rejected'
            });
            
            // Update local vendor data
            const vendor = currentVendors.find(v => v._id === vendorId);
            if (vendor) {
                vendor.approvalStatus = 'rejected';
                vendor.rejectionReason = rejectionReason || 'Application rejected';
                vendor.approvedAt = new Date();
            }
            
            // Refresh the display
            renderVendorTable();
            updateStats();
            
            // Add notification
            addNotification({
                id: Date.now() + Math.random(),
                type: 'vendor_rejected',
                title: 'Vendor Rejected',
                message: `${vendor.name} from ${vendor.shopName || 'Unknown Business'} has been rejected`,
                vendorId: vendorId,
                timestamp: new Date(),
                read: false
            });
            
            showToast('Vendor rejected successfully!', 'success');
        } catch (error) {
            console.error('Error rejecting vendor:', error);
            showToast('Failed to reject vendor', 'error');
        }
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

    // View Aadhar file
    function viewAadharFile(vendorId) {
        const vendor = currentVendors.find(v => v._id === vendorId);
        if (!vendor || !vendor.aadharFile) {
            showToast('Aadhar file not found', 'error');
            return;
        }

        // Create a new window/tab to view the file
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
            <html>
                <head>
                    <title>Aadhar Card - ${vendor.name}</title>
                    <style>
                        body { 
                            margin: 0; 
                            padding: 20px; 
                            font-family: Arial, sans-serif; 
                            background: #f5f5f5;
                        }
                        .container {
                            max-width: 800px;
                            margin: 0 auto;
                            background: white;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 20px;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #e5e7eb;
                        }
                        .file-info {
                            background: #f9fafb;
                            padding: 15px;
                            border-radius: 6px;
                            margin-bottom: 20px;
                        }
                        img, embed {
                            max-width: 100%;
                            height: auto;
                            border: 1px solid #d1d5db;
                            border-radius: 4px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🆔 Aadhar Card Verification</h1>
                            <p><strong>Vendor:</strong> ${vendor.name} | <strong>Shop:</strong> ${vendor.shopName}</p>
                        </div>
                        
                        <div class="file-info">
                            <p><strong>File Name:</strong> ${vendor.aadharFile.name}</p>
                            <p><strong>File Type:</strong> ${vendor.aadharFile.type}</p>
                            <p><strong>File Size:</strong> ${(vendor.aadharFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        
                        <div style="text-align: center;">
                            ${vendor.aadharFile.type.startsWith('image/') ? 
                                `<img src="${vendor.aadharFile.data}" alt="Aadhar Card" />` :
                                `<embed src="${vendor.aadharFile.data}" type="${vendor.aadharFile.type}" width="100%" height="600px" />`
                            }
                        </div>
                    </div>
                </body>
            </html>
        `);
        newWindow.document.close();
    }

    // Make functions globally available
    window.viewVendor = viewVendor;
    window.approveVendor = approveVendor;
    window.rejectVendor = rejectVendor;
    window.viewAadharFile = viewAadharFile;

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();


/**
 * Unified Design System Loader
 * This script automatically applies consistent styling across all pages
 * without modifying existing working code
 */

(function() {
    'use strict';
    
    // Check if unified design is already loaded
    if (document.querySelector('link[href*="unified-design.css"]')) {
        return;
    }
    
    // Create and inject the unified design CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/unified-design.css';
    link.type = 'text/css';
    
    // Insert at the beginning of head to allow overrides
    const head = document.head || document.getElementsByTagName('head')[0];
    head.insertBefore(link, head.firstChild);
    
    // Add unified design enhancements
    document.addEventListener('DOMContentLoaded', function() {
        enhanceExistingElements();
        addUnifiedComponents();
    });
    
    function enhanceExistingElements() {
        // Enhance existing buttons
        const buttons = document.querySelectorAll('button, .btn, input[type="button"], input[type="submit"]');
        buttons.forEach(button => {
            if (!button.classList.contains('btn')) {
                button.classList.add('btn');
                
                // Determine button variant based on existing classes or context
                if (button.classList.contains('primary') || button.classList.contains('btn-primary')) {
                    button.classList.add('btn-primary');
                } else if (button.classList.contains('secondary') || button.classList.contains('btn-secondary')) {
                    button.classList.add('btn-secondary');
                } else if (button.classList.contains('success') || button.classList.contains('btn-success')) {
                    button.classList.add('btn-success');
                } else if (button.classList.contains('warning') || button.classList.contains('btn-warning')) {
                    button.classList.add('btn-warning');
                } else if (button.classList.contains('error') || button.classList.contains('btn-error') || button.classList.contains('danger')) {
                    button.classList.add('btn-error');
                } else {
                    button.classList.add('btn-primary');
                }
            }
        });
        
        // Enhance existing cards
        const cards = document.querySelectorAll('.card, .dashboard-card, .product-card');
        cards.forEach(card => {
            if (!card.classList.contains('card')) {
                card.classList.add('card');
            }
        });
        
        // Enhance existing form inputs
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="number"], textarea, select');
        inputs.forEach(input => {
            if (!input.classList.contains('form-input')) {
                input.classList.add('form-input');
            }
        });
        
        // Enhance existing form labels
        const labels = document.querySelectorAll('label');
        labels.forEach(label => {
            if (!label.classList.contains('form-label')) {
                label.classList.add('form-label');
            }
        });
        
        // Enhance existing navigation
        const navbars = document.querySelectorAll('.navbar, nav');
        navbars.forEach(navbar => {
            if (!navbar.classList.contains('navbar')) {
                navbar.classList.add('navbar');
            }
        });
        
        // Enhance existing sidebars
        const sidebars = document.querySelectorAll('.sidebar, .vd-sidebar');
        sidebars.forEach(sidebar => {
            if (!sidebar.classList.contains('sidebar')) {
                sidebar.classList.add('sidebar');
            }
        });
    }
    
    function addUnifiedComponents() {
        // Add loading states to existing elements
        addLoadingStates();
        
        // Add hover effects
        addHoverEffects();
        
        // Add focus management
        addFocusManagement();
        
        // Add responsive enhancements
        addResponsiveEnhancements();
    }
    
    function addLoadingStates() {
        // Add loading states to buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                if (this.type === 'submit' || this.classList.contains('btn-primary')) {
                    this.classList.add('loading');
                    setTimeout(() => {
                        this.classList.remove('loading');
                    }, 2000);
                }
            });
        });
    }
    
    function addHoverEffects() {
        // Add smooth transitions to interactive elements
        const interactiveElements = document.querySelectorAll('.card, .btn, .product-card, .dashboard-card');
        interactiveElements.forEach(element => {
            element.style.transition = 'all 0.2s ease-in-out';
        });
    }
    
    function addFocusManagement() {
        // Improve focus management
        const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href]');
        focusableElements.forEach(element => {
            element.addEventListener('focus', function() {
                this.style.outline = '2px solid var(--primary-500)';
                this.style.outlineOffset = '2px';
            });
            
            element.addEventListener('blur', function() {
                this.style.outline = 'none';
            });
        });
    }
    
    function addResponsiveEnhancements() {
        // Add responsive grid enhancements
        const grids = document.querySelectorAll('.grid, .dashboard-grid, .main-grid');
        grids.forEach(grid => {
            if (!grid.classList.contains('grid')) {
                grid.classList.add('grid');
            }
            
            // Auto-detect grid columns based on children
            const children = grid.children.length;
            if (children <= 2) {
                grid.classList.add('grid-cols-2');
            } else if (children <= 3) {
                grid.classList.add('grid-cols-3');
            } else {
                grid.classList.add('grid-auto-fit');
            }
        });
    }
    
    // Add utility functions for dynamic styling
    window.UnifiedDesign = {
        // Add alert
        showAlert: function(message, type = 'info') {
            const alert = document.createElement('div');
            alert.className = `alert alert-${type}`;
            alert.textContent = message;
            
            const container = document.querySelector('.dashboard-content, .login-container, .register-container') || document.body;
            container.insertBefore(alert, container.firstChild);
            
            setTimeout(() => {
                alert.remove();
            }, 5000);
        },
        
        // Add loading overlay
        showLoading: function() {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="loading loading-lg"></div>';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `;
            
            document.body.appendChild(overlay);
            return overlay;
        },
        
        hideLoading: function(overlay) {
            if (overlay) {
                overlay.remove();
            }
        },
        
        // Enhance existing modal
        enhanceModal: function(modalElement) {
            if (modalElement) {
                modalElement.classList.add('modal');
                
                const header = modalElement.querySelector('.modal-header, .header');
                if (header) header.classList.add('modal-header');
                
                const body = modalElement.querySelector('.modal-body, .body, .content');
                if (body) body.classList.add('modal-body');
                
                const footer = modalElement.querySelector('.modal-footer, .footer');
                if (footer) footer.classList.add('modal-footer');
            }
        }
    };
    
    console.log('🎨 Unified Design System loaded successfully!');
})();

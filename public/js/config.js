// js/config.js

const API_CONFIG = {
  baseURL: '/api', // same-origin API base to avoid CORS issues
  timeout: 10000,
  endpoints: {
    // Auth endpoints
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    getCurrentUser: '/auth/me',
    
    // Product endpoints
    products: '/products',
    vendorProducts: '/vendor/products',
    
    // Cart endpoints
    cart: '/cart',
    addToCart: '/cart/add',
    removeFromCart: '/cart/remove',
    updateCart: '/cart/update',
    
    // Order endpoints
    createOrder: '/orders/create',
    customerOrders: '/orders/customer',
    vendorOrders: '/vendor/orders',
    updateOrderStatus: '/vendor/orders',
    
    // Vendor endpoints
    vendorProfile: '/vendor/profile',
    
    // Admin endpoints
    adminVendors: '/admin/vendors'
  }
};
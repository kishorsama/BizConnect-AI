// js/config.js

const API_CONFIG = {
<<<<<<< HEAD
  baseURL: '/api', // same-origin API base to avoid CORS issues
=======
  baseURL: 'https://bizconnect-ai.onrender.com/api', // same-origin API base to avoid CORS issues
>>>>>>> 51b6fc2876e28e250d13b5c6fc7f4a55df584577
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
    
    // Order endpoints
    createOrder: '/orders/create',
    vendorOrders: '/vendor/orders',
    updateOrderStatus: '/vendor/orders'
  }
};
